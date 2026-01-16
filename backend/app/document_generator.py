from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from docx import Document
from docx.shared import Pt


def generate_pdf(text: str, title: str) -> BytesIO:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 40

    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, title)
    y -= 30

    c.setFont("Helvetica", 10)

    for line in text.splitlines():
        if y < 40:
            c.showPage()
            c.setFont("Helvetica", 10)
            y = height - 40
        c.drawString(40, y, line)
        y -= 14

    c.save()
    buffer.seek(0)
    return buffer


def generate_docx(text: str, title: str) -> BytesIO:
    doc = Document()

    heading = doc.add_heading(title, level=1)
    heading.alignment = 1

    doc.add_paragraph("")

    for line in text.splitlines():
        p = doc.add_paragraph(line)
        p.paragraph_format.space_after = Pt(6)

    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer
