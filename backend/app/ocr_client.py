import httpx
import os

OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://ocr:7070/ocr")
OCR_TIMEOUT = httpx.Timeout(connect=10.0, read=90.0, write=90.0, pool=10.0)

async def send_to_ocr(image_bytes: bytes) -> str:
    async with httpx.AsyncClient(timeout=OCR_TIMEOUT) as client:
        response = await client.post(OCR_SERVICE_URL, files={"file": image_bytes})
        response.raise_for_status()
        return response.json()
        
