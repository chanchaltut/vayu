import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Pollution Hotspot Map — Kolkata & India",
  description:
    "Live map of AI-confirmed air pollution hotspots in Kolkata, Salt Lake, Howrah and across India, with AQI, severity and the recommended municipal action for each.",
  alternates: { canonical: "/map" },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
