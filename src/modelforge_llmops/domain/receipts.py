"""Receipt gallery — placeholders until Phases 2–4 publish artifacts."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

RECEIPTS_DIR = Path(__file__).resolve().parents[3] / "docs" / "receipts"


class Receipt(BaseModel):
    id: str
    kind: Literal["peft", "vllm_cuda", "slm_bakeoff", "gateway"]
    title: str
    status: Literal["placeholder", "published"]
    summary: str
    path: str | None = None
    links: list[str] = Field(default_factory=list)


def list_receipts() -> list[Receipt]:
    catalog = [
        Receipt(
            id="peft-gpu",
            kind="peft",
            title="QLoRA + DPO GPU receipt",
            status="published" if (RECEIPTS_DIR / "peft_gpu.json").exists() else "placeholder",
            summary="S0 vs S3 vs S4 eval delta after CUDA QLoRA/DPO run (DomainForge).",
            path="docs/receipts/peft_gpu.json" if (RECEIPTS_DIR / "peft_gpu.json").exists() else None,
            links=[
                "https://github.com/vpeetla-ai/domainforge-rag-peft",
                "https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-019-rag-facts-peft-behavior.md",
            ],
        ),
        Receipt(
            id="vllm-cuda",
            kind="vllm_cuda",
            title="Upstream vLLM CUDA + LoRA metrics",
            status="published"
            if (RECEIPTS_DIR / "vllm_cuda.json").exists()
            else "placeholder",
            summary="TTFT / tok/s / VRAM from real vLLM (not Architecture Lab Path B).",
            path="docs/receipts/vllm_cuda.json"
            if (RECEIPTS_DIR / "vllm_cuda.json").exists()
            else None,
            links=[
                "https://github.com/vpeetla-ai/vllm-architecture-lab",
                "https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-022-domainforge-vllm-multi-lora-serving.md",
            ],
        ),
        Receipt(
            id="slm-bakeoff",
            kind="slm_bakeoff",
            title="SLM vs API bake-off",
            status="published"
            if (RECEIPTS_DIR / "slm_bakeoff.md").exists()
            else "placeholder",
            summary="Same golden suite: local 3B/7B vs cloud API — cost, latency, schema pass.",
            path="docs/receipts/slm_bakeoff.md"
            if (RECEIPTS_DIR / "slm_bakeoff.md").exists()
            else None,
            links=["https://github.com/vpeetla-ai/domainforge-rag-peft"],
        ),
        Receipt(
            id="gateway-sample",
            kind="gateway",
            title="Gateway RoutingDecision sample",
            status="placeholder",
            summary="App selects model; aegis-llm-gateway enforces + records (ADR-028/029).",
            links=["https://github.com/vpeetla-ai/aegis-llm-gateway"],
        ),
    ]
    return catalog


def plane_summary() -> dict:
    return {
        "name": "ModelForge",
        "question": "Which weights, where, with what proof?",
        "composes": [
            {"id": "domainforge", "role": "PEFT train + RAG facts"},
            {"id": "vllm-cuda", "role": "Production-shaped serve (Phase 3)"},
            {"id": "vllm-lab", "role": "Educational internals only"},
            {"id": "aegis-llm-gateway", "role": "Enforce + record"},
        ],
        "receipts": [r.model_dump() for r in list_receipts()],
    }
