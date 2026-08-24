#!/usr/bin/env python3
"""Validate ModelForge receipt honesty gates.

Rules:
- peft_smoke.json must NOT claim status=gpu
- peft_gpu.json, if present, must have status=gpu, cuda=true, and non-tiny base_model
- vllm_cuda.json, if present, must have status=published and cuda=true
- Refuse templates masquerading as published GPU receipts
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPTS = ROOT / "docs" / "receipts"
PUBLIC = ROOT / "ui" / "public" / "receipts"
TINY = ("tiny-gpt2", "sshleifer/tiny", "hf-internal-testing")


def _load(path: Path) -> dict:
    return json.loads(path.read_text())


def check_smoke(path: Path) -> list[str]:
    errs: list[str] = []
    if not path.exists():
        return errs
    blob = _load(path)
    if str(blob.get("status", "")).lower() in {"gpu", "published", "ready"}:
        errs.append(f"{path.name}: smoke fixture must not claim status={blob.get('status')}")
    if blob.get("cuda") is True:
        errs.append(f"{path.name}: smoke fixture must not set cuda=true")
    return errs


def check_peft_gpu(path: Path) -> list[str]:
    errs: list[str] = []
    if not path.exists():
        return errs
    blob = _load(path)
    if blob.get("status") != "gpu":
        errs.append(f"{path.name}: expected status=gpu, got {blob.get('status')}")
    if blob.get("cuda") is not True:
        errs.append(f"{path.name}: expected cuda=true (proof of CUDA run)")
    model = str(blob.get("base_model") or blob.get("base_model") or "")
    if any(t in model.lower() for t in TINY):
        errs.append(f"{path.name}: tiny/smoke base_model forbidden for peft_gpu ({model})")
    if not blob.get("gpu"):
        errs.append(f"{path.name}: missing gpu SKU field")
    if "cuda" not in str(blob.get("honesty", "")).lower() and "gpu" not in str(
        blob.get("honesty", "")
    ).lower():
        errs.append(f"{path.name}: honesty text should mention CUDA/GPU")
    return errs


def check_vllm(path: Path) -> list[str]:
    errs: list[str] = []
    if not path.exists():
        return errs
    blob = _load(path)
    if blob.get("status") not in {"published", "gpu", "ready"}:
        errs.append(f"{path.name}: expected published/gpu status, got {blob.get('status')}")
    if blob.get("cuda") is not True:
        errs.append(f"{path.name}: expected cuda=true")
    if "architecture lab" in str(blob.get("honesty", "")).lower() and "not" not in str(
        blob.get("honesty", "")
    ).lower():
        errs.append(f"{path.name}: must not claim Architecture Lab as CUDA without negation")
    if blob.get("ttft_p50_ms") is None and blob.get("tok_per_s") is None:
        errs.append(f"{path.name}: missing TTFT / tok_per_s metrics")
    return errs


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument(
        "--require-gpu",
        action="store_true",
        help="Fail if peft_gpu.json or vllm_cuda.json are missing",
    )
    args = p.parse_args()
    errs: list[str] = []

    for base in (RECEIPTS, PUBLIC):
        errs.extend(check_smoke(base / "peft_smoke.json"))
        errs.extend(check_peft_gpu(base / "peft_gpu.json"))
        errs.extend(check_vllm(base / "vllm_cuda.json"))

    if args.require_gpu:
        for name in ("peft_gpu.json", "vllm_cuda.json"):
            if not (RECEIPTS / name).exists():
                errs.append(f"missing docs/receipts/{name}")
            if not (PUBLIC / name).exists():
                errs.append(f"missing ui/public/receipts/{name}")

    if errs:
        print("Receipt validation FAILED:")
        for e in errs:
            print(f"  - {e}")
        return 1
    print("Receipt validation OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
