# Quantization & serve trade-offs (ModelForge)

**Honesty:** This is an architecture note for panels — not a claim that ModelForge has run AWQ/FP8 on CUDA. The FP16/unquantized row below is now backed by a real captured number (see `vllm_cuda.json`); AWQ/GPTQ/FP8 rows remain narrative until a comparator run captures them the same way.

## Decision shortcuts

| Choice | When it wins | Watch-outs |
|--------|--------------|------------|
| BF16 / FP16 LoRA | Highest fidelity for PEFT eval before promote | VRAM; not the FinOps default at scale |
| QLoRA (4-bit train) | Adapter training on 24–48GB class GPUs | Train dtype ≠ serve dtype; re-eval after merge/export |
| AWQ / GPTQ serve | Throughput/$ on dense 7B–70B | Schema regression risk — bake-off before cutover |
| FP8 (Hopper+) | Modern serve stacks with calibrated scales | Hardware lock-in; validate TTFT + tok/s on target SKU |
| GGUF / Ollama CPU | Laptop SLM bake-offs, private-data demos | Not a CUDA vLLM receipt; label Path B / CPU honestly |

## Real captured number (Path A, unquantized FP16 serve)

Upstream `vllm/vllm-openai:v0.8.5` serving `mistralai/Mistral-7B-Instruct-v0.3` (no AWQ/GPTQ/FP8 — vanilla FP16 weights) on a rented **1x NVIDIA L4 24GB**, captured 2026-09-03 via `scripts/capture_vllm_metrics.py` over 5 real chat-completion round-trips: **13.74 tok/s**, TTFT p50 **371.67 ms** / p95 **372.75 ms**, ~20.4GB VRAM resident. See [`docs/receipts/vllm_cuda.json`](receipts/vllm_cuda.json) (`run_id: vllm-20260903T225117Z`) for the full receipt including the `nvidia-smi` proof. This is the FP16 baseline row this table has been missing — an AWQ/GPTQ/FP8 comparator run on the same GPU/model would be the natural next data point, not yet captured.

## ModelForge posture mapping

| Artifact | Meaning |
|----------|---------|
| `peft_smoke.json` | Ingestion fixture — **not** CUDA |
| `peft_gpu.json` | CUDA QLoRA/DPO training receipt (real GPU run 2026-09-03; reports training config/timing, not a quality score — see the receipt's own `known_gaps`) |
| `slm_bakeoff.md` | Executed golden suite (CPU Ollama; cloud-API comparator still deferred, no key on capture host) |
| `vllm_cuda.json` | Upstream vLLM TTFT / tok/s / VRAM — **real, captured** (see above) |

## Panel one-liner

> I quantize for economics, not fashion — PEFT train in QLoRA, promote only if eval holds, serve with the cheapest format that keeps schema_pass and p95 latency inside budget.
