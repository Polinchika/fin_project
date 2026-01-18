from datetime import datetime
from bson import ObjectId

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse

from users import router as auth_router
from ocr_client import send_to_ocr
from db import results_collection, users_collection, save_result, fs
from deps import require_role
from document_generator import generate_pdf, generate_docx

app = FastAPI(root_path="/api")
app.include_router(auth_router)

@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    user=Depends(require_role("user"))
):
    file_bytes = await file.read()
    file_id = fs.put(
        file_bytes,
        filename=file.filename,
        content_type=file.content_type
    )

    ocr_result = await send_to_ocr(file_bytes)

    # result = save_result(file.filename, text)
    results_collection.insert_one({
        "file_id": file_id,
        "blocks": ocr_result["blocks"],
        "user_id": user["sub"],
        "created_at": datetime.utcnow()
    })
    return { "result_id": str(file_id), "text": ocr_result["blocks"] }


@app.get("/results/self")
def get_my_results(user=Depends(require_role("user"))):
    results = results_collection.find(
        {"user_id": user["sub"]}
    )
    response = []
    for r in results:
        file_meta = fs.get(r["file_id"])
        response.append({
            "file_id": str(r["file_id"]),
            "filename": file_meta.filename,
            "content_type": file_meta.content_type,
            "created_at": r.get("created_at"),
            "blocks": r.get("blocks", "")
        })
    return response


@app.get("/results/all")
def get_all_results(user=Depends(require_role("inspector"))):
    results = results_collection.find({})
    response = []
    for r in results:
        file_meta = fs.get(r["file_id"])

        uploader = users_collection.find_one(
            {"_id": ObjectId(r["user_id"])},
            {"_id": 0, "username": 1}
        )

        response.append({
            "file_id": str(r["file_id"]),
            "filename": file_meta.filename,
            "content_type": file_meta.content_type,
            "created_at": r.get("created_at"),
            "blocks": r.get("blocks", ""),
            "user_id": r.get("user_id"),
            "username": uploader["username"] if uploader else "unknown"
        })
    return response


@app.get("/files/{file_id}")
def download_file(
    file_id: str,
    user=Depends(require_role("user", "inspector"))
):
    grid_out = fs.get(ObjectId(file_id))
    return StreamingResponse(
        grid_out,
        media_type=grid_out.content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{grid_out.filename}"'
        }
    )


@app.get("/results/{result_id}/document")
def download_document(
    result_id: str,
    user=Depends(require_role("inspector"))
):
    result = results_collection.find_one(
        {"file_id": ObjectId(result_id)}
    )

    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    pdf = generate_pdf(
        text=result.get("ocr_text", ""),
        title="Распознанный документ"
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="ocr_result.pdf"'
        }
    )


@app.get("/results/{result_id}/text_document")
def download_docx(
    result_id: str,
    user=Depends(require_role("inspector"))
):
    result = results_collection.find_one(
        {"file_id": ObjectId(result_id)}
    )

    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    docx_file = generate_docx(
        text=result.get("ocr_text", ""),
        title="Распознанный текст документа"
    )

    return StreamingResponse(
        docx_file,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": 'attachment; filename="ocr_result.docx"'
        }
    )


@app.get("/ping")
def ping():
    return {"message": "pong"}