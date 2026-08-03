"""Seed script for populating MongoDB with realistic salespeople and sales data.

Run with:
    python app/scripts/seed.py

Clears `salespeople` and `sales` collections and regenerates them with
coherent, story-driven data: seasonality, per-salesperson performance
profiles, repeat customers and varied bonus outcomes.
"""

import asyncio
import calendar
import math
import random
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal

from bson import Decimal128

from app.database.client import db

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

Team = Literal["Enterprise", "Mid-Market", "SMB"]
Profile = Literal["top", "good", "average", "low", "new"]
CustomerStatus = Literal["new", "existing"]

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SEED = 42

TEAMS: tuple[Team, ...] = ("Enterprise", "Mid-Market", "SMB")

TEAM_MONTHLY_GOALS: dict[Team, int] = {
    "Enterprise": 100_000,
    "Mid-Market": 50_000,
    "SMB": 20_000,
}

TEAM_SALES_COUNT_RANGE: dict[Team, tuple[int, int]] = {
    "Enterprise": (3, 8),
    "Mid-Market": (5, 10),
    "SMB": (8, 20),
}

TEAM_AMOUNT_RANGE: dict[Team, tuple[float, float]] = {
    "Enterprise": (20_000.0, 80_000.0),
    "Mid-Market": (8_000.0, 20_000.0),
    "SMB": (1_000.0, 5_000.0),
}

TEAM_CUSTOMER_POOL_RANGE: dict[Team, tuple[int, int]] = {
    "Enterprise": (20, 30),
    "Mid-Market": (50, 70),
    "SMB": (150, 200),
}

TEAM_NEW_CUSTOMER_PROBABILITY: dict[Team, float] = {
    "Enterprise": 0.20,
    "Mid-Market": 0.15,
    "SMB": 0.10,
}

TEAM_ABBREVIATION: dict[Team, str] = {
    "Enterprise": "ENT",
    "Mid-Market": "MID",
    "SMB": "SMB",
}

# Each profile's monthly revenue is drawn from a log-normal distribution
# whose MEDIAN is this factor times the salesperson's own individual goal
# (TEAM_MONTHLY_GOALS[team]):
#   - median == 1.0 means exactly a 50/50 chance of beating goal that month
#   - median > 1.0 shifts the odds of beating goal above 50%, but never to 100%
#   - median < 1.0 shifts the odds below 50%, but a lucky big month can still happen
PROFILE_MEDIAN_FACTOR: dict[Profile, float] = {
    "top": 1.5,      # consistently above goal
    "good": 1.25,     # usually above goal
    "average": 1.0,   # ~50/50 every month
    "low": 0.65,      # occasionally beats goal
    "new": 0.4,       # rarely beats goal, still ramping up
}

# Spread (sigma, in log-space) of each profile's monthly revenue distribution.
# Lower sigma = more consistent month to month; higher sigma = more swing.
# Top performers get a tighter sigma on purpose: consistently strong, but
# without wild 300%+ blowout months. Low/new keep a bit more spread so an
# occasional lucky month is still possible.
PROFILE_LOG_SIGMA: dict[Profile, float] = {
    "top": 0.20,
    "good": 0.25,
    "average": 0.30,
    "low": 0.35,
    "new": 0.35,
}

# Hard ceiling on monthly revenue, as a multiple of that month's goal
# (goal * seasonality), regardless of what the log-normal draw produces.
# This guarantees no profile ever posts an absurd, dashboard-breaking month.
PROFILE_MAX_GOAL_MULTIPLE: dict[Profile, float] = {
    "top": 2.2,
    "good": 1.9,
    "average": 1.7,
    "low": 1.3,
    "new": 0.9,
}

# Where in the team's [min, max] monthly sale-count range each profile
# typically falls, expressed as a (low, high) fraction of that range.
PROFILE_COUNT_RANGE_FRACTION: dict[Profile, tuple[float, float]] = {
    "top": (0.75, 1.0),
    "good": (0.55, 0.9),
    "average": (0.35, 0.75),
    "low": (0.15, 0.5),
    "new": (0.0, 0.3),
}

