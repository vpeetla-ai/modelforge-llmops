import { existsSync } from "fs";
import path from "path";

export type Receipt = {
  id: string;
  kind: "peft" | "vllm_cuda" | "slm_bakeoff" | "gateway";
  title: string;
  status: "placeholder" | "published" | "smoke";
  summary: string;
  path: string | null;
  links: string[];
};

/** Public URL under ui/public/receipts for gallery deep-links. */
export function receiptPublicHref(path: string | null): string | null {
  if (!path) return null;
  const name = path.split("/").pop();
  return name ? `/receipts/${name}` : null;
}

const RECEIPTS_DIR = path.join(process.cwd(), "..", "docs", "receipts");
const PUBLIC_RECEIPTS = path.join(process.cwd(), "public", "receipts");

function receiptExists(name: string): boolean {
  // On Vercel, cwd is the ui/ package — prefer public/receipts
  return (
    existsSync(path.join(PUBLIC_RECEIPTS, name)) ||
    existsSync(path.join(RECEIPTS_DIR, name))
  );
}

export function listReceipts(): Receipt[] {
  const peftGpu = receiptExists("peft_gpu.json");
  const peftSmoke = receiptExists("peft_smoke.json");
  const vllm = receiptExists("vllm_cuda.json");
  const slm = receiptExists("slm_bakeoff.md");
  const gateway = receiptExists("gateway_routing_sample.json");

  return [
    {
      id: "peft-gpu",
      kind: "peft",
      title: "QLoRA + DPO GPU receipt",
      status: peftGpu ? "published" : peftSmoke ? "smoke" : "placeholder",
      summary: peftGpu
        ? "CUDA PEFT receipt published (see peft_gpu.json honesty — micro LoRA on T4 or DomainForge 7B ladder)."
        : peftSmoke
          ? "Smoke fixture only — NOT a CUDA GPU receipt. Replace after GPU pipeline."
          : "Pending DomainForge CUDA export → docs/receipts/peft_gpu.json",
      path: peftGpu
        ? "docs/receipts/peft_gpu.json"
        : peftSmoke
          ? "docs/receipts/peft_smoke.json"
          : null,
      links: [
        "https://github.com/vpeetla-ai/domainforge-rag-peft",
        "https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-019-rag-facts-peft-behavior.md",
      ],
    },
    {
      id: "vllm-cuda",
      kind: "vllm_cuda",
      title: "Upstream vLLM CUDA + LoRA metrics",
      status: vllm ? "published" : "placeholder",
      summary: vllm
        ? "TTFT / tok/s from real vLLM (not Architecture Lab Path B)."
        : "Template at docs/receipts/vllm_cuda.template.json — capture with scripts/capture_vllm_metrics.py",
      path: vllm ? "docs/receipts/vllm_cuda.json" : null,
      links: [
        "https://github.com/vpeetla-ai/vllm-architecture-lab",
        "https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-022-domainforge-vllm-multi-lora-serving.md",
      ],
    },
    {
      id: "slm-bakeoff",
      kind: "slm_bakeoff",
      title: "SLM vs API bake-off",
      status: slm ? "published" : "placeholder",
      summary: slm
        ? "Published golden-suite bake-off memo."
        : "Template at docs/receipts/slm_bakeoff.template.md — run scripts/slm_bakeoff.py",
      path: slm ? "docs/receipts/slm_bakeoff.md" : null,
      links: ["https://github.com/vpeetla-ai/domainforge-rag-peft"],
    },
    {
      id: "gateway-sample",
      kind: "gateway",
      title: "Gateway RoutingDecision sample",
      status: gateway ? "published" : "placeholder",
      summary: gateway
        ? "Synthetic RoutingDecision sample (ADR-028/029) — not a production audit export."
        : "App selects model; aegis-llm-gateway enforces + records (ADR-028/029).",
      path: gateway ? "docs/receipts/gateway_routing_sample.json" : null,
      links: ["https://github.com/vpeetla-ai/aegis-llm-gateway"],
    },
  ];
}
