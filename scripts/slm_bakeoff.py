#!/usr/bin/env python3
"""SLM vs API bake-off runner — schema pass + latency. Writes markdown receipt draft."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]
GOLDEN = ROOT / "data" / "slm_golden.json"
OUT = ROOT / "docs" / "receipts" / "slm_bakeoff.md"


def load_cases() -> list[dict]:
    return json.loads(GOLDEN.read_text())


def call_openai_compatible(base: str, model: str, prompt: str, api_key: str | None) -> tuple[str, float]:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    t0 = time.perf_counter()
    with httpx.Client(timeout=60.0) as client:
        r = client.post(
            f"{base.rstrip('/')}/v1/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0,
            },
        )
        r.raise_for_status()
        text = r.json()["choices"][0]["message"]["content"]
    return text, time.perf_counter() - t0


def schema_pass(text: str, keys: list[str]) -> bool:
    if not keys:
        return len(text.split()) <= 80
    try:
        start, end = text.find("{"), text.rfind("}")
        if start < 0 or end < 0:
            return False
        obj = json.loads(text[start : end + 1])
        return all(k in obj for k in keys)
    except json.JSONDecodeError:
        return False


def main() -> None:
    p = argparse.ArgumentParser(description="Run SLM bake-off golden suite")
    p.add_argument("--base-url", default="http://127.0.0.1:11434", help="OpenAI-compatible base")
    p.add_argument("--model", required=True)
    p.add_argument("--api-key", default=None)
    p.add_argument("--label", default=None, help="Row label in receipt table")
    args = p.parse_args()

    label = args.label or args.model
    rows = []
    for case in load_cases():
        text, latency = call_openai_compatible(args.base_url, args.model, case["prompt"], args.api_key)
        ok = schema_pass(text, case.get("expect_keys") or [])
        rows.append(
            {
                "id": case["id"],
                "pass": ok,
                "latency_s": round(latency, 3),
                "preview": text.replace("\n", " ")[:120],
            }
        )

    passed = sum(1 for r in rows if r["pass"])
    lines = [
        f"# SLM bake-off receipt — {label}",
        "",
        f"- model: `{args.model}`",
        f"- base: `{args.base_url}`",
        f"- schema/pass: **{passed}/{len(rows)}**",
        f"- mean latency_s: **{sum(r['latency_s'] for r in rows) / max(len(rows), 1):.3f}**",
        "",
        "| case | pass | latency_s | preview |",
        "|------|------|-----------|---------|",
    ]
    for r in rows:
        lines.append(f"| {r['id']} | {r['pass']} | {r['latency_s']} | {r['preview']} |")
    lines += [
        "",
        "## Decision notes",
        "",
        "- Prefer SLM when schema_pass ≥ API and p50 latency / $ wins for private data.",
        "- Prefer API when long-context reasoning dominates and data class allows cloud.",
        "",
    ]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    prev = OUT.read_text() if OUT.exists() else "# SLM vs API bake-off\n\n"
    OUT.write_text(prev.rstrip() + "\n\n" + "\n".join(lines) + "\n")
    print(f"wrote {OUT} ({passed}/{len(rows)} pass)")


if __name__ == "__main__":
    main()
