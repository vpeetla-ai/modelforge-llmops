# Phase 2 — PEFT GPU receipt runbook

**Owner repo:** [domainforge-rag-peft](https://github.com/vpeetla-ai/domainforge-rag-peft)  
**Gallery:** ModelForge `docs/receipts/peft_gpu.json`  
**Exit:** Published eval Δ S0 vs S3 vs S4 + adapter artifact link

## Preconditions

- GPU host (RunPod / Lambda / local CUDA) with ≥24GB VRAM for 7B QLoRA
- DomainForge cloned with `pip install -e ".[train]"`
- Bitext (or equivalent) SFT + preference pairs sized per README

## Steps

```bash
# 1) Prepare data (document exact counts in receipt)
make fetch-bitext   # or project-equivalent
wc -l data/sft/*.jsonl data/dpo/*.jsonl

# 2) QLoRA SFT
make train-qlora    # writes adapters/s3-*

# 3) DPO
make train-dpo      # writes adapters/s4-*

# 4) Eval ladder
make eval-compare   # S0..S4 metrics JSON

# 5) Copy receipt into ModelForge
cp path/to/eval.json ../modelforge-llmops/docs/receipts/peft_gpu.json
```

## Receipt schema (minimum)

```json
{
  "run_id": "peft-YYYYMMDD",
  "base_model": "mistralai/Mistral-7B-Instruct-v0.3",
  "gpu": "1x A10 24GB",
  "sft_examples": 0,
  "dpo_pairs": 0,
  "metrics": {
    "S0_schema_pass": 0.0,
    "S3_schema_pass": 0.0,
    "S4_schema_pass": 0.0,
    "S4_preference_win_rate": 0.0
  },
  "adapter_uri": "file:// or hf://...",
  "notes": "RAG still owns facts; PEFT owns schema/behavior (ADR-019/020)"
}
```

## Honesty

- Do not mark ModelForge PEFT component `ready` until this file exists
- Free-tier Render without GPU remains mock — say so in the receipt
