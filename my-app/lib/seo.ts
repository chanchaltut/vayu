// Site-wide facts used by metadata, JSON-LD, sitemap and llms.txt.
// Keep these factual — they are what search and answer engines quote.

import en from "./i18n/locales/en";

export const SITE_URL = "https://vayuai.vercel.app";
export const SITE_NAME = "VAYU";
export const SITE_TITLE = "VAYU — Live AQI & Pollution Hotspot Map for Kolkata and India";
export const SITE_DESCRIPTION =
  "Check today's air quality (AQI) in Kolkata, Salt Lake, Howrah and anywhere in India, report smoke or burning waste with a photo, and see AI-detected pollution hotspots street by street. Built by team Doomsday with Google Gemini, BigQuery and IoT sensors.";

export const KEYWORDS = [
  "AQI Kolkata",
  "air quality Kolkata today",
  "air pollution Kolkata",
  "AQI Salt Lake",
  "AQI Howrah",
  "AQI Bhowanipore",
  "air quality West Bengal",
  "pollution hotspot map India",
  "report garbage burning Kolkata",
  "report air pollution near me",
  "AQI near me",
  "24 hour AQI forecast",
  "VAYU air quality",
  "VAYU Doomsday",
  "Gemini AI pollution detection",
  "citizen pollution reporting app",
];

export const AREAS = [
  { "@type": "City", name: "Kolkata" },
  { "@type": "Place", name: "Salt Lake (Bidhannagar), Kolkata" },
  { "@type": "Place", name: "Bhowanipore, Kolkata" },
  { "@type": "City", name: "Howrah" },
  { "@type": "AdministrativeArea", name: "West Bengal" },
  { "@type": "Country", name: "India" },
];

export const TEAM = [
  {
    name: "Chanchal Pradhan",
    roleKey: "backend" as const,
    role: "Backend Developer",
    instagram: "chanchalpradhan_",
    github: "chanchaltut",
    linkedin: "chanchalpradhan",
  },
  {
    name: "Partha Biswas",
    roleKey: "design" as const,
    role: "UI/UX Designer & Hardware Engineer",
    instagram: "biswasparttha",
    github: "parttha06",
    linkedin: "partha-biswass",
  },
  {
    name: "Ankit Gupta",
    roleKey: "frontend" as const,
    role: "Frontend Developer",
    instagram: "ankitgupta.connectig",
    github: "ankitgupta74",
    linkedin: "ankitgupta74",
  },
  {
    name: "Sumit Mandi",
    roleKey: "ml" as const,
    role: "ML Engineer",
    instagram: "verticeop_",
    github: "verticeop",
    linkedin: "sumit-mandi",
  },
];

export function personSameAs(p: (typeof TEAM)[number]): string[] {
  return [
    `https://github.com/${p.github}`,
    `https://www.linkedin.com/in/${p.linkedin}`,
    `https://www.instagram.com/${p.instagram}`,
  ];
}

export function buildJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: ["en", "hi", "bn", "or", "gu", "mr", "ta", "te", "ml", "kn", "pa", "as"],
        publisher: { "@id": orgId },
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: "VAYU by Team Doomsday",
        alternateName: ["VAYU", "Doomsday"],
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
        description:
          "Team Doomsday builds VAYU, a hyper-local air pollution hotspot detection platform for Kolkata and India.",
        areaServed: AREAS,
        knowsAbout: ["Air quality index", "Air pollution", "Pollution hotspots", "IoT air sensors", "Gemini AI"],
        sameAs: ["https://github.com/chanchaltut/vayu"],
        member: TEAM.map((p) => ({ "@id": `${SITE_URL}/#person-${p.github}` })),
      },
      ...TEAM.map((p) => ({
        "@type": "Person",
        "@id": `${SITE_URL}/#person-${p.github}`,
        name: p.name,
        jobTitle: p.role,
        memberOf: { "@id": orgId },
        worksFor: { "@id": orgId },
        sameAs: personSameAs(p),
      })),
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: "VAYU — Pollution Hotspot Detection",
        url: SITE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        creator: { "@id": orgId },
        areaServed: AREAS,
        keywords: KEYWORDS.join(", "),
        featureList: [
          "Live AQI and weather for your location",
          "24-hour AQI forecast",
          "Citizen photo pollution reports analysed by Gemini Vision",
          "AI pollution hotspot map",
          "SMS and WhatsApp alerts to municipal teams",
          "Available in 12 Indian languages",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: en.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Live hotspot map", item: `${SITE_URL}/map` },
        ],
      },
    ],
  };
}
