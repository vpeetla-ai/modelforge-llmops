# Phase 3 — CUDA vLLM receipt runbook

**Stack:** upstream [vLLM](https://github.com/vllm-project/vllm) (not Architecture Lab Path B)  
**Gallery:** ModelForge `docs/receipts/vllm_cuda.json`

## Compose sketch

```yaml
# docker-compose.vllm.yml (GPU host only)
services:
  vllm:
    image: vllm/vllm-openai:latest
    command: >
      --model mistralai/Mistral-7B-Instruct-v0.3
      --enable-lora
      --max-lora-rank 64
    ports: ["8000:8000"]
    deploy:
      resources:
        reservations:
          devices: [{ driver: nvidia, count: 1, capabilities: [gpu] }]
```

## Capture

```bash
# warm-up + measure TTFT / tok/s (record tool of choice)
curl -s localhost:8000/v1/models
# load LoRA from DomainForge adapter path when available
```

## Receipt schema (minimum)

```json
{
  "run_id": "vllm-YYYYMMDD",
  "engine": "vllm",
  "gpu": "1x A10",
  "base_model": "...",
  "lora": true,
  "ttft_p50_ms": 0,
  "ttft_p95_ms": 0,
  "tok_per_s": 0,
  "vram_gb": 0,
  "notes": "Architecture Lab remains educational; this receipt is Path A CUDA"
}
```
