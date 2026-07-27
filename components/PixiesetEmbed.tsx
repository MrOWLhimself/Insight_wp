// components/PixiesetEmbed.tsx
//
// Embeds a Pixieset gallery inline. A post can have this AND a normal
// WordPress-media gallery at the same time - they are independent content
// blocks, not either/or. Pixieset's own embed is just an iframe pointing
// at the public gallery URL; no API key needed for a public gallery.

export default function PixiesetEmbed({ url, title }: { url: string; title: string }) {
  if (!url) return null;
  return (
    <section className="my-8">
      <h2 className="mb-4 text-xl font-bold">Photo Gallery</h2>
      <div className="w-full overflow-hidden rounded-lg border border-gray-200" style={{ aspectRatio: '4 / 3' }}>
        <iframe
          src={url}
          title={`${title} - Pixieset Gallery`}
          className="h-full w-full"
          loading="lazy"
          allowFullScreen
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Gallery hosted on Pixieset. If it does not load, {' '}
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          open it directly
        </a>.
      </p>
    </section>
  );
}
