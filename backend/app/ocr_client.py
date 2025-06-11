import httpx
import os

OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://ocr:7070/ocr")

async def send_to_ocr(image_bytes: bytes) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(OCR_SERVICE_URL, files={"file": image_bytes})
        return response.json()["text"]
