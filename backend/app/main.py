from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.bonus import router as bonus_router
from app.api.dashboard import router as dashboard_router
from app.api.sales import router as sales_router
from app.api.salespeople import router as salespeople_router
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

# Allows the Vite dev server to call this API during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(sales_router)
app.include_router(salespeople_router)
app.include_router(bonus_router)
app.include_router(dashboard_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Bonus Management System API"}
