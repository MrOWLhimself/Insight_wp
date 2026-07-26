"use client";

type Props = { path: string; title: string };

export default function ShareButtons({ path, title }: Props) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    alert("Link copied.");
  }

  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow">Share</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center border border-rule text-xs font-bold hover:bg-ink hover:text-paper hover:border-ink transition-colors"
          aria-label={`Share on ${l.label}`}
        >
          {l.label[0]}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="w-9 h-9 flex items-center justify-center border border-rule text-xs hover:bg-ink hover:text-paper hover:border-ink transition-colors"
        aria-label="Copy link"
      >
        ⎘
      </button>
    </div>
  );
}
