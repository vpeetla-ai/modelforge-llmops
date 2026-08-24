# ModelForge — operator targets (no invented GPU receipts)

.PHONY: validate ingest-peft ingest-vllm one-shot-gpu check-dod

validate:
	python3 scripts/validate_receipts.py

# After Colab download:
#   make ingest-peft SRC=~/Downloads/peft_gpu.json
ingest-peft:
	@test -n "$(SRC)" || (echo "Usage: make ingest-peft SRC=/path/to/peft_gpu.json" >&2; exit 1)
	bash scripts/ingest_peft_gpu_receipt.sh "$(SRC)"

# After RunPod capture_vllm_metrics.py:
#   make ingest-vllm SRC=docs/receipts/vllm_cuda.json
ingest-vllm:
	@test -n "$(SRC)" || (echo "Usage: make ingest-vllm SRC=/path/to/vllm_cuda.json" >&2; exit 1)
	bash scripts/ingest_vllm_cuda_receipt.sh "$(SRC)"

# GPU host only (RunPod / local NVIDIA):
one-shot-gpu:
	bash scripts/one_shot_gpu_receipts.sh

check-dod: validate
	@echo "DoD file check:"
	@if [ -f docs/receipts/peft_gpu.json ]; then echo "  peft_gpu.json: present"; else echo "  peft_gpu.json: MISSING"; fi
	@if [ -f docs/receipts/vllm_cuda.json ]; then echo "  vllm_cuda.json: present"; else echo "  vllm_cuda.json: MISSING"; fi
	@if [ -f docs/receipts/peft_gpu.json ] && [ -f docs/receipts/vllm_cuda.json ]; then \
	  python3 scripts/validate_receipts.py --require-gpu && echo "DoD GPU receipts: OK"; \
	else \
	  echo "DoD GPU receipts: incomplete (need CUDA host)"; exit 1; \
	fi
