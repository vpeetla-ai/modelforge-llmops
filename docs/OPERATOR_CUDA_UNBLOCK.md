# Operator CUDA unblock (Model Plane 100%)

Hard blockers only:

| Receipt | How to produce |
|---------|----------------|
| `peft_gpu.json` | [Colab notebook](https://colab.research.google.com/github/vpeetla-ai/modelforge-llmops/blob/main/notebooks/cuda_receipts_colab.ipynb) (T4+) **or** RunPod DomainForge pipeline |
| `vllm_cuda.json` | RunPod `bash scripts/one_shot_gpu_receipts.sh` (upstream vLLM — not Architecture Lab) |

## 20-minute PEFT path (Colab)

1. Open Colab link above → Runtime → GPU
2. Run all cells → download `peft_gpu.json`
3. `bash scripts/ingest_peft_gpu_receipt.sh ~/Downloads/peft_gpu.json`
4. Commit + `vercel --prod`
5. Check `https://modelforge-gamma.vercel.app/api/v1/posture` → PEFT `ready`

## vLLM path (RunPod)

Follow [RUNPOD_ONE_SHOT.md](./RUNPOD_ONE_SHOT.md). Requires ≥24GB for 7B; T4 Colab is not a substitute for upstream vLLM metrics.
