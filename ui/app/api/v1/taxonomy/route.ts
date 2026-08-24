import { NextResponse } from "next/server";
import {
  adaptationMethods,
  taskTypes,
  solutionLadder,
  classicalMLStack,
  composeMap,
  STATUS_LABELS,
  modelPlaneIntro,
} from "@/lib/taxonomy";

export const runtime = "nodejs";

/** Full Model Plane taxonomy for portfolio embeds and panels. */
export async function GET() {
  return NextResponse.json({
    version: "2026-08-23",
    intro: modelPlaneIntro,
    status_labels: STATUS_LABELS,
    adaptation_methods: adaptationMethods,
    task_types: taskTypes,
    solution_ladder: solutionLadder,
    classical_ml_stack: classicalMLStack,
    compose_map: composeMap,
    canonical_ui: "https://venkat-ai.com/model-plane",
  });
}
