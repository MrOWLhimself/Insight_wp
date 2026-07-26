import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/supabase";

const WP_API_URL = process.env.WP_API_URL ?? "https://news.citiplug.com/wp-json";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Posts a comment to WordPress (its native comment system — this is the
// single source of truth for comments, moderated in wp-admin like any
// other WP comment) and, since a real email is required to comment,
// piggybacks that email into the newsletter subscribers list too.
//
// Requires WordPress's Settings → Discussion → "Anyone can comment"
// (not "must be registered") for anonymous submission to succeed.
export async function POST(req: NextRequest) {
  try {
    const { postId, authorName, authorEmail, content } = await req.json();

    if (!postId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: "Name, email, and a comment are all required." },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(authorEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const wpRes = await fetch(`${WP_API_URL}/wp/v2/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: postId,
        author_name: authorName,
        author_email: authorEmail,
        content,
      }),
    });

    if (!wpRes.ok) {
      const errText = await wpRes.text();
      return NextResponse.json(
        { error: `WordPress rejected the comment: ${errText}` },
        { status: 502 }
      );
    }

    const comment = await wpRes.json();

    // Commenting requires a real email, so every commenter becomes a
    // newsletter subscriber too. Failure here shouldn't fail the comment
    // itself — the comment already succeeded in WordPress.
    try {
      await addSubscriber(authorEmail);
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      status: comment.status, // "approved" or "hold" depending on WP's moderation settings
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
