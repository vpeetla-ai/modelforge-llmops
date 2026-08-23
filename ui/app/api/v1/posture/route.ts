import { NextResponse } from "next/server";
import { buildPosture } from "@/lib/posture";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(buildPosture());
}
