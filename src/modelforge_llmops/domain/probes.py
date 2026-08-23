"""Optional live probes for DomainForge / LLM gateway / vLLM."""

from __future__ import annotations

from typing import Any

import httpx

from modelforge_llmops.domain.posture import get_settings


def _probe(url: str | None, path: str = "/health") -> dict[str, Any]:
    if not url:
        return {"configured": False, "ok": False, "detail": "URL not set"}
    target = url.rstrip("/") + path
    try:
        with httpx.Client(timeout=4.0) as client:
            r = client.get(target)
        return {
            "configured": True,
            "ok": r.status_code < 400,
            "status_code": r.status_code,
            "url": target,
            "detail": "reachable" if r.status_code < 400 else f"HTTP {r.status_code}",
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "configured": True,
            "ok": False,
            "url": target,
            "detail": f"unreachable: {exc.__class__.__name__}",
        }


def probe_plane() -> dict[str, Any]:
    s = get_settings()
    return {
        "domainforge": _probe(s.domainforge_url),
        "llm_gateway": _probe(s.llm_gateway_url),
        "vllm": _probe(s.vllm_base_url, path="/v1/models"),
    }
