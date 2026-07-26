import Image from "next/image";
import type { FeaturedPlace } from "@/lib/supabase";

const CITIPLUG_URL = "https://citiplug.com";

export default function FeaturedPlaces({
  title = "Discover on CitiPlug",
  places,
}: {
  title?: string;
  places: FeaturedPlace[];
}) {
  if (places.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 my-16">
      <div className="flex justify-between items-end border-b border-rule pb-3 mb-8">
        <h2 className="font-display font-extrabold text-3xl text-ink">{title}</h2>
        <a
          href={`${CITIPLUG_URL}/explore`}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow whitespace-nowrap hover:text-orange"
        >
          See all on CitiPlug →
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {places.slice(0, 5).map((place) => (
          <a
            key={place.id}
            href={`${CITIPLUG_URL}/place/${place.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="story-link group block"
          >
            <div className="relative w-full aspect-square overflow-hidden bg-ink/5 mb-3">
              {place.image_url && (
                <Image
                  src={place.image_url}
                  alt={place.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              )}
              {place.rating_average != null && (
                <span className="absolute bottom-2 left-2 bg-ink/85 text-white text-xs font-bold px-2 py-1">
                  ★ {place.rating_average.toFixed(1)}
                </span>
              )}
            </div>
            {place.category && <span className="eyebrow">{place.category}</span>}
            <h3 className="story-title font-display font-extrabold text-sm leading-snug mt-1.5 text-ink">
              {place.name}
            </h3>
            {place.area && <p className="text-ink-soft text-xs mt-1">{place.area}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}
