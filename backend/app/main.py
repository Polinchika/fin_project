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
    user=Depends(require_role("user"))
):
    contents = await file.read()
    text = await send_to_ocr(contents)

    # result = save_result(file.filename, text)
    results_collection.insert_one({
        "filename": file.filename,
        "text": text,
        "user_id": user["sub"]
    })
    return {"filename": file.filename, "text": text}

@app.get("/results/self")
def get_my_results(user=Depends(require_role("user"))):
    return list(
        results_collection.find(
            {"user_id": user["sub"]},
            {"_id": 0}
        )
    )

@app.get("/results/all")
def get_all_results(user=Depends(require_role("inspector"))):
    return list(
        results_collection.find({}, {"_id": 0})
    )


@app.get("/ping")
def ping():
    return {"message": "pong"}