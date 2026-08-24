#!/usr/bin/env python3
"""Unit test: Colab-shaped peft_gpu receipt passes honesty gates (no GPU needed)."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_colab_shaped_peft_gpu_validates(tmp_path: Path) -> None:
    tmp_path.mkdir(parents=True, exist_ok=True)
    receipt = {
        "status": "gpu",
        "cuda": True,
        "honesty": "CUDA PEFT micro-run — not peft_smoke.",
        "run_id": "peft-test",
        "base_model": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        "gpu": "Tesla T4",
        "cuda_device": "Tesla T4",
        "sft_examples": 72,
        "dpo_pairs": 0,
        "metrics": {
            "S0_schema_pass": 0.0,
            "S3_schema_pass": 0.6667,
            "S4_schema_pass": 0.6667,
            "S4_preference_win_rate": 0.0,
            "train_loss": 1.23,
        },
        "adapter_uri": "/content/peft_out/adapter",
        "nvidia_smi_excerpt": "Tesla T4",
        "notes": "fixture for validator",
    }
    docs = ROOT / "docs" / "receipts"
    public = ROOT / "ui" / "public" / "receipts"
    # Write only to tmp, invoke validator logic via temp copy into sandbox dirs? 
    # Safer: call check function by importing after path hack — keep it simple with subprocess
    # on a temp tree is overkill; write then delete from docs if we use validate on ROOT.
    # Instead duplicate checks inline matching validate_receipts.
    assert receipt["status"] == "gpu"
    assert receipt["cuda"] is True
    assert "tiny-gpt2" not in receipt["base_model"].lower()

    # Ensure ingest script pre-check accepts this shape
    src = tmp_path / "peft_gpu.json"
    src.write_text(json.dumps(receipt, indent=2) + "\n")
    # Dry-run the python pre-check extracted from ingest by running validate against copies
    # in tmp — invoke validate_receipts after copying to a disposable location is hard.
    # Call ingest's embedded check via running the script against tmp then restore.
    bak_docs = docs / "peft_gpu.json"
    bak_pub = public / "peft_gpu.json"
    had_docs, had_pub = bak_docs.exists(), bak_pub.exists()
    docs_prev = bak_docs.read_text() if had_docs else None
    pub_prev = bak_pub.read_text() if had_pub else None
    try:
        subprocess.check_call(["bash", str(ROOT / "scripts" / "ingest_peft_gpu_receipt.sh"), str(src)])
        assert bak_docs.exists() and bak_pub.exists()
        blob = json.loads(bak_docs.read_text())
        assert blob["cuda"] is True
        subprocess.check_call([sys.executable, str(ROOT / "scripts" / "validate_receipts.py")])
    finally:
        if had_docs and docs_prev is not None:
            bak_docs.write_text(docs_prev)
        elif bak_docs.exists():
            bak_docs.unlink()
        if had_pub and pub_prev is not None:
            bak_pub.write_text(pub_prev)
        elif bak_pub.exists():
            bak_pub.unlink()


if __name__ == "__main__":
    test_colab_shaped_peft_gpu_validates(Path("/tmp/mf-receipt-test"))
    print("ok")
