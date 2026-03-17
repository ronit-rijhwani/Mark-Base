FROM python:3.12-slim

WORKDIR /app

# Install system dependencies needed for opencv-headless and psycopg2
RUN apt-get update && apt-get install -y \
    libpq5 \
    postgresql-client \
    gcc \
    libpq-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use shell form so $PORT is expanded at runtime (Railway sets PORT=8080)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
