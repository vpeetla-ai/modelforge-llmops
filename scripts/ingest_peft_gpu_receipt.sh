#!/usr/bin/env bash
# Ingest a Colab/RunPod PEFT GPU receipt into ModelForge trees + validate.
# Usage:
#   bash scripts/ingest_peft_gpu_receipt.sh /path/to/peft_gpu.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:?path to peft_gpu.json required}"

python3 - <<PY
import json, sys
from pathlib import Path
src = Path("$SRC")
blob = json.loads(src.read_text())
errs = []
if blob.get("status") != "gpu":
    errs.append(f"status must be gpu, got {blob.get('status')}")
if blob.get("cuda") is not True:
    errs.append("cuda must be true")
model = str(blob.get("base_model") or "")
for bad in ("tiny-gpt2", "sshleifer/tiny", "hf-internal-testing"):
    if bad in model.lower():
        errs.append(f"forbidden smoke base_model: {model}")
if not blob.get("gpu"):
    errs.append("missing gpu SKU")
if "cuda" not in str(blob.get("honesty", "")).lower() and "gpu" not in str(blob.get("honesty", "")).lower():
    errs.append("honesty must mention CUDA/GPU")
metrics = blob.get("metrics") or {}
if "S0_schema_pass" not in metrics or "S3_schema_pass" not in metrics:
    errs.append("metrics must include S0_schema_pass and S3_schema_pass")
if errs:
    print("INGEST REJECTED:")
    for e in errs:
        print(" -", e)
    sys.exit(1)
print("pre-check OK:", src)
PY

mkdir -p "$ROOT/docs/receipts" "$ROOT/ui/public/receipts"
cp "$SRC" "$ROOT/docs/receipts/peft_gpu.json"
cp "$SRC" "$ROOT/ui/public/receipts/peft_gpu.json"
python3 "$ROOT/scripts/validate_receipts.py"
echo "Ingested peft_gpu.json — commit, push, vercel --prod"
echo "Still required for 100%: docs/receipts/vllm_cuda.json via RunPod one_shot"
