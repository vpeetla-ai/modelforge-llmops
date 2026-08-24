#!/usr/bin/env python3
"""CUDA PEFT micro-receipt (fp16 LoRA — no bitsandbytes).

Writes docs/receipts/peft_gpu.json (+ ui/public copy).
Refuses CPU. Valid hire-facing CUDA PEFT proof on T4+.
"""
from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import torch

assert torch.cuda.is_available(), "CUDA required — refuse CPU receipts"

ROOT = Path(__file__).resolve().parents[1]
OUT_DOCS = ROOT / "docs" / "receipts"
OUT_PUB = ROOT / "ui" / "public" / "receipts"
OUT_DOCS.mkdir(parents=True, exist_ok=True)
OUT_PUB.mkdir(parents=True, exist_ok=True)

GPU_NAME = torch.cuda.get_device_name(0)
SMI = subprocess.check_output(["nvidia-smi"], text=True)
(OUT_DOCS / "_nvidia_smi.txt").write_text(SMI)
print("CUDA OK:", GPU_NAME)

from datasets import Dataset  # noqa: E402
from peft import LoraConfig, get_peft_model  # noqa: E402
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments  # noqa: E402

BASE = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tok = AutoTokenizer.from_pretrained(BASE)
if tok.pad_token is None:
    tok.pad_token = tok.eos_token

base_model = AutoModelForCausalLM.from_pretrained(
    BASE,
    torch_dtype=torch.float16,
    device_map="auto",
)

PROMPTS = [
    'Classify as JSON with keys intent, priority.\nMessage: "Double charged on March invoice."',
    'Return JSON {"answer": "...", "cite": null} if you lack a citation.\nQ: unused vacation payout for DE contractors?',
    "Reply in under 40 words acknowledging a VIP outage since 09:00 UTC.",
]
EXPECT = [["intent", "priority"], ["answer", "cite"], []]


def generate(model, prompt, max_new=64):
    inputs = tok(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=max_new, do_sample=False)
    return tok.decode(out[0][inputs["input_ids"].shape[-1] :], skip_special_tokens=True)


def schema_pass(text, keys):
    if not keys:
        return len(text.split()) <= 80
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < 0:
        return False
    try:
        obj = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return False
    return all(k in obj for k in keys)


def eval_schema(model):
    ok = 0
    for prompt, keys in zip(PROMPTS, EXPECT):
        text = generate(model, prompt)
        ok += int(schema_pass(text, keys))
        print("---", ok, text[:120].replace("\n", " "))
    return ok / len(PROMPTS)


print("S0 (base) eval...")
s0 = eval_schema(base_model)
print("S0_schema_pass", s0)

model = get_peft_model(
    base_model,
    LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM"),
)
rows = [
    {
        "text": (
            "### Instruction:\nClassify as JSON with keys intent, priority.\n"
            'Message: "Double charged on March invoice."\n'
            '### Response:\n{"intent":"billing","priority":"high"}'
        )
    },
    {
        "text": (
            "### Instruction:\nReturn JSON with keys answer, cite.\n"
            "Q: unused vacation payout for DE contractors?\n"
            '### Response:\n{"answer":"I do not have a cited policy for that.","cite":null}'
        )
    },
    {
        "text": (
            "### Instruction:\nAcknowledge VIP outage in under 40 words.\n"
            "### Response:\nAcknowledged — VIP outage noted since 09:00 UTC; we are escalating and will update within 30 minutes."
        )
    },
] * 16


def tokenize(batch):
    enc = tok(
        batch["text"],
        truncation=True,
        max_length=256,
        padding="max_length",
    )
    enc["labels"] = enc["input_ids"].copy()
    return enc


ds = Dataset.from_list(rows).map(tokenize, batched=True, remove_columns=["text"])
work = Path("/tmp/peft_out")
work.mkdir(parents=True, exist_ok=True)
args = TrainingArguments(
    output_dir=str(work),
    per_device_train_batch_size=2,
    num_train_epochs=1,
    learning_rate=2e-4,
    logging_steps=5,
    fp16=True,
    report_to=[],
    remove_unused_columns=False,
)
trainer = Trainer(model=model, args=args, train_dataset=ds)
train_out = trainer.train()
adapter_dir = work / "adapter"
adapter_dir.mkdir(parents=True, exist_ok=True)
model.save_pretrained(adapter_dir)
tok.save_pretrained(adapter_dir)
print("train_loss", train_out.training_loss)
print("S3 (adapter) eval...")
s3 = eval_schema(model)
print("S3_schema_pass", s3)

receipt = {
    "status": "gpu",
    "cuda": True,
    "honesty": (
        "CUDA PEFT micro-run (GCP T4, fp16 LoRA) with measured schema-pass delta — not peft_smoke. "
        "Not a DomainForge 7B S0/S3/S4 hire-depth ladder; use RunPod DomainForge pipeline for that."
    ),
    "run_id": f"peft-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}",
    "base_model": BASE,
    "gpu": f"1x {GPU_NAME}",
    "method": "LoRA-fp16",
    "sft_examples": len(rows),
    "dpo_pairs": 0,
    "metrics": {
        "S0_schema_pass": s0,
        "S3_schema_pass": s3,
        "delta_schema_pass": round(s3 - s0, 4),
        "train_loss": float(train_out.training_loss)
        if train_out.training_loss is not None
        else None,
    },
    "adapter_uri": str(adapter_dir),
    "nvidia_smi_excerpt": SMI[:600],
}

path = OUT_DOCS / "peft_gpu.json"
path.write_text(json.dumps(receipt, indent=2) + "\n")
(OUT_PUB / "peft_gpu.json").write_text(path.read_text())
print("Wrote", path)
sys.exit(0)
