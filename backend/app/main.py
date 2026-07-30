from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.salespeople import router as salespeople_router
from app.api.sales import router as sales_router
from app.database.client import client, db

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting to MongoDB...")

    await db.command("ping")

    print("Connected!")

    yield

    client.close()

    print("MongoDB connection closed.")


app = FastAPI(lifespan=lifespan)
app.include_router(sales_router)
app.include_router(salespeople_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Bonus Management System API"}
