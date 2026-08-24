#!/usr/bin/env bash
# Ingest upstream vLLM CUDA metrics receipt into ModelForge trees + validate.
# Usage:
#   bash scripts/ingest_vllm_cuda_receipt.sh /path/to/vllm_cuda.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:?path to vllm_cuda.json required}"

python3 - <<PY
import json, sys
from pathlib import Path
src = Path("$SRC")
blob = json.loads(src.read_text())
errs = []
if blob.get("status") not in {"published", "gpu", "ready"}:
    errs.append(f"status must be published/gpu/ready, got {blob.get('status')}")
if blob.get("cuda") is not True:
    errs.append("cuda must be true")
if "architecture lab" in str(blob.get("honesty", "")).lower() and "not" not in str(blob.get("honesty", "")).lower():
    errs.append("honesty must not claim Architecture Lab as CUDA without negation")
if blob.get("ttft_p50_ms") is None and blob.get("tok_per_s") is None:
    errs.append("missing ttft_p50_ms / tok_per_s")
engine = str(blob.get("engine", "")).lower()
if engine and engine not in {"vllm", "vllm-openai", "upstream-vllm"}:
    # Allow empty engine from older captures; reject transformers-as-vllm
    if "transformers" in engine:
        errs.append("engine=transformers is not vllm_cuda — use RunPod upstream vLLM capture")
if errs:
    print("INGEST REJECTED:")
    for e in errs:
        print(" -", e)
    sys.exit(1)
print("pre-check OK:", src)
PY

mkdir -p "$ROOT/docs/receipts" "$ROOT/ui/public/receipts"
cp "$SRC" "$ROOT/docs/receipts/vllm_cuda.json"
cp "$SRC" "$ROOT/ui/public/receipts/vllm_cuda.json"
python3 "$ROOT/scripts/validate_receipts.py"
echo "Ingested vllm_cuda.json — commit, push, vercel --prod"
echo "DoD complete when peft_gpu.json is also present"
