"use client";

import { useState } from "react";

export default function NewsletterSignup({
  className = "",
}: {
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      setStatus("done");
      setMessage("You're subscribed. Look out for our next issue.");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  if (status === "done") {
    return <p className={`text-sm text-orange ${className}`}>{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="border border-rule bg-paper px-4 py-3 text-sm flex-1"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-orange text-paper px-6 py-3 text-sm font-semibold whitespace-nowrap disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-signal text-xs sm:absolute sm:mt-12">{message}</p>
      )}
    </form>
  );
}
