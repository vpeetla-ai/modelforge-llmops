# RunPod one-shot — close Model Plane Phases 2–3

**Goal:** produce hire-facing `peft_gpu.json` + `vllm_cuda.json` with `cuda=true` and `nvidia-smi` proof.

This machine (Mac laptop) has **no NVIDIA GPU**. Do not invent receipts. Rent an ephemeral CUDA box, run the script, push artifacts.

## Pod template

| Setting | Value |
|---------|-------|
| Image | RunPod PyTorch 2.4+ / CUDA 12.x (or Ubuntu + install CUDA toolkit) |
| GPU | ≥24GB VRAM for 7B QLoRA (A5000 / A6000 / A100-40 preferred) |
| Disk | ≥50GB container disk (HF cache + adapters) |
| Ports | 8000 (vLLM) optional for live probe |
| Secrets | `HF_TOKEN` if base model is gated |

## Commands

```bash
git clone https://github.com/vpeetla-ai/domainforge-rag-peft.git
git clone https://github.com/vpeetla-ai/modelforge-llmops.git
cd modelforge-llmops

export HF_TOKEN=...
export GPU_SKU="1x A100-40GB"
export SFT_STEPS=200 DPO_STEPS=100
export SFT_EXAMPLES=<documented> DPO_PAIRS=<documented>

bash scripts/one_shot_gpu_receipts.sh
```

The script:

1. Asserts `torch.cuda.is_available()` (hard fail on CPU)
2. Runs DomainForge `gpu_pipeline.sh` → export with `--require-cuda`
3. Brings up `docker-compose.vllm.yml` (upstream vLLM, not Architecture Lab)
4. Captures TTFT / tok/s into `vllm_cuda.json` with CUDA proof
5. Runs `scripts/validate_receipts.py --require-gpu`

## Publish

```bash
# from modelforge-llmops
git add docs/receipts/peft_gpu.json docs/receipts/vllm_cuda.json \
        ui/public/receipts/peft_gpu.json ui/public/receipts/vllm_cuda.json
git commit -m "Publish CUDA PEFT + vLLM receipts from RunPod."
git push origin main
# redeploy Vercel; posture PEFT/vLLM flip to ready
```

Then update `ai-architecture-portfolio/docs/MODEL_PLANE_100_TRACKER.md` Phases 2–3 → ✅.

## Honesty fence

| Artifact | Allowed |
|----------|---------|
| `peft_smoke.json` | Ingestion fixture only |
| `peft_gpu.json` | Only after `--require-cuda` export |
| Architecture Lab Path B | Concepts — never as `vllm_cuda.json` |
| tiny-gpt2 adapters | Never as peft_gpu |

## Alternate: Colab PEFT micro-receipt

For a **CUDA PEFT** micro-receipt without RunPod (TinyLlama QLoRA + measured schema delta):

[Open `notebooks/cuda_receipts_colab.ipynb` in Colab](https://colab.research.google.com/github/vpeetla-ai/modelforge-llmops/blob/main/notebooks/cuda_receipts_colab.ipynb)

- Writes `peft_gpu.json` only (real CUDA train + eval)
- Does **not** write `vllm_cuda.json` — still requires this RunPod one-shot for upstream vLLM

