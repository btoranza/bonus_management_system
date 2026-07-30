from contextlib import asynccontextmanager

from fastapi import FastAPI

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Bonus Management System API"}

@app.get("/salespeople")
async def get_salespeople():
    salespeople = await db.salespeople.find().to_list(length=100)

    for salesperson in salespeople:
        salesperson["_id"] = str(salesperson["_id"])

    return salespeople