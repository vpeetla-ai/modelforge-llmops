/** Honesty class for every taxonomy row — never upgrade without evidence. */
export type TaxonomyStatus = "live" | "receipt" | "educational" | "playbook" | "planned";

export type TaxonomyRow = {
  id: string;
  label: string;
  category: string;
  status: TaxonomyStatus;
  platform: string;
  summary: string;
  limitation: string;
  href?: string;
  external?: boolean;
};

export type SolutionLadderStep = {
  id: string;
  label: string;
  method: string;
  plane: string;
  status: TaxonomyStatus;
  metrics: string;
  href?: string;
};

export type ClassicalMLLayer = {
  id: string;
  layer: string;
  capability: string;
  status: TaxonomyStatus;
  playbookHref: string;
};

export type ComposeNode = {
  id: string;
  name: string;
  role: string;
  status: TaxonomyStatus;
  href: string;
};

export const STATUS_LABELS: Record<TaxonomyStatus, string> = {
  live: "Live demo",
  receipt: "CUDA / artifact receipt",
  educational: "Educational (not prod SLO)",
  playbook: "Playbook / interview archetype",
  planned: "Planned — not claimed shipped",
};

export const TAXONOMY_TABS = [
  { id: "overview", label: "Overview" },
  { id: "adaptation", label: "Adaptation methods" },
  { id: "tasks", label: "Task types" },
  { id: "ladder", label: "S0→S4 ladder" },
  { id: "classical", label: "Classical ML stack" },
  { id: "compose", label: "Compose map" },
] as const;

export type TaxonomyTabId = (typeof TAXONOMY_TABS)[number]["id"];

export const adaptationMethods: TaxonomyRow[] = [
  {
    id: "regular-base",
    label: "Regular / base model",
    category: "Adaptation",
    status: "live",
    platform: "ModelForge SLM bake-off · LLM gateway",
    summary: "Off-the-shelf small or frontier models — no adapter. Used when schema tasks win on SLM cost/latency.",
    limitation: "Not fine-tuned for domain JSON; compare via bake-off table, not vibes.",
    href: "https://modelforge-gamma.vercel.app",
    external: true,
  },
  {
    id: "lora-fp16",
    label: "LoRA (fp16 micro)",
    category: "Adaptation",
    status: "receipt",
    platform: "ModelForge · peft_gpu.json",
    summary: "Low-rank adapters on TinyLlama — published T4 fp16 LoRA micro-run with schema-pass delta.",
    limitation: "Micro-receipt only; not DomainForge 7B S0/S3/S4 hire-depth ladder.",
    href: "https://modelforge-gamma.vercel.app/receipts/peft_gpu.json",
    external: true,
  },
  {
    id: "qlora-sft",
    label: "QLoRA SFT",
    category: "Adaptation",
    status: "live",
    platform: "DomainForge (S3)",
    summary: "4-bit QLoRA SFT on Bitext support intents — teaches JSON envelope + intent grammar.",
    limitation: "Full Mistral-7B QLoRA needs GPU host (RunPod path); Render demo may use mock/template.",
    href: "https://domainforge-rag-peft.vercel.app",
    external: true,
  },
  {
    id: "dpo",
    label: "DPO (preference alignment)",
    category: "Adaptation",
    status: "live",
    platform: "DomainForge (S4)",
    summary: "Preference pairs repair format/intent mistakes after SFT — S4 vs S3 win-rate in eval compare.",
    limitation: "Curated reject examples; not a substitute for RAG fact updates.",
    href: "https://domainforge-rag-peft.vercel.app",
    external: true,
  },
  {
    id: "multi-lora-path-b",
    label: "Multi-LoRA (Path B)",
    category: "Adaptation",
    status: "educational",
    platform: "vLLM Architecture Lab",
    summary: "OpenAI-shaped /v1/chat/completions + /v1/adapters — adapter id swap for interview proof.",
    limitation: "Educational mock registry — NOT CUDA multi-LoRA kernels or production SLAs (ADR-022).",
    href: "https://vllm-architecture-lab.vercel.app",
    external: true,
  },
  {
    id: "multi-lora-path-a",
    label: "Multi-LoRA (Path A — CUDA)",
    category: "Adaptation",
    status: "receipt",
    platform: "ModelForge · vllm_cuda.json",
    summary: "Upstream vLLM CUDA metrics receipt (TTFT, tok/s) — production-shaped serve math.",
    limitation: "TinyLlama on T4 micro-run; not always-on 7B multi-tenant LoRA fleet.",
    href: "https://modelforge-gamma.vercel.app/receipts/vllm_cuda.json",
    external: true,
  },
  {
    id: "full-ft",
    label: "Full fine-tune",
    category: "Adaptation",
    status: "planned",
    platform: "—",
    summary: "Explicit non-goal for enterprise triage — wrong economics vs PEFT + RAG split (ADR-019).",
    limitation: "Not shipped; panel answer is buy API or PEFT, not pretrain 7B+ from scratch.",
  },
];

