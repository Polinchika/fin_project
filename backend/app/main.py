from datetime import datetime
from bson import ObjectId

from fastapi import FastAPI, UploadFile, HTTPException, File, Depends, Body
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


@app.put("/results/{result_id}")
async def update_result(
    result_id: str,
    payload: dict = Body(...),
    user=Depends(require_role("user"))
):
    edited_blocks = payload.get("blocks")

    if not isinstance(edited_blocks, list):
        raise HTTPException(status_code=400, detail="blocks must be array")

    full_text = "\n\n".join(
        block.get("text", "") for block in edited_blocks if block.get("text")
    )

    results_collection.update_one(
        {
            "file_id": ObjectId(result_id),
            "user_id": user["sub"]
        },
        {
            "$set": {
                "blocks.blocks": edited_blocks,
                "blocks.full_text": full_text,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {"status": "ok"}


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


def extract_labeled_text(result: dict) -> str:
    if not result:
        return ""
    blocks = result.get("blocks", []).get("blocks", [])
    lines = []
    for block in blocks:
        text = block.get("text")
        label = block.get("label", "text")
        if not text:
            continue
        lines.append(f"{label}: {text.strip()}")
    return "\n".join(lines)

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

    text = extract_labeled_text(result)

    pdf = generate_pdf(
        text=text,
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
    
    values = {}
    for block in result["blocks"]["blocks"]:
        label = block.get("label")
        text = block.get("text")
        if label and text:
            values[label] = text

    docx_file = generate_docx(values=values)

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