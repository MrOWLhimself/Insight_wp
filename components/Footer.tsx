import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";

const SOCIALS = [
  { label: "Facebook", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Pinterest", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "WhatsApp", href: "#" },
  { label: "TikTok", href: "#" },
];

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Copyright", href: "/copyright" },
];

export default function Footer() {
  return (
    <footer className="border-t border-rule mt-16">
      <div className="max-w-lg mx-auto text-center px-6 pt-12 pb-8">
        <span className="eyebrow">Stay in the loop</span>
        <h3 className="font-display font-extrabold text-2xl mt-2 mb-4">
          Get Insight in your inbox
        </h3>
        <NewsletterSignup />
      </div>

      <div className="flex justify-center gap-6 py-6 px-6 border-t border-rule">
        {SOCIALS.map((s) => (
          <a key={s.label} href={s.href} aria-label={s.label} className="text-ink hover:text-orange">
            {s.label[0]}
          </a>
        ))}
      </div>
      <div className="border-t border-ink">
        <div className="max-w-7xl mx-auto flex gap-7 py-4 px-6 text-xs font-semibold overflow-x-auto">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-orange whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 py-5 px-6 pb-10">
        <p className="text-xs text-ink-soft">© {new Date().getFullYear()} Insight by CitiPlug. All rights reserved</p>
        <p className="text-[11px] text-ink-soft text-center max-w-sm">
          Insight is not responsible for the content of external sites and news culled therefrom.
        </p>
        <span className="italic text-2xl" style={{ fontFamily: "Georgia, serif" }}>Insight</span>
      </div>
    </footer>
  );
}
