from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from app.schemas.salesperson import Team

# Fixed target bonus per team at ~100% goal achievement (midpoint of each team's expected range).
TEAM_TARGET_BONUS: dict[Team, Decimal] = {
    Team.ENTERPRISE: Decimal(5500),
    Team.MID_MARKET: Decimal(2750),
    Team.SMB: Decimal(1200),
}

# Enterprise deals are fewer but larger, SMB deals are smaller but more frequent.
TEAM_MONTHLY_GOALS: dict[Team, Decimal] = {
    Team.ENTERPRISE: Decimal(100000),
    Team.MID_MARKET: Decimal(50000),
    Team.SMB: Decimal(20000),
}

# Fixed amount awarded per unique new customer acquired in the period.
NEW_CUSTOMER_BONUS: dict[Team, Decimal] = {
    Team.ENTERPRISE: Decimal(800),
    Team.MID_MARKET: Decimal(500),
    Team.SMB: Decimal(300),
}

# Caps the new-customer bonus so a handful of acquisitions can't outweigh the base bonus.
NEW_CUSTOMER_BONUS_CAP_RATIO = Decimal("0.5")


@dataclass
class BonusBreakdown:
    base_bonus: Decimal
    new_customer_bonus: Decimal
    total_bonus: Decimal


def _achievement_multiplier(
    total_sold: Decimal,
    monthly_goal: Decimal,
) -> Decimal:
    if monthly_goal <= 0:
        return Decimal("1.0")

    if total_sold <= 0:
        return Decimal("0.0")

    achievement = total_sold / monthly_goal

    if achievement < Decimal("0.8"):
        return Decimal("0.4")
    if achievement < Decimal("1.0"):
        return Decimal("0.8")
    if achievement < Decimal("1.2"):
        return Decimal("1.0")
    if achievement < Decimal("1.5"):
        return Decimal("1.3")
    return Decimal("2.0")


def calculate_bonus(
    total_sold: Decimal,
    unique_new_customers: int,
    team: Team,
) -> BonusBreakdown:
    target_bonus = TEAM_TARGET_BONUS[team]
    multiplier = _achievement_multiplier(total_sold, TEAM_MONTHLY_GOALS[team])
    base_bonus = target_bonus * multiplier

    new_customer_bonus = Decimal(unique_new_customers) * NEW_CUSTOMER_BONUS[team]
    max_new_customer_bonus = target_bonus * NEW_CUSTOMER_BONUS_CAP_RATIO
    new_customer_bonus = min(new_customer_bonus, max_new_customer_bonus)

    total_bonus = base_bonus + new_customer_bonus

    quantize = lambda value: value.quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    ).normalize()

    return BonusBreakdown(
        base_bonus=quantize(base_bonus),
        new_customer_bonus=quantize(new_customer_bonus),
        total_bonus=quantize(total_bonus),
    )