# Random per-deal weight bounds used to split a month's total revenue
# unevenly across that month's individual sales.
DEAL_WEIGHT_RANGE: tuple[float, float] = (0.5, 1.5)

# Per-deal amounts are only soft-clipped (as a sanity floor/ceiling relative
# to the team's typical range) so a rep having a great or a rough month can
# still land outside the "typical" bounds without producing absurd values.
SOFT_CLIP_LOW_FACTOR = 0.3
SOFT_CLIP_HIGH_FACTOR = 2.0

# Month -> seasonality factor (1.0 = baseline volume).
SEASONALITY_BY_MONTH: dict[int, float] = {
    1: 0.8,  # January - post-holiday slowdown
    2: 0.9,  # February
    3: 1.0,  # March
    4: 1.05,  # April
    5: 1.1,  # May
    6: 1.15,  # June
    7: 0.95,  # July - summer slowdown starts
    8: 0.6,  # August - deep summer low
    9: 0.9,  # September - back to business
    10: 1.0,  # October
    11: 1.2,  # November
    12: 1.5,  # December - year-end push
}

PERIOD_START: tuple[int, int] = (2025, 8)
PERIOD_END: tuple[int, int] = (2026, 7)  # inclusive

COMPANY_PREFIXES: list[str] = [
    "Nova", "Atlas", "Lumière", "Horizon", "Vertex", "Solstice", "Aster",
    "Norden", "Ondine", "Kalima", "Solenne", "Brume", "Aurore", "Tangram",
    "Ilios", "Mercure", "Zephyr", "Cristal", "Méridien", "Argenta",
    "Belora", "Cassia", "Delphine", "Elyria", "Fontaine",
]

COMPANY_SUFFIXES: list[str] = [
    "Solutions", "Technologies", "Group", "Industries", "Consulting",
    "Systems", "Partners", "Digital", "Innovations", "Corp", "& Associés",
    "Logistique", "Capital", "Dynamics", "Réseaux",
]

SALESPEOPLE_SEED: list[dict] = [
    # Enterprise
    {"id": 1001, "first_name": "Camille", "last_name": "Durand", "team": "Enterprise", "profile": "top",
     "hire_date": datetime(2021, 3, 15, tzinfo=timezone.utc)},
    {"id": 1002, "first_name": "Pierre", "last_name": "Lefebvre", "team": "Enterprise", "profile": "good",
     "hire_date": datetime(2022, 6, 1, tzinfo=timezone.utc)},
    {"id": 1003, "first_name": "Chloé", "last_name": "Bernard", "team": "Enterprise", "profile": "average",
     "hire_date": datetime(2022, 11, 10, tzinfo=timezone.utc)},
    {"id": 1004, "first_name": "Julien", "last_name": "Moreau", "team": "Enterprise", "profile": "low",
     "hire_date": datetime(2023, 2, 20, tzinfo=timezone.utc)},
    {"id": 1005, "first_name": "Léa", "last_name": "Dubois", "team": "Enterprise", "profile": "new",
     "hire_date": datetime(2026, 3, 2, tzinfo=timezone.utc)},
    # Mid-Market
    {"id": 1006, "first_name": "Antoine", "last_name": "Girard", "team": "Mid-Market", "profile": "top",
     "hire_date": datetime(2020, 9, 5, tzinfo=timezone.utc)},
    {"id": 1007, "first_name": "Manon", "last_name": "Faure", "team": "Mid-Market", "profile": "good",
     "hire_date": datetime(2021, 7, 12, tzinfo=timezone.utc)},
    {"id": 1008, "first_name": "Nicolas", "last_name": "Petit", "team": "Mid-Market", "profile": "average",
     "hire_date": datetime(2022, 4, 18, tzinfo=timezone.utc)},
    {"id": 1009, "first_name": "Sophie", "last_name": "Lambert", "team": "Mid-Market", "profile": "low",
     "hire_date": datetime(2023, 8, 1, tzinfo=timezone.utc)},
    {"id": 1010, "first_name": "Hugo", "last_name": "Simon", "team": "Mid-Market", "profile": "new",
     "hire_date": datetime(2025, 11, 17, tzinfo=timezone.utc)},
    # SMB
    {"id": 1011, "first_name": "Emma", "last_name": "Rousseau", "team": "SMB", "profile": "top",
     "hire_date": datetime(2021, 1, 25, tzinfo=timezone.utc)},
    {"id": 1012, "first_name": "Louis", "last_name": "Martin", "team": "SMB", "profile": "good",
     "hire_date": datetime(2022, 3, 9, tzinfo=timezone.utc)},
    {"id": 1013, "first_name": "Inès", "last_name": "Michel", "team": "SMB", "profile": "average",
     "hire_date": datetime(2022, 10, 3, tzinfo=timezone.utc)},
    {"id": 1014, "first_name": "Thomas", "last_name": "Garcia", "team": "SMB", "profile": "low",
     "hire_date": datetime(2023, 5, 22, tzinfo=timezone.utc)},
    {"id": 1015, "first_name": "Océane", "last_name": "Fontaine", "team": "SMB", "profile": "new",
     "hire_date": datetime(2026, 5, 4, tzinfo=timezone.utc)},
]


