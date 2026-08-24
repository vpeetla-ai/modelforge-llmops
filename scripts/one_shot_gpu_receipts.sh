#!/usr/bin/env bash
# One-shot CUDA receipts for ModelForge DoD (PEFT + vLLM).
# Run on a GPU host with sibling clones:
#   ../domainforge-rag-peft
#   ./  (modelforge-llmops)
#
#   export HF_TOKEN=... GPU_SKU="1x A100-40GB"
#   bash scripts/one_shot_gpu_receipts.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DF="${DOMAINFORGE_ROOT:-$ROOT/../domainforge-rag-peft}"
MF="$ROOT"
GPU_SKU="${GPU_SKU:-1x CUDA}"

echo "== ModelForge one-shot GPU receipts =="
echo "DomainForge: $DF"
echo "ModelForge:  $MF"

[[ -d "$DF" ]] || { echo "ERROR: DomainForge not found at $DF (set DOMAINFORGE_ROOT)" >&2; exit 1; }

python3 - <<'PY'
import torch
assert torch.cuda.is_available(), "CUDA required — refuse CPU/smoke shortcuts"
print(f"CUDA OK: {torch.cuda.get_device_name(0)}")
PY

mkdir -p "$MF/docs/receipts" "$MF/ui/public/receipts"
SMI_LOG="$MF/docs/receipts/_nvidia_smi.txt"
nvidia-smi | tee "$SMI_LOG"

echo "== Phase 2: DomainForge CUDA PEFT =="
cd "$DF"
python3 -m pip install -U pip -q
pip install -e ".[train,train-gpu]" -q
bash scripts/gpu_pipeline.sh

S0=$(ls data/eval/results/s0_baseline.json 2>/dev/null || ls data/eval/results/s0*.json 2>/dev/null | head -1)
S3=$(ls data/eval/results/s3_peft_hybrid.json 2>/dev/null || ls data/eval/results/s3*.json 2>/dev/null | head -1)
S4=$(ls data/eval/results/s4_dpo_peft.json 2>/dev/null || ls data/eval/results/s4*.json 2>/dev/null | head -1)
ADAPTER=$(ls -d adapters/s4-dpo 2>/dev/null || ls -d adapters/*dpo* 2>/dev/null | head -1 || true)

[[ -n "${S0:-}" && -n "${S3:-}" && -n "${S4:-}" ]] || {
  echo "ERROR: missing S0/S3/S4 eval JSON under data/eval/results/" >&2
  ls -la data/eval/results/ || true
  exit 1
}

python3 scripts/export_modelforge_receipt.py \
  --s0 "$S0" --s3 "$S3" --s4 "$S4" \
  --adapter-uri "${ADAPTER:-adapters/s4-dpo}" \
  --gpu "$GPU_SKU" \
  --require-cuda \
  --nvidia-smi-log "$SMI_LOG" \
  --sft-examples "${SFT_EXAMPLES:-0}" \
  --dpo-pairs "${DPO_PAIRS:-0}" \
  --out "$MF/docs/receipts/peft_gpu.json"

cp "$MF/docs/receipts/peft_gpu.json" "$MF/ui/public/receipts/peft_gpu.json"

echo "== Phase 3: upstream vLLM CUDA metrics =="
cd "$MF"
if [[ -n "${ADAPTER:-}" ]]; then
  export LORA_ADAPTER_DIR="$DF/$ADAPTER"
fi
docker compose -f docker-compose.vllm.yml up -d
echo "Waiting for vLLM /health ..."
ok=0
for i in $(seq 1 60); do
  if curl -sf http://127.0.0.1:8000/health >/dev/null; then
    echo "vLLM up (attempt $i)"
    ok=1
    break
  fi
  sleep 10
done
[[ "$ok" == "1" ]] || {
  echo "ERROR: vLLM did not become healthy" >&2
  docker compose -f docker-compose.vllm.yml logs --tail=80
  exit 1
}

python3 scripts/capture_vllm_metrics.py \
  --base-url http://127.0.0.1:8000 \
  --gpu "$GPU_SKU" \
  --require-cuda \
  --nvidia-smi-log "$SMI_LOG"

cp "$MF/docs/receipts/vllm_cuda.json" "$MF/ui/public/receipts/vllm_cuda.json"
python3 scripts/validate_receipts.py --require-gpu

echo ""
echo "DONE — GPU receipts written:"
echo "  docs/receipts/peft_gpu.json"
echo "  docs/receipts/vllm_cuda.json"
echo "Next: commit, push main, vercel --prod, flip tracker Phases 2–3 to ✅"
