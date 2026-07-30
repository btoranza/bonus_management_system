import os

from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if MONGODB_URI is None:
    raise RuntimeError("MONGODB_URI environment variable is not set")