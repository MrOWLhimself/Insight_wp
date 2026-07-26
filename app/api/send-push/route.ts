import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getClient } from "@/lib/supabase";

// Called by a WordPress webhook (see the mu-plugin) whenever a post is
// published. Protected by a shared secret so only WordPress can trigger
// it — not something any visitor could hit directly.

export async function POST(req: NextRequest) {
  try {
    const { secret, title, body, url } = await req.json();

    if (secret !== process.env.PUSH_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!title || !url) {
      return NextResponse.json({ error: "title and url are required." }, { status: 400 });
    }

    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPublic || !vapidPrivate) {
      return NextResponse.json({ error: "VAPID keys not configured." }, { status: 500 });
    }

    webpush.setVapidDetails("mailto:hello@citiplug.com", vapidPublic, vapidPrivate);

    const { data: subs, error } = await getClient().from("push_subscriptions").select("*");
    if (error) throw error;

    const payload = JSON.stringify({ title, body: body || "", url });

    const results = await Promise.allSettled(
      (subs ?? []).map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    );

    // Clean up subscriptions that are no longer valid (browser uninstalled,
    // permission revoked, etc. — these come back as 404/410 from the push
    // service).
    const deadEndpoints = (subs ?? [])
      .filter((_, i) => {
        const r = results[i];
        return r.status === "rejected" && [404, 410].includes((r.reason as any)?.statusCode);
      })
      .map((s) => s.endpoint);

    if (deadEndpoints.length > 0) {
      await getClient().from("push_subscriptions").delete().in("endpoint", deadEndpoints);
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ success: true, sent, total: subs?.length ?? 0 });
  } catch (err) {
    console.error("Send push error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
