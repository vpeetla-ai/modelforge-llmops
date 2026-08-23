"""Machine-readable honesty for ModelForge."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from modelforge_llmops.domain.receipts import RECEIPTS_DIR, list_receipts


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    control_plane_mode: Literal["demo", "strict"] = "demo"
    domainforge_url: str | None = None
    llm_gateway_url: str | None = None
    vllm_base_url: str | None = None


class PlaneComponent(BaseModel):
    id: str
    label: str
    status: Literal["ready", "partial", "planned", "external"]
    detail: str


class Posture(BaseModel):
    service: str = "modelforge-llmops"
    mode: Literal["demo", "strict"]
    thesis: str = (
        "Agents decide what to do; ModelForge decides which weights, "
        "where they run, and how we prove it."
    )
    components: list[PlaneComponent] = Field(default_factory=list)
    spine_role: str = (
        "Model Plane flagship (ADR-034) — peer to AegisAI / VAP / Enterprise RAG / Content Factory"
    )
    non_goals: list[str] = Field(
        default_factory=lambda: [
            "Foundation-model pretraining from scratch",
            "Claiming vLLM Architecture Lab Path B as CUDA production",
            "Always-on free-tier GPU",
        ]
    )


def get_settings() -> Settings:
    return Settings()


def build_posture() -> Posture:
    s = get_settings()
    peft_ready = (RECEIPTS_DIR / "peft_gpu.json").exists()
    vllm_ready = (RECEIPTS_DIR / "vllm_cuda.json").exists()
    slm_ready = (RECEIPTS_DIR / "slm_bakeoff.md").exists()
    # Touch list_receipts so gallery stays source of truth for published IDs
    _ = list_receipts()

    return Posture(
        mode=s.control_plane_mode,
        components=[
            PlaneComponent(
                id="api",
                label="ModelForge API",
                status="ready",
                detail="health + posture + receipts gallery",
            ),
            PlaneComponent(
                id="peft",
                label="PEFT / DomainForge",
                status="ready" if peft_ready else "partial",
                detail=(
                    "GPU receipt published"
                    if peft_ready
                    else "DomainForge ladder live; GPU receipt pending (Phase 2)"
                ),
            ),
            PlaneComponent(
                id="vllm_cuda",
                label="CUDA vLLM serve",
                status="ready" if vllm_ready else "planned",
                detail=(
                    "Upstream vLLM metrics receipt on file"
                    if vllm_ready
                    else "Compose + metrics in Phase 3 — lab Path B is educational only"
                ),
            ),
            PlaneComponent(
                id="slm_bakeoff",
                label="SLM bake-off",
                status="ready" if slm_ready else "planned",
                detail=(
                    "Published 3B/7B vs API table"
                    if slm_ready
                    else "Golden suite + memo in Phase 4"
                ),
            ),
            PlaneComponent(
                id="gateway",
                label="LLM gateway bridge",
                status="external" if s.llm_gateway_url else "partial",
                detail=s.llm_gateway_url or "Set LLM_GATEWAY_URL to probe aegis-llm-gateway",
            ),
            PlaneComponent(
                id="domainforge",
                label="DomainForge probe",
                status="external" if s.domainforge_url else "partial",
                detail=s.domainforge_url or "Set DOMAINFORGE_URL to probe PEFT API",
            ),
        ],
    )
