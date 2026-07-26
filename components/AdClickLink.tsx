"use client";

type Props = {
  campaignId: string;
  href: string;
  className?: string;
  children: React.ReactNode;
};

export default function AdClickLink({ campaignId, href, className, children }: Props) {
  function handleClick() {
    // Fire-and-forget — never block or delay the actual navigation.
    fetch("/api/ad-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block overflow-hidden ${className || ""}`}
    >
      {children}
    </a>
  );
}
