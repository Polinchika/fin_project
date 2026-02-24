FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        git \
        curl \
        libgl1 \
        libglib2.0-0 \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install "numpy==1.26.4"

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 600 -r requirements.txt

RUN pip install --force-reinstall --no-deps "numpy==1.26.4"

ENV PYTHONUNBUFFERED=1

COPY . .
RUN ls -lh models/

RUN python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('CUDA devices:', torch.cuda.device_count() if torch.cuda.is_available() else 'None')" || echo "PyTorch CUDA check failed"

CMD ["python", "app.py"]

