FROM python:3.11-slim

WORKDIR /app
COPY pyproject.toml README.md ./
COPY src ./src
COPY docs ./docs

RUN pip install --no-cache-dir -e .

ENV PORT=8000
EXPOSE 8000
CMD uvicorn modelforge_llmops.api.main:app --host 0.0.0.0 --port ${PORT}
