# Agent instructions — ModelForge

Read [CONTEXT.md](CONTEXT.md). Org skills: vpeetla-ai-skills.

## Stack layer

**Model Plane** — SLM · PEFT · CUDA vLLM · LLMOps. Peer to AegisAI (tool governance), not a duplicate agent OS.

## Honesty

- Never claim PEFT/vLLM/SLM receipts until files exist under `docs/receipts/`
- vLLM Architecture Lab = educational; CUDA serve = upstream vLLM compose (Phase 3)
- Side effects / spend → gateway or HITL

## Done

`pip install -e ".[dev]" && pytest -q`
