# Quantization & serve trade-offs (ModelForge)

**Honesty:** This is an architecture note for panels — not a claim that ModelForge has run AWQ/FP8 on CUDA yet. CUDA metrics land in `vllm_cuda.json` after Path A capture.

## Decision shortcuts

| Choice | When it wins | Watch-outs |
|--------|--------------|------------|
| BF16 / FP16 LoRA | Highest fidelity for PEFT eval before promote | VRAM; not the FinOps default at scale |
| QLoRA (4-bit train) | Adapter training on 24–48GB class GPUs | Train dtype ≠ serve dtype; re-eval after merge/export |
| AWQ / GPTQ serve | Throughput/$ on dense 7B–70B | Schema regression risk — bake-off before cutover |
| FP8 (Hopper+) | Modern serve stacks with calibrated scales | Hardware lock-in; validate TTFT + tok/s on target SKU |
| GGUF / Ollama CPU | Laptop SLM bake-offs, private-data demos | Not a CUDA vLLM receipt; label Path B / CPU honestly |

## ModelForge posture mapping

| Artifact | Meaning |
|----------|---------|
| `peft_smoke.json` | Ingestion fixture — **not** CUDA |
| `peft_gpu.json` | CUDA QLoRA/DPO eval Δ (pending GPU host) |
| `slm_bakeoff.md` | Executed golden suite (may be CPU Ollama) |
| `vllm_cuda.json` | Upstream vLLM TTFT / tok/s / VRAM (pending GPU host) |

## Panel one-liner

> I quantize for economics, not fashion — PEFT train in QLoRA, promote only if eval holds, serve with the cheapest format that keeps schema_pass and p95 latency inside budget.
