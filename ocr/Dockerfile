FROM python:3.9-slim

RUN apt-get update && \
    apt-get install -y \
        git \
        curl \
        libgl1 \
        libglib2.0-0 \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install "numpy==1.26.4"

RUN pip install \
    torch==2.1.2 \
    torchvision==0.16.2 \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 600 -r requirements.txt

RUN pip install --force-reinstall --no-deps "numpy==1.26.4"
RUN python -c "import numpy; print(f'NumPy version: {numpy.__version__}')"

ENV PYTHONUNBUFFERED=1

COPY . .
RUN ls -lh models/

CMD ["python", "app.py"]

