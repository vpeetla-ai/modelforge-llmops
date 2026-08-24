import { NextResponse } from "next/server";
import { listReceipts } from "@/lib/receipts";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    name: "ModelForge",
    question: "Which weights, where, with what proof?",
    taxonomy: "/api/v1/taxonomy",
    taxonomy_ui: "/taxonomy",
    canonical_taxonomy: "https://venkat-ai.com/model-plane",
    composes: [
      { id: "domainforge", role: "PEFT train + RAG facts" },
      { id: "vllm-cuda", role: "Production-shaped serve (Phase 3)" },
      { id: "vllm-lab", role: "Educational internals only" },
      { id: "aegis-llm-gateway", role: "Enforce + record" },
    ],
    receipts: listReceipts(),
  });
}
