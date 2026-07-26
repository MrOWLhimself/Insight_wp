export default function YouTubeConnect({
  channelUrl,
  title,
  description,
}: {
  channelUrl: string;
  title: string;
  description: string;
}) {
  return (
    <section className="max-w-7xl mx-auto my-16 bg-ink grid md:grid-cols-2 items-center">
      <div className="p-10 md:p-12">
        <span className="eyebrow">Watch</span>
        <h2 className="font-display font-extrabold text-3xl text-white mt-3 mb-3">
          {title}
        </h2>
        <p className="text-[#C7C7CC] text-sm leading-relaxed max-w-sm mb-6">
          {description}
        </p>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-orange text-paper px-6 py-3 font-semibold text-sm"
        >
          ▶ Subscribe on YouTube
        </a>
      </div>
      <a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-video"
      >
        <div className="absolute inset-0 bg-ink-soft/40 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-ink text-xl">
            ▶
          </span>
        </div>
      </a>
    </section>
  );
}
