from fastapi import FastAPI, UploadFile, File, Depends
from users import router as auth_router
from ocr_client import send_to_ocr
from db import results_collection, save_result
from deps import require_role

app = FastAPI(root_path="/api")
app.include_router(auth_router)

@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    user=Depends(require_role("user", "inspector", "admin"))
):
    contents = await file.read()
    text = await send_to_ocr(contents)

    # result = save_result(file.filename, text)
    results_collection.insert_one({
        "filename": file.filename,
        "text": text,
        "owner": user["sub"]
    })
    return {"filename": file.filename, "text": text}

@app.get("/ping")
def ping():
    return {"message": "pong"}