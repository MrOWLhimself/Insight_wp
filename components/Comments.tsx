"use client";

import { useState } from "react";
import type { WPComment } from "@/lib/wordpress";

export default function Comments({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments: WPComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, authorName: name, authorEmail: email, content }),
    });
    const data = await res.json();

    if (res.ok) {
      setStatus("done");
      setMessage(
        data.status === "approved"
          ? "Comment posted."
          : "Comment received — it'll appear once approved."
      );
      if (data.status === "approved") {
        setComments((prev) => [
          ...prev,
          { id: Date.now(), author_name: name, date: new Date().toISOString(), content: { rendered: `<p>${content}</p>` } },
        ]);
      }
      setName("");
      setEmail("");
      setContent("");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-14 border-t border-rule">
      <h2 className="font-display font-extrabold text-2xl text-ink mb-8">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <div className="flex flex-col gap-6 mb-10">
        {comments.length === 0 ? (
          <p className="text-ink-soft text-sm">Be the first to comment.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border-b border-rule pb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display font-bold text-sm">{c.author_name}</span>
                <span className="text-ink-soft text-xs">
                  {new Date(c.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              <div
                className="text-sm text-ink-soft leading-relaxed [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: c.content.rendered }}
              />
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
        <p className="text-xs text-ink-soft">
          Your email is required to comment, and signs you up for the Insight
          Magazine newsletter — you can unsubscribe from any issue.
        </p>
        <div className="flex gap-4">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 border border-rule bg-paper px-4 py-3 text-sm"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="flex-1 border border-rule bg-paper px-4 py-3 text-sm"
          />
        </div>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Write a comment…"
          className="border border-rule bg-paper px-4 py-3 text-sm leading-relaxed"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="self-start bg-ink text-paper px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {status === "loading" ? "Posting…" : "Post Comment"}
        </button>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-signal" : "text-orange"}`}>{message}</p>
        )}
      </form>
    </section>
  );
}