export const taskTypes: TaxonomyRow[] = [
  {
    id: "causal-lm",
    label: "Causal LM / chat generation",
    category: "LLM task",
    status: "live",
    platform: "VAP · gateway · SLM bake-off",
    summary: "Open-ended generation with routing and FinOps attribution.",
    limitation: "Free demos cold-start; not warm SLO.",
    href: "https://venkat-ai-platform.vercel.app",
    external: true,
  },
  {
    id: "intent-classification",
    label: "Intent classification (LLM JSON)",
    category: "LLM task",
    status: "live",
    platform: "DomainForge",
    summary: "~27 Bitext support intents → strict triage JSON (intent, priority, action_code).",
    limitation: "LLM/PEFT triage, not sklearn softmax on tabular features.",
    href: "https://domainforge-rag-peft.vercel.app",
    external: true,
  },
  {
    id: "structured-json",
    label: "Structured JSON / schema adherence",
    category: "LLM task",
    status: "live",
    platform: "DomainForge S3/S4 · golden-eval",
    summary: "Format adherence scored separately from faithfulness — schema_pass in eval ladder.",
    limitation: "Eval regression gates promotion; smoke ≠ production accuracy.",
    href: "https://github.com/vpeetla-ai/golden-eval-registry",
    external: true,
  },
  {
    id: "rag-grounded-qa",
    label: "RAG-grounded Q&A + citations",
    category: "LLM task",
    status: "live",
    platform: "Enterprise RAG",
    summary: "Authorization before ranking; page-level cites — facts stay out of weights.",
    limitation: "Demo vs Strict labeled on public Free tier.",
    href: "https://enterprise-rag-platform-eta.vercel.app",
    external: true,
  },
  {
    id: "tabular-classification",
    label: "Tabular classification",
    category: "Classical ML",
    status: "playbook",
    platform: "Interview playbook · mlops-llmops",
    summary: "Champion/challenger, registry stages, batch/online parity — archetype for fraud/rank/churn panels.",
    limitation: "No live sklearn/XGBoost production service in org — playbook + design depth only.",
    href: "https://ai-architect-interview-playbook.vercel.app/q/mlops-llmops/04-batch-online-unified-prediction-platform/",
    external: true,
  },
  {
    id: "tabular-regression",
    label: "Tabular regression",
    category: "Classical ML",
    status: "playbook",
    platform: "Interview playbook · mlops-llmops",
    summary: "Training–serving skew, drift monitoring, continuous training gates for numeric targets.",
    limitation: "Org uses eval regression for LLM fixtures — statistical regression models are interview archetype.",
    href: "https://ai-architect-interview-playbook.vercel.app/q/mlops-llmops/02-training-serving-skew-platform/",
    external: true,
  },
  {
    id: "eval-regression",
    label: "Eval regression (LLMOps)",
    category: "LLMOps",
    status: "live",
    platform: "golden-eval-registry",
    summary: "Golden fixtures as CI gate — found real fixture bug on first pipeline run (ADR-014).",
    limitation: "Means metric/fixture regression, not sklearn linear regression.",
    href: "https://github.com/vpeetla-ai/golden-eval-registry",
    external: true,
  },
];

export const solutionLadder: SolutionLadderStep[] = [
  {
    id: "s0_baseline",
    label: "S0 Baseline",
    method: "Regular LM",
    plane: "No RAG · no adapter",
    status: "live",
    metrics: "schema_pass baseline",
    href: "https://domainforge-rag-peft.vercel.app",
  },
  {
    id: "s1_naive_rag",
    label: "S1 Naive RAG",
    method: "Retrieve + generate",
    plane: "Facts via vector store",
    status: "live",
    metrics: "faithfulness ↑",
    href: "https://domainforge-rag-peft.vercel.app",
  },
  {
    id: "s2_hybrid_rag",
    label: "S2 Hybrid RAG",
    method: "BM25 + dense RRF",
    plane: "Enterprise RAG pattern",
    status: "live",
    metrics: "recall + cite quality",
    href: "https://domainforge-rag-peft.vercel.app",
  },
  {
    id: "s3_peft_hybrid",
    label: "S3 QLoRA + RAG",
    method: "QLoRA SFT",
    plane: "Behavior in adapter",
    status: "live",
    metrics: "schema_pass Δ vs S2",
    href: "https://domainforge-rag-peft.vercel.app",
  },
  {
    id: "s4_dpo_peft",
    label: "S4 DPO + RAG",
    method: "DPO after SFT",
    plane: "Preference alignment",
    status: "live",
    metrics: "preference win-rate vs S3",
    href: "https://domainforge-rag-peft.vercel.app",
  },
];

export const classicalMLStack: ClassicalMLLayer[] = [
  {
    id: "registry",
    layer: "L1 · Registry",
    capability: "Experiment + model version + promotion gates",
    status: "playbook",
    playbookHref:
      "https://ai-architect-interview-playbook.vercel.app/q/mlops-llmops/01-model-experiment-registry-and-promotion/",
  },
  {
    id: "skew",
    layer: "L2 · Training–serving skew",
    capability: "Feature parity contracts between train and online",
    status: "playbook",
    playbookHref:
      "https://ai-architect-interview-playbook.vercel.app/q/mlops-llmops/02-training-serving-skew-platform/",
  },
  {
    id: "drift",
    layer: "L3 · Drift + shadow",
    capability: "Population drift monitoring and shadow scoring",
    status: "playbook",
    playbookHref:
      "https://ai-architect-interview-playbook.vercel.app/q/mlops-llmops/03-drift-monitoring-and-shadow-scoring/",
  },
  {
    id: "batch-online",
    layer: "L4 · Batch / online",
    capability: "Unified prediction platform for classification + regression",
    status: "playbook",
    playbookHref:
      "https://ai-architect-interview-playbook.vercel.app/q/mlops-llmops/04-batch-online-unified-prediction-platform/",
  },
  {
    id: "ml-cicd",
    layer: "L5 · ML CI/CD",
    capability: "Continuous training with gated promote",
    status: "playbook",
    playbookHref:
      "https://ai-architect-interview-playbook.vercel.app/q/mlops-llmops/05-ml-cicd-continuous-training-pipeline/",
  },
  {
    id: "llm-bridge",
    layer: "Bridge · LLM plane",
    capability: "DomainForge adapters + ModelForge receipts + gateway enforce",
    status: "live",
    playbookHref: "https://modelforge-gamma.vercel.app/taxonomy",
  },
];

export const composeMap: ComposeNode[] = [
  {
    id: "enterprise-rag",
    name: "Enterprise RAG",
    role: "Facts · access-before-ranking",
    status: "live",
    href: "https://enterprise-rag-platform-eta.vercel.app",
  },
  {
    id: "domainforge",
    name: "DomainForge",
    role: "QLoRA/DPO train · S0→S4 eval",
    status: "live",
    href: "https://domainforge-rag-peft.vercel.app",
  },
  {
    id: "modelforge",
    name: "ModelForge",
    role: "Posture · receipts · SLM bake-off",
    status: "live",
    href: "https://modelforge-gamma.vercel.app",
  },
  {
    id: "vllm-lab",
    name: "vLLM Lab",
    role: "Serve math · Path B multi-LoRA edu",
    status: "educational",
    href: "https://vllm-architecture-lab.vercel.app",
  },
  {
    id: "gateway",
    name: "LLM gateway",
    role: "Apps select · plane enforces + records",
    status: "live",
    href: "https://aegis-llm-gateway-api.onrender.com/health",
  },
  {
    id: "golden-eval",
    name: "golden-eval-registry",
    role: "Eval regression CI gate",
    status: "live",
    href: "https://github.com/vpeetla-ai/golden-eval-registry",
  },
];

export const modelPlaneIntro = {
  title: "Model Plane taxonomy",
  subtitle:
    "Adaptation methods, task types, classical ML lane, and how ModelForge + DomainForge compose — every row labeled Demo vs Strict / receipt vs educational.",
  adrHref:
    "https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-034-modelforge-model-plane.md",
  planHref:
    "https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/docs/MODEL_PLANE_TAXONOMY_UI_PLAN.md",
};
