// components/BBNaijaLiveFeed.tsx
//
// Embeds @BBNaija's official X (Twitter) timeline using X's own public embed
// widget - no API key, no scraping, fully within X's terms of service.
// It auto-refreshes on its own; nothing here needs maintaining.
'use client';

import Script from 'next/script';

export default function BBNaijaLiveFeed() {
  return (
    <aside className="w-full">
      <h2 className="mb-3 text-lg font-bold">Live from @BBNaija</h2>
      <a className="twitter-timeline" data-height="600" data-theme="light" href="https://twitter.com/BBNaija?ref_src=twsrc%5Etfw">Tweets by BBNaija</a>
      <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
    </aside>
  );
}
