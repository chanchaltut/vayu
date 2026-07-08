"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  severity: number;
  avg_aqi: number;
  colour: string;
  aqi_category: string;
  action: string;
}

interface HotspotsMapCardProps {
  hotspots?: Hotspot[];
}

const COLOUR_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#a855f7",
};

export default function HotspotsMapCard({ hotspots = [] }: HotspotsMapCardProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, v: "weekly" });

    const initMap = async () => {
      const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await importLibrary("marker") as google.maps.MarkerLibrary;

      const center = hotspots.length > 0
        ? { lat: hotspots[0].lat, lng: hotspots[0].lon }
        : { lat: 28.6139, lng: 77.2090 };

      const map = new Map(mapRef.current!, {
        center,
        zoom: hotspots.length > 0 ? 11 : 10,
        mapId: "vayu_hotspot_map",
        disableDefaultUI: true,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Drop a coloured pin for each hotspot
      hotspots.forEach((hs) => {
        const color = COLOUR_MAP[hs.colour] ?? "#f97316";
        const pin = document.createElement("div");
        pin.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: ${color}; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 11px; font-weight: 700;
        `;
        pin.textContent = String(hs.severity);

        const marker = new AdvancedMarkerElement({
          position: { lat: hs.lat, lng: hs.lon },
          map,
          content: pin,
          title: `AQI ${hs.avg_aqi} — ${hs.aqi_category}`,
        });

        // Info window on click
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;padding:4px 6px;max-width:220px">
              <strong style="font-size:14px">AQI: ${hs.avg_aqi}</strong>
              <p style="margin:4px 0;font-size:12px;color:#555">${hs.aqi_category}</p>
              <p style="margin:0;font-size:12px;color:#333">⚡ ${hs.action}</p>
            </div>
          `,
        });
        marker.addListener("gmp-click", () => infoWindow.open({ anchor: marker, map }));
      });
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspots.length]);

  return (
    <div className="w-150 h-110 bg-[#FAFAFA] rounded-3xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 shrink-0">
        <h3 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
          Hotspots {hotspots.length > 0 && <span className="text-orange-500 text-[18px]">({hotspots.length})</span>}
        </h3>
        <button title="Menu" type="button" className="text-[#8C8C8C] cursor-pointer">
          <Image src="/assets/Menu.svg" alt="Menu" width={28} height={28} className="w-7 h-auto object-contain" />
        </button>
      </div>

      {/* Map */}
      <div className="px-4 py-3 flex-1">
        <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
      </div>
    </div>
  );
}
