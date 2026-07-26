import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json();
    const p256dh = sub.keys?.p256dh;
    const auth = sub.keys?.auth;

    if (!sub.endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
    }

    const { error } = await getClient()
      .from("push_subscriptions")
      .upsert({ endpoint: sub.endpoint, p256dh, auth }, { onConflict: "endpoint" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
