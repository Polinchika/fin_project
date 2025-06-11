from fastapi import FastAPI, UploadFile, File
from ocr_client import send_to_ocr
from db import save_result

app = FastAPI()

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    contents = await file.read()
    text = await send_to_ocr(contents)
    result = save_result(file.filename, text)
    return {"filename": file.filename, "text": text}

@app.get("/ping")
def ping():
    return {"message": "pong"}