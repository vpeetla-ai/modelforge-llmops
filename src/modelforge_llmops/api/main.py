"""ModelForge API — Model Plane posture + receipts."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modelforge_llmops.api.routes import router
from modelforge_llmops.domain.posture import build_posture

app = FastAPI(
    title="ModelForge",
    description="Model Plane flagship — SLM · PEFT · CUDA vLLM · LLMOps",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "modelforge-llmops"}


@app.get("/v1/posture")
def posture() -> dict:
    return build_posture().model_dump()
