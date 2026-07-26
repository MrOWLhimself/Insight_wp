import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Inter, IBM_Plex_Mono, Tangerine } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/config";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
});

// Script font used only for the masthead wordmark — everything else on the
// site stays Manrope/Inter for readability.
const tangerine = Tangerine({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-script",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Insight Magazine — by CitiPlug",
    template: "%s — Insight Magazine",
  },
  description:
    "Culture, city, and campus life from Ijebu Ode and beyond — Insight Magazine by CitiPlug.",
  openGraph: {
    siteName: "Insight Magazine",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} ${plexMono.variable} ${tangerine.variable}`}
      >
        <GoogleAnalytics />
        <AnalyticsTracker />
        <PWAInstallPrompt />
        <PushNotificationPrompt />
        {children}
      </body>
    </html>
  );
}
