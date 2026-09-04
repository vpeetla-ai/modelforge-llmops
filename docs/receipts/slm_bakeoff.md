# SLM vs API bake-off

**Status:** executed (local Ollama CPU) + executed (cloud API, Groq)  
**Honesty:** Both rows below are real golden-suite runs, not templates — local `llama3.2:1b` on CPU via Ollama, and cloud `openai/gpt-oss-20b` via Groq's real OpenAI-compatible API (2026-09-04, run via `.github/workflows/slm-bakeoff-cloud.yml`, `workflow_dispatch` only). Not a CUDA training/serving receipt.

# SLM bake-off receipt — ollama/llama3.2:1b (CPU)

- model: `llama3.2:1b`
- base: `http://127.0.0.1:11434`
- schema/pass: **3/3**
- mean latency_s: **3.415**

| case | pass | latency_s | preview |
|------|------|-----------|---------|
| schema_json_ticket | True | 4.732 | Here is the classification of the support message into JSON with keys intent, priority, and action_code:  ``` {   "inten |
| refuse_policy_hallucination | True | 2.976 | I can help you with that. Here's a JSON response that matches your request:  ```json {   "answer": "Our unused vacation  |
| short_latency_ack | True | 2.537 | "Thank you for reaching out. I've acknowledged your message. I'll do my best to provide a follow-up update within the ne |

## Decision notes

- Prefer SLM when schema_pass ≥ API and p50 latency / $ wins for private data.
- Prefer API when long-context reasoning dominates and data class allows cloud.

## FinOps bridge (Phase 4.5)

| Signal | Estimate / link |
|--------|-----------------|
| Local SLM marginal $ | ~$0 inference on already-owned CPU/GPU (electricity only) |
| Cloud API comparator | **Real** — Groq `openai/gpt-oss-20b`, 3/3 schema-pass, mean latency 0.386s (vs local 3.415s) |
| Org metering | [agent-finops](https://github.com/vpeetla-ai/agent-finops) budgets + breach signals |
| Attribution path | App selects → [aegis-llm-gateway](https://github.com/vpeetla-ai/aegis-llm-gateway) enforces/records tokens (ADR-028/029) |

**Panel line:** SLM wins this golden suite on schema_pass; FinOps owns the meter — ModelForge publishes the bake-off, agent-finops owns the budget.

# SLM bake-off receipt — groq/openai/gpt-oss-20b (cloud API)

- model: `openai/gpt-oss-20b`
- base: `https://api.groq.com/openai`
- schema/pass: **3/3**
- mean latency_s: **0.386**

| case | pass | latency_s | preview |
|------|------|-----------|---------|
| schema_json_ticket | True | 0.385 | ```json {   "intent": "billing_dispute",   "priority": "high",   "action_code": "REFUND_REQUEST" } ``` |
| refuse_policy_hallucination | True | 0.243 | {"answer":"I’m sorry, but I don’t have that information.","cite":null} |
| short_latency_ack | True | 0.53 | Thank you for notifying us. We acknowledge the outage and are investigating. We’ll provide a status update within the ne |

## Decision notes

- Prefer SLM when schema_pass ≥ API and p50 latency / $ wins for private data.
- Prefer API when long-context reasoning dominates and data class allows cloud.

