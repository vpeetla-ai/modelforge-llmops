# GPU PEFT → ModelForge receipt (Path A)

**Goal:** produce `modelforge-llmops/docs/receipts/peft_gpu.json` from a real CUDA run.

## Preconditions

- RunPod / Lambda / local GPU with ≥24GB VRAM recommended for 7B QLoRA
- Clone `domainforge-rag-peft` and `modelforge-llmops` as siblings

## Steps

```bash
cd domainforge-rag-peft
python -m venv .venv && source .venv/bin/activate
pip install -e ".[train,train-gpu]"

# Optional: scale Bitext
make fetch-bitext   # document row counts in the receipt

# CUDA pipeline (S3 QLoRA → S4 DPO → eval)
bash scripts/gpu_pipeline.sh
# or: make pipeline-gpu

# Export ModelForge receipt
python scripts/export_modelforge_receipt.py \
  --s0 data/eval/results/s0_baseline.json \
  --s3 data/eval/results/s3_peft_hybrid.json \
  --s4 data/eval/results/s4_dpo_peft.json \
  --adapter-uri adapters/s4-dpo \
  --gpu "1x <SKU>" \
  --sft-examples <N> \
  --dpo-pairs <N> \
  --out ../modelforge-llmops/docs/receipts/peft_gpu.json

cp ../modelforge-llmops/docs/receipts/peft_gpu.json \
   ../modelforge-llmops/ui/public/receipts/peft_gpu.json
```

## Honesty

| File | Meaning |
|------|---------|
| `peft_smoke.json` | Ingestion fixture — **not** GPU |
| `peft_gpu.json` | Only after CUDA train + eval export |

After `peft_gpu.json` exists, ModelForge posture PEFT status flips from `smoke` → `ready`.
