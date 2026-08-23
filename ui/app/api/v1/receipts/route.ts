import { NextResponse } from "next/server";
import { listReceipts } from "@/lib/receipts";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ receipts: listReceipts() });
}
