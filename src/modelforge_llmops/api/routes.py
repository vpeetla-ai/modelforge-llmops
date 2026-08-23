"""HTTP routes for receipts and plane summary."""

from __future__ import annotations

from fastapi import APIRouter

from modelforge_llmops.domain.receipts import list_receipts, plane_summary

router = APIRouter(prefix="/v1")


@router.get("/receipts")
def receipts() -> dict:
    return {"receipts": [r.model_dump() for r in list_receipts()]}


@router.get("/plane")
def plane() -> dict:
    return plane_summary()