@dataclass
class CustomerPool:
    """In-memory pool of customers for a given team, used to keep repeat buyers."""

    team: Team
    customers: list[dict] = field(default_factory=list)
    next_seq: int = 1


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _slugify(text: str) -> str:
    """Strip accents and lowercase text, for building ASCII-safe emails."""
    normalized = unicodedata.normalize("NFKD", text)
    return normalized.encode("ascii", "ignore").decode("ascii").lower()


def _iter_months(start: tuple[int, int], end: tuple[int, int]):
    """Yield (year, month) tuples from start to end, inclusive."""
    year, month = start
    end_year, end_month = end
    while (year, month) <= (end_year, end_month):
        yield year, month
        month += 1
        if month > 12:
            month = 1
            year += 1


def _random_datetime_in_month(year: int, month: int, min_day: int = 1) -> datetime:
    """Return a random UTC datetime within business hours in the given month."""
    days_in_month = calendar.monthrange(year, month)[1]
    start_day = min(min_day, days_in_month)
    day = random.randint(start_day, days_in_month)
    hour = random.randint(8, 18)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return datetime(year, month, day, hour, minute, second, tzinfo=timezone.utc)


def _build_salespeople_documents() -> list[dict]:
    """Build the exact Mongo documents for the salespeople collection."""
    documents = []
    for person in SALESPEOPLE_SEED:
        email = f"{_slugify(person['first_name'])}.{_slugify(person['last_name'])}@acmecorp.com"
        documents.append({
            "salesperson_id": f"SP-{person['id']}",
            "first_name": person["first_name"],
            "last_name": person["last_name"],
            "email": email,
            "team": person["team"],
            "hire_date": person["hire_date"],
            "active": True,
        })
    return documents


def _random_company_name() -> str:
    return f"{random.choice(COMPANY_PREFIXES)} {random.choice(COMPANY_SUFFIXES)}"


def _generate_customer(team: Team, seq: int) -> dict:
    abbreviation = TEAM_ABBREVIATION[team]
    return {
        "customer_id": f"CUST-{abbreviation}-{seq:04d}",
        "customer_name": _random_company_name(),
    }


def _build_initial_customer_pools() -> dict[Team, CustomerPool]:
    """Pre-populate each team's customer pool with a random set of customers."""
    pools: dict[Team, CustomerPool] = {}
    for team in TEAMS:
        min_size, max_size = TEAM_CUSTOMER_POOL_RANGE[team]
        size = random.randint(min_size, max_size)
        customers = [_generate_customer(team, seq) for seq in range(1, size + 1)]
        pools[team] = CustomerPool(team=team, customers=customers, next_seq=size + 1)
    return pools


