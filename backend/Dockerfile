FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Explicitly install to a path the user will definitely own or have access to
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# IMPORTANT: If you have a local .venv folder, it will be copied and break things.
# Ensure you have a .dockerignore file with .venv listed, or delete it locally.
RUN rm -rf .venv 

RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Change PYTHONPATH to include the global site-packages explicitly
ENV PYTHONPATH=/usr/local/lib/python3.11/site-packages:/app
ENV PATH="/home/appuser/.local/bin:/usr/local/bin:${PATH}"

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]