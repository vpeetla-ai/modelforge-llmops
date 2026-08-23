import { listReceipts } from "./receipts";

export type PlaneComponent = {
  id: string;
  label: string;
  status: "ready" | "partial" | "planned" | "external" | "smoke";
  detail: string;
};

export function buildPosture() {
  const receipts = listReceipts();
  const peft = receipts.find((r) => r.id === "peft-gpu");
  const vllm = receipts.find((r) => r.id === "vllm-cuda");
  const slm = receipts.find((r) => r.id === "slm-bakeoff");

  const peftStatus =
    peft?.status === "published"
      ? "ready"
      : peft?.status === "smoke"
        ? "smoke"
        : "partial";

  return {
    service: "modelforge-llmops",
    mode: "demo",
    thesis:
      "Agents decide what to do; ModelForge decides which weights, where they run, and how we prove it.",
    spine_role:
      "Model Plane flagship (ADR-034) — peer to AegisAI / VAP / Enterprise RAG / Content Factory",
    components: [
      {
        id: "api",
        label: "ModelForge API",
        status: "ready" as const,
        detail: "Vercel /api health + posture + receipts",
      },
      {
        id: "peft",
        label: "PEFT / DomainForge",
        status: peftStatus,
        detail: peft?.summary ?? "pending",
      },
      {
        id: "vllm_cuda",
        label: "CUDA vLLM serve",
        status: (vllm?.status === "published" ? "ready" : "planned") as
          | "ready"
          | "planned",
        detail: vllm?.summary ?? "pending",
      },
      {
        id: "slm_bakeoff",
        label: "SLM bake-off",
        status: (slm?.status === "published" ? "ready" : "planned") as
          | "ready"
          | "planned",
        detail: slm?.summary ?? "pending",
      },
      {
        id: "gateway",
        label: "LLM gateway bridge",
        status: "partial" as const,
        detail: "Wire LLM_GATEWAY_URL / sample RoutingDecision (Phase 4)",
      },
    ] satisfies PlaneComponent[],
    non_goals: [
      "Foundation-model pretraining from scratch",
      "Claiming vLLM Architecture Lab Path B as CUDA production",
      "Always-on free-tier GPU",
      "Treating peft_smoke.json as a GPU receipt",
    ],
  };
}
