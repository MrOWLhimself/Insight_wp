import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { campaignId } = await req.json();
    if (!campaignId) {
      return NextResponse.json({ error: "campaignId required." }, { status: 400 });
    }

    await getClient().rpc("increment_ad_click", { campaign_id: campaignId });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Ad click tracking error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
