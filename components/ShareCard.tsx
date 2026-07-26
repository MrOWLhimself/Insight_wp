import Image from "next/image";
import ShareButtons from "./ShareButtons";

export default function ShareCard({
  title,
  imageUrl,
  imageAlt,
  path,
}: {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  path: string;
}) {
  return (
    <div className="border border-rule bg-white flex flex-col sm:flex-row gap-0 overflow-hidden">
      {imageUrl && (
        <div className="relative w-full sm:w-48 aspect-[4/3] sm:aspect-square flex-shrink-0">
          <Image src={imageUrl} alt={imageAlt || title} fill className="object-cover" />
        </div>
      )}
      <div className="p-6 flex flex-col justify-center gap-3">
        <span className="font-script text-2xl text-ink leading-none">Insight Magazine</span>
        <h3 className="font-display font-bold text-lg leading-snug text-ink">{title}</h3>
        <ShareButtons path={path} title={title} />
      </div>
    </div>
  );
}