def _pick_customer(pool: CustomerPool, team: Team) -> tuple[str, str, CustomerStatus]:
    """Pick an existing customer or create a new one, updating the pool in place."""
    is_new = random.random() < TEAM_NEW_CUSTOMER_PROBABILITY[team]
    if is_new:
        customer = _generate_customer(team, pool.next_seq)
        pool.next_seq += 1
        pool.customers.append(customer)
        return customer["customer_id"], customer["customer_name"], "new"

    customer = random.choice(pool.customers)
    return customer["customer_id"], customer["customer_name"], "existing"


def _generate_monthly_sale_count(team: Team, profile: Profile) -> int:
    """Number of deals a salesperson works in a given month.

    Driven by the profile's fractional slice of the team's stated count
    range, so a "top" rep tends to run more deals than a "new" one, but the
    actual revenue-vs-goal outcome is decided separately (see
    `_generate_monthly_amounts`), which is what should vary month to month.
    """
    min_count, max_count = TEAM_SALES_COUNT_RANGE[team]
    span = max_count - min_count
    frac_low, frac_high = PROFILE_COUNT_RANGE_FRACTION[profile]
    range_low = round(min_count + span * frac_low)
    range_high = max(round(min_count + span * frac_high), range_low + 1)
    return random.randint(range_low, range_high)


def _generate_monthly_revenue(team: Team, profile: Profile, seasonality: float) -> float:
    """Draw this salesperson's total revenue for one month.

    Modeled as log-normal so the outcome has real month-to-month randomness:
    the distribution's median is `PROFILE_MEDIAN_FACTOR[profile] * seasonality`
    times their individual goal, with a sigma tuned per profile (tighter for
    consistent top performers, wider for volatile new hires). A hard ceiling
    (`PROFILE_MAX_GOAL_MULTIPLE`) then caps the draw so no month ever looks
    like an absurd outlier on the dashboard.
    """
    goal = TEAM_MONTHLY_GOALS[team]
    month_goal = goal * seasonality
    median_revenue = month_goal * PROFILE_MEDIAN_FACTOR[profile]
    mu = math.log(max(median_revenue, 1.0))
    sigma = PROFILE_LOG_SIGMA[profile]

    revenue = random.lognormvariate(mu, sigma)
    revenue_ceiling = month_goal * PROFILE_MAX_GOAL_MULTIPLE[profile]
    return min(revenue, revenue_ceiling)


def _generate_monthly_amounts(team: Team, profile: Profile, seasonality: float, sale_count: int) -> list[Decimal]:
    """Split a month's total revenue unevenly across that month's deals.

    Each deal's share is only soft-clipped (a wide multiple of the team's
    typical amount range) so individual sales stay plausible without forcing
    every month's total back toward the goal.
    """
    monthly_revenue = _generate_monthly_revenue(team, profile, seasonality)

    weights = [random.uniform(*DEAL_WEIGHT_RANGE) for _ in range(sale_count)]
    weight_total = sum(weights)

    low, high = TEAM_AMOUNT_RANGE[team]
    soft_low = low * SOFT_CLIP_LOW_FACTOR
    soft_high = high * SOFT_CLIP_HIGH_FACTOR

    amounts = []
    for weight in weights:
        raw_amount = monthly_revenue * (weight / weight_total)
        clipped_amount = min(max(raw_amount, soft_low), soft_high)
        amounts.append(Decimal(str(round(clipped_amount, 2))))
    return amounts


