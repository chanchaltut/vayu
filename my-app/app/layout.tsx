import type { Metadata, Viewport } from "next";
import {
  Inter,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, buildJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Indic fonts are not preloaded: the browser only fetches one when that script appears.
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-noto-deva", preload: false, display: "swap" });
const beng = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-noto-beng", preload: false, display: "swap" });
const orya = Noto_Sans_Oriya({ subsets: ["oriya"], variable: "--font-noto-orya", preload: false, display: "swap" });
const gujr = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-noto-gujr", preload: false, display: "swap" });
const taml = Noto_Sans_Tamil({ subsets: ["tamil"], variable: "--font-noto-taml", preload: false, display: "swap" });
const telu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-noto-telu", preload: false, display: "swap" });
const mlym = Noto_Sans_Malayalam({ subsets: ["malayalam"], variable: "--font-noto-mlym", preload: false, display: "swap" });
const knda = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-noto-knda", preload: false, display: "swap" });
const guru = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], variable: "--font-noto-guru", preload: false, display: "swap" });

const fontVars = [inter, deva, beng, orya, gujr, taml, telu, mlym, knda, guru].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [
    { name: "Chanchal Pradhan", url: "https://github.com/chanchaltut" },
    { name: "Partha Biswas", url: "https://github.com/parttha06" },
    { name: "Ankit Gupta", url: "https://github.com/ankitgupta74" },
    { name: "Sumit Mandi", url: "https://github.com/verticeop" },
  ],
  creator: "Team Doomsday",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    images: [{ url: "/assets/Municipality.png", alt: "VAYU pollution hotspot dispatch for Kolkata" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/assets/Municipality.png"],
  },
  robots: { index: true, follow: true },
  other: {
    "geo.region": "IN-WB",
    "geo.placename": "Kolkata",
    "geo.position": "22.5726;88.3639",
    ICBM: "22.5726, 88.3639",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FC8C3C",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontVars} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
