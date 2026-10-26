from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import OperationFailure

from app.api.bonus import router as bonus_router
from app.api.customers import router as customers_router
from app.api.dashboard import router as dashboard_router
from app.api.sales import router as sales_router
from app.api.salespeople import router as salespeople_router
from app.database.client import client, db


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting to MongoDB...")

    await db.command("ping")

    # Best-effort: an index that conflicts with an existing one (e.g. a unique
    # index created elsewhere) must not prevent the API from starting.
    for collection, keys in (
        (db.sales, [("date", 1)]),
        (db.sales, [("salesperson_id", 1), ("date", -1)]),
        (db.customers, [("customer_id", 1)]),
    ):
        try:
            await collection.create_index(keys)
        except OperationFailure as exc:
            print(f"Skipping index {keys}: {exc}")

    print("Connected!")

    yield

    client.close()

    print("MongoDB connection closed.")


app = FastAPI(lifespan=lifespan)

# Allows the Vite dev server to call this API during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sales_router)
app.include_router(salespeople_router)
app.include_router(bonus_router)
app.include_router(dashboard_router)
app.include_router(customers_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Bonus Management System API"}
