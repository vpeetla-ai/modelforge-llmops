# SLM vs API bake-off — decision memo (template)

**Status:** scaffold — run `python scripts/slm_bakeoff.py` against Ollama + an API model, then fill the table.

## Decision rule

| Prefer SLM when | Prefer API LLM when |
|-----------------|---------------------|
| Schema/JSON tasks with private data | Long-context reasoning / weak local quality |
| p50 latency + $ / 1k tok beat API | No local GPU/CPU budget |
| Air-gapped or regulated egress | Multimodal / tool-heavy cloud features |

## Results (fill after runs)

| model | schema_pass | mean_latency_s | est_$/1k | notes |
|-------|-------------|----------------|----------|-------|
| ollama 3B | _pending_ | | ~0 | |
| ollama 7B | _pending_ | | ~0 | |
| api (e.g. gpt-4o-mini) | _pending_ | | | |

## Panel one-liner

I pick SLMs when schema fidelity and data residency win; I buy API tokens when reasoning depth wins — ModelForge bake-off receipts make that choice inspectable.
