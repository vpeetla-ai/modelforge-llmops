# ModelForge — Model Plane (SLM · PEFT · CUDA vLLM · LLMOps)



<!-- vpeetla-tech-stack:start -->
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square)]() [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square)]() [![PEFT](https://img.shields.io/badge/PEFT-9333EA?style=flat-square)]() [![vLLM](https://img.shields.io/badge/vLLM-CUDA-FF6B35?style=flat-square)]() [![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square)]() [![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square)]() [![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square)]()
<!-- vpeetla-tech-stack:end -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Org](https://img.shields.io/badge/GitHub-vpeetla--ai-blue)](https://github.com/vpeetla-ai)

**Hire hero for the Model Plane.** ModelForge is where a CAIO clicks when they ask about SLMs, fine-tuning, CUDA vLLM, and LLMOps — not another agent demo.

> Agents decide *what to do*. ModelForge decides *which weights, where they run, and how we prove it.*

**Plan:** [MODEL_PLANE_100_PLAN](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/docs/MODEL_PLANE_100_PLAN.md) · **ADR-034** · Tracker

## Architecture

```text
UI / API (this repo)
  ├── PEFT receipts     → DomainForge (QLoRA SFT + DPO)
  ├── CUDA serve        → upstream vLLM + LoRA modules (GPU host)
  ├── SLM bake-off      → Ollama 3B/7B vs API on golden suite
  ├── Ops bridge        → aegis-llm-gateway (enforce + record)
  └── Concepts (linked) → vLLM Architecture Lab (educational only)
```

## Honest status

| Component | Status | Notes |
|-----------|--------|-------|
| Posture API (`/v1/posture`) | ✅ | Machine-readable honesty |
| Receipts gallery API | ✅ | PEFT / vLLM / SLM placeholders → fill in Phases 2–4 |
| Model Plane UI | 🟡 | MVP tabs; polish in Phase 1 |
| DomainForge live probe | 🟡 | Optional `DOMAINFORGE_URL` |
| LLM gateway probe | 🟡 | Optional `LLM_GATEWAY_URL` |
| CUDA vLLM compose | ⬜ | Phase 3 — `docker-compose.vllm.yml` |
| GPU PEFT receipt artifact | ⬜ | Phase 2 — not claimed until file exists |
| SLM bake-off table | ⬜ | Phase 4 |
| Always-on GPU | ❌ | Ephemeral RunPod; free tier is CPU/API |

## Quick start

```bash
python3.11 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest -q
uvicorn modelforge_llmops.api.main:app --reload --port 8200
# → http://127.0.0.1:8200/health  ·  /v1/posture  ·  /docs
```

```bash
cd ui && npm install && npm run dev
# set NEXT_PUBLIC_API_URL=http://127.0.0.1:8200
```

## SLM bake-off (Phase 4)

```bash
# Ollama OpenAI-compatible shim (example)
python scripts/slm_bakeoff.py --base-url http://127.0.0.1:11434 --model llama3.2:3b --label ollama-3b
# Cloud API
OPENAI_API_KEY=... python scripts/slm_bakeoff.py --base-url https://api.openai.com --model gpt-4o-mini --api-key "$OPENAI_API_KEY" --label api-4o-mini
```

Writes/appends `docs/receipts/slm_bakeoff.md`.

## CUDA vLLM (Phase 3)

```bash
# On a GPU host only
docker compose -f docker-compose.vllm.yml up
# Capture metrics → docs/receipts/vllm_cuda.json (see docs/PHASE3_VLLM_CUDA_RECEIPT.md)
```

## Live probes

```bash
export DOMAINFORGE_URL=https://domainforge-api.onrender.com
export LLM_GATEWAY_URL=https://aegis-llm-gateway-api.onrender.com
curl -s localhost:8200/v1/probes | jq
```


## Related

- [domainforge-rag-peft](https://github.com/vpeetla-ai/domainforge-rag-peft)
- [vllm-architecture-lab](https://github.com/vpeetla-ai/vllm-architecture-lab)
- [aegis-llm-gateway](https://github.com/vpeetla-ai/aegis-llm-gateway)
- [ai-architecture-portfolio](https://github.com/vpeetla-ai/ai-architecture-portfolio)