def _generate_sales(pools: dict[Team, CustomerPool]) -> list[dict]:
    """Generate every sale document for the whole seeded period."""
    sales: list[dict] = []
    sale_counter = 1
    invoice_counter = 1

    for year, month in _iter_months(PERIOD_START, PERIOD_END):
        seasonality = SEASONALITY_BY_MONTH[month]

        for person in SALESPEOPLE_SEED:
            hire_date = person["hire_date"]
            if (year, month) < (hire_date.year, hire_date.month):
                continue  # Not hired yet.

            team: Team = person["team"]
            profile: Profile = person["profile"]
            pool = pools[team]

            min_day = hire_date.day if (year, month) == (hire_date.year, hire_date.month) else 1
            sale_count = _generate_monthly_sale_count(team, profile)
            amounts = _generate_monthly_amounts(team, profile, seasonality, sale_count)

            for amount in amounts:
                customer_id, customer_name, customer_status = _pick_customer(pool, team)
                sale_date = _random_datetime_in_month(year, month, min_day=min_day)

                sales.append({
                    "sale_id": f"SALE-{sale_counter:06d}",
                    "invoice_number": f"INV-{year}{month:02d}-{invoice_counter:05d}",
                    "customer_id": customer_id,
                    "customer_name": customer_name,
                    "customer_status": customer_status,
                    "salesperson_id": f"SP-{person['id']}",
                    "team": team,
                    "amount": Decimal128(amount),
                    "date": sale_date,
                    "created_at": sale_date,
                    "updated_at": sale_date,
                })
                sale_counter += 1
                invoice_counter += 1

    return sales


def _print_summary(sales: list[dict]) -> None:
    """Print a quick per-salesperson revenue vs. goal summary for sanity checking.

    TEAM_MONTHLY_GOALS is each individual salesperson's own monthly goal (not
    split across the team). This also reports how many worked months each rep
    actually hit their goal, to make the month-to-month variation visible.
    """
    monthly_totals: dict[str, dict[tuple[int, int], Decimal]] = {}
    for sale in sales:
        salesperson_id = sale["salesperson_id"]
        month_key = (sale["date"].year, sale["date"].month)
        amount = sale["amount"].to_decimal()
        person_months = monthly_totals.setdefault(salesperson_id, {})
        person_months[month_key] = person_months.get(month_key, Decimal("0")) + amount

    print("\n--- Resumen de vendedores (vs. goal individual mensual) ---")
    for person in SALESPEOPLE_SEED:
        salesperson_id = f"SP-{person['id']}"
        team: Team = person["team"]
        goal = Decimal(TEAM_MONTHLY_GOALS[team])
        person_months = monthly_totals.get(salesperson_id, {})

        worked_months = len(person_months)
        months_hit = sum(1 for total in person_months.values() if total >= goal)
        total_revenue = sum(person_months.values(), Decimal("0"))
        avg_monthly = total_revenue / worked_months if worked_months else Decimal("0")

        print(
            f"{salesperson_id} ({person['profile']:<7} / {team:<11}): "
            f"promedio mensual {avg_monthly:>11,.2f} (goal {goal:>10,.2f}) -> "
            f"llegó al goal en {months_hit}/{worked_months} meses"
        )


# ---------------------------------------------------------------------------
# Database operations
# ---------------------------------------------------------------------------

async def _clear_collections() -> None:
    await db.salespeople.delete_many({})
    await db.sales.delete_many({})


async def _insert_salespeople(documents: list[dict]) -> None:
    if documents:
        await db.salespeople.insert_many(documents)


async def _insert_sales(documents: list[dict]) -> None:
    if documents:
        await db.sales.insert_many(documents)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def main() -> None:
    random.seed(SEED)

    print("Clearing existing collections...")
    await _clear_collections()

    print("Building and inserting salespeople...")
    salespeople_documents = _build_salespeople_documents()
    await _insert_salespeople(salespeople_documents)
    print(f"Inserted {len(salespeople_documents)} salespeople.")

    print("Building customer pools...")
    pools = _build_initial_customer_pools()
    for team in TEAMS:
        print(f"  {team}: {len(pools[team].customers)} initial customers")

    print("Generating sales...")
    sales_documents = _generate_sales(pools)
    await _insert_sales(sales_documents)
    print(f"Inserted {len(sales_documents)} sales.")

    _print_summary(sales_documents)


if __name__ == "__main__":
    asyncio.run(main())
