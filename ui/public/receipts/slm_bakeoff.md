# SLM vs API bake-off

**Status:** executed (local Ollama CPU)  
**Honesty:** This is a real golden-suite run against `llama3.2:1b` on CPU via Ollama — not a template. Cloud API comparator deferred (no API key on host). Not a CUDA training/serving receipt.

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
| Cloud API comparator | Deferred — no API key on capture host; re-run with `OPENAI_API_KEY` for $/1k tokens row |
| Org metering | [agent-finops](https://github.com/vpeetla-ai/agent-finops) budgets + breach signals |
| Attribution path | App selects → [aegis-llm-gateway](https://github.com/vpeetla-ai/aegis-llm-gateway) enforces/records tokens (ADR-028/029) |

**Panel line:** SLM wins this golden suite on schema_pass; FinOps owns the meter — ModelForge publishes the bake-off, agent-finops owns the budget.

