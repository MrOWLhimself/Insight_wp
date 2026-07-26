import type { PromoCard } from "@/lib/supabase";

const BADGE_COLOR = "#F97316"; // CitiPlug orange, not yellow

export default function PromoSection({
  title = "Need More Fun Stuff?",
  subtitle = "Checkout these stories from our network",
  cards,
}: {
  title?: string;
  subtitle?: string;
  cards: PromoCard[];
}) {
  if (cards.length === 0) return null;

  return (
    <section className="bg-charcoal py-14">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white">
          {title.toUpperCase()}
        </h2>
        <p
          className="italic text-orange mt-2 mb-10"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {subtitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.slice(0, 3).map((card) => (
            <a
              key={card.id}
              href={card.link_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="bg-white block text-left group"
            >
              <div className="relative aspect-[4/3] bg-ink/10 overflow-hidden">
                {card.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span
                  className="absolute bottom-0 left-0 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white"
                  style={{ background: BADGE_COLOR }}
                >
                  {card.badge_label}
                </span>
              </div>
              <div className="p-5">
                <h3
                  className="italic text-lg leading-snug text-ink mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {card.title}
                </h3>
                <span className="text-xs font-extrabold uppercase tracking-wide text-ink">
                  Take Me There ▸
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
