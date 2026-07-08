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
  centerLat?: number;
  centerLon?: number;
}

const COLOUR_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#a855f7",
};

export default function HotspotsMapCard({
  hotspots = [],
  centerLat = 22.5726,
  centerLon = 88.3639,
}: HotspotsMapCardProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, v: "weekly" });

    const initMap = async () => {
      const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await importLibrary("marker") as google.maps.MarkerLibrary;

      const center = { lat: centerLat, lng: centerLon };

      const map = new Map(mapRef.current!, {
        center,
        zoom: 12, // Zoomed in to show local neighborhood (Kalyani) details
        mapId: "vayu_hotspot_map",
        disableDefaultUI: true,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // 1. Drop a pulsing blue pin for the user's geolocated center
      const userPin = document.createElement("div");
      userPin.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%;
        background: #005AFF; border: 2.5px solid white;
        box-shadow: 0 0 10px 4px rgba(0, 90, 255, 0.5);
        cursor: default;
      `;
      new AdvancedMarkerElement({
        position: center,
        map,
        content: userPin,
        title: "Your Detected Location",
      });

      // 2. Drop a colored pin for each hotspot
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
            <div style="font-family:sans-serif;padding:6px 8px;max-width:240px;color:#1A1A1A">
              <strong style="font-size:14px;display:block;margin-bottom:2px">AQI: ${hs.avg_aqi} (${hs.aqi_category})</strong>
              <span style="font-size:11px;color:#555;display:block;margin-bottom:6px">Severity: ${hs.severity}/10</span>
              <p style="margin:0;font-size:12px;color:#000;font-weight:600">📍 Recommended: ${hs.action}</p>
            </div>
          `,
        });
        marker.addListener("gmp-click", () => infoWindow.open({ anchor: marker, map }));
      });
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspots.length, centerLat, centerLon]);

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
