"use client";
import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  severity: number;
  avg_aqi: number;
  predicted_aqi_24h: number;
  aqi_category: string;
  action: string;
  colour: string;
  reasoning: string;
}

const COLOUR_MAP: Record<string, string> = {
  green:  "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red:    "#ef4444",
  purple: "#a855f7",
};

export default function MapPage() {
  const mapRef    = useRef<HTMLDivElement>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/hotspots")
      .then((r) => r.json())
      .then((json) => {
        setHotspots(json?.data?.hotspots ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current) return;

    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, v: "weekly" });

    const initMap = async () => {
      const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await importLibrary("marker") as google.maps.MarkerLibrary;

      const center = hotspots.length > 0
        ? { lat: hotspots[0].lat, lng: hotspots[0].lon }
        : { lat: 28.6139, lng: 77.2090 };

      const map = new Map(mapRef.current!, {
        center,
        zoom: 11,
        mapId: "vayu_live_map",
      });

      hotspots.forEach((hs) => {
        const color = COLOUR_MAP[hs.colour] ?? "#f97316";
        const pin = document.createElement("div");
        pin.style.cssText = `
          width:36px;height:36px;border-radius:50%;
          background:${color};border:3px solid white;
          box-shadow:0 3px 10px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:13px;font-weight:800;cursor:pointer;
        `;
        pin.textContent = String(hs.severity);

        const marker = new AdvancedMarkerElement({
          position: { lat: hs.lat, lng: hs.lon },
          map,
          content: pin,
          title: `AQI ${hs.avg_aqi}`,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;padding:6px 8px;max-width:260px;line-height:1.5">
              <strong style="font-size:15px">AQI: ${hs.avg_aqi}</strong>
              <span style="margin-left:8px;font-size:12px;color:#777">${hs.aqi_category}</span>
              <hr style="margin:6px 0;border:none;border-top:1px solid #eee"/>
              <p style="margin:0;font-size:12px"><b>Severity:</b> ${hs.severity}/10</p>
              <p style="margin:4px 0;font-size:12px"><b>24h Forecast AQI:</b> ${hs.predicted_aqi_24h}</p>
              <p style="margin:4px 0;font-size:12px"><b>Action:</b> ${hs.action}</p>
              <p style="margin:4px 0;font-size:11px;color:#555">${hs.reasoning}</p>
            </div>
          `,
        });
        marker.addListener("gmp-click", () => infoWindow.open({ anchor: marker, map }));
      });
    };

    initMap();
  }, [loading, hotspots]);

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-950">
      {/* Header bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-white/10">
        <div>
          <h1 className="text-white text-2xl font-bold">🗺️ Live Hotspot Map</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {loading ? "Loading hotspots..." : `${hotspots.length} active hotspot${hotspots.length !== 1 ? "s" : ""} detected`}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {(["green","yellow","orange","red"] as const).map((c) => (
            <div key={c} className="flex items-center gap-1.5">
              <div style={{ background: COLOUR_MAP[c] }} className="w-3 h-3 rounded-full" />
              <span className="text-gray-300 text-xs capitalize">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: "calc(100vh - 72px)" }} />
    </main>
  );
}
