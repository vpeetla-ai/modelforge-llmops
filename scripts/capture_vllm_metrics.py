#!/usr/bin/env python3
"""Capture OpenAI-compatible vLLM metrics into docs/receipts/vllm_cuda.json."""
from __future__ import annotations

import argparse
import json
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "receipts" / "vllm_cuda.json"


def _cuda_proof(require: bool, smi_log: Path | None) -> dict:
    import subprocess

    cuda = False
    device = None
    try:
        import torch

        cuda = bool(torch.cuda.is_available())
        device = torch.cuda.get_device_name(0) if cuda else None
    except ImportError:
        cuda = False
    if require and not cuda:
        raise SystemExit("CUDA required — refuse vllm_cuda.json without a live GPU")
    smi = ""
    if smi_log and smi_log.exists():
        smi = smi_log.read_text()[:4000]
    elif require:
        try:
            smi = subprocess.check_output(["nvidia-smi"], text=True)[:4000]
        except (FileNotFoundError, subprocess.CalledProcessError):
            smi = ""
    return {"cuda": cuda, "cuda_device": device, "nvidia_smi_excerpt": smi}


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--base-url", default="http://127.0.0.1:8000")
    p.add_argument("--model", default="mistralai/Mistral-7B-Instruct-v0.3")
    p.add_argument("--n", type=int, default=5)
    p.add_argument("--prompt", default='Reply with a one-line JSON object: {"ok": true}')
    p.add_argument("--gpu", default="operator-reported")
    p.add_argument("--require-cuda", action="store_true")
    p.add_argument("--nvidia-smi-log", type=Path, default=None)
    args = p.parse_args()

    proof = _cuda_proof(args.require_cuda, args.nvidia_smi_log)

    ttfts: list[float] = []
    toks: list[float] = []
    with httpx.Client(timeout=120.0) as client:
        models = client.get(f"{args.base_url.rstrip('/')}/v1/models")
        models.raise_for_status()
        for _ in range(args.n):
            t0 = time.perf_counter()
            r = client.post(
                f"{args.base_url.rstrip('/')}/v1/chat/completions",
                json={
                    "model": args.model,
                    "messages": [{"role": "user", "content": args.prompt}],
                    "max_tokens": 32,
                    "temperature": 0,
                },
            )
            r.raise_for_status()
            dt = time.perf_counter() - t0
            body = r.json()
            usage = body.get("usage") or {}
            completion = int(usage.get("completion_tokens") or 0)
            ttfts.append(dt * 1000)
            if completion and dt > 0:
                toks.append(completion / dt)

    receipt = {
        "run_id": f"vllm-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}",
        "status": "published",
        "cuda": bool(proof["cuda"]) if args.require_cuda else False,
        "honesty": "Captured against upstream vLLM OpenAI server — not Architecture Lab Path B.",
        "engine": "vllm",
        "base_model": args.model,
        "gpu": args.gpu,
        "cuda_device": proof.get("cuda_device"),
        "nvidia_smi_excerpt": proof.get("nvidia_smi_excerpt") or "",
        "lora": False,
        "ttft_p50_ms": round(statistics.median(ttfts), 2),
        "ttft_p95_ms": round(sorted(ttfts)[max(0, int(0.95 * len(ttfts)) - 1)], 2),
        "tok_per_s": round(statistics.mean(toks), 2) if toks else None,
        "samples": args.n,
        "base_url": args.base_url,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(receipt, indent=2) + "\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
