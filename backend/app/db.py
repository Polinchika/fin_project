from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["ocr_db"]
collection = db["results"]

def save_result(filename, text):
    doc = {"filename": filename, "text": text}
    collection.insert_one(doc)
    return doc
