import { getAdSlotConfig } from "@/lib/supabase";
import AdClickLink from "./AdClickLink";

type AdSlotProps = {
  slotKey: string;
  size: string;
  className?: string;
};

// Real ad rendering: a sold manual campaign takes priority; falls back to
// Google AdSense if the slot allows automatic and a network code is set;
// falls back to an empty placeholder if nothing's configured yet (never
// breaks the layout either way).
export default async function AdSlot({ slotKey, size, className = "" }: AdSlotProps) {
  const config = await getAdSlotConfig(slotKey);

  // Manual campaign, sold and active — takes priority
  if (config?.campaign) {
    const { campaign } = config;
    return (
      <AdClickLink
        campaignId={campaign.id}
        href={campaign.destination_url || "#"}
        className={className}
      >
        {campaign.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.image_url}
            alt={campaign.alt_text || campaign.name}
            className="w-full h-full object-cover"
          />
        )}
      </AdClickLink>
    );
  }

  // Automatic mode with a real AdSense unit configured
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  if (
    config &&
    (config.ad_mode === "automatic" || config.ad_mode === "both") &&
    config.network_code &&
    publisherId
  ) {
    return (
      <div className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={publisherId}
          data-ad-slot={config.network_code}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Nothing configured yet — placeholder, never breaks the layout
  return (
    <div
      className={`border border-dashed border-rule bg-[#F3F1EA] flex items-center justify-center text-ink-soft font-mono text-[11px] uppercase tracking-eyebrow text-center ${className}`}
    >
      Ad Slot — {size}
    </div>
  );
}
