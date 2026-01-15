from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["ocr_db"]
results_collection = db["results"]
users_collection = db["users"]

def save_result(filename, text):
    doc = {"filename": filename, "text": text}
    results_collection.insert_one(doc)
    return doc
