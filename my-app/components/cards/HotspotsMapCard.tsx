"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useI18n } from "@/lib/i18n";
import { directionsUrl, mapsKey, type Hotspot } from "@/lib/useHotspots";
import { aqiCategoryText } from "@/lib/weatherUi";

interface HotspotsMapCardProps {
  hotspots: Hotspot[];
  centerLat: number;
  centerLon: number;
}

export const COLOUR_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#a855f7",
};

let optionsSet = false;

// ── Google Maps health ────────────────────────────────────────────────────────
// Google reports key/referrer problems through window.gm_authFailure, but a
// project without billing only injects a "can't load Google Maps correctly"
// dialog (.dismissButton) into the map element. Either way we switch every map
// on the page to OpenStreetMap and remember it for the rest of the session.
const BROKEN_KEY = "vayu_maps_unavailable";
const BROKEN_EVENT = "vayu_maps_unavailable";

function markMapsBroken(reason: string) {
  try {
    sessionStorage.setItem(BROKEN_KEY, "1");
  } catch {
    /* private mode */
  }
  console.warn("[map] Google Maps unavailable, using OpenStreetMap:", reason);
  window.dispatchEvent(new Event(BROKEN_EVENT));
}
function subscribeBroken(cb: () => void) {
  window.addEventListener(BROKEN_EVENT, cb);
  return () => window.removeEventListener(BROKEN_EVENT, cb);
}
function mapsBrokenSnapshot() {
  try {
    return sessionStorage.getItem(BROKEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Builds the info-window body with DOM nodes so AI-written text can't inject HTML. */
function infoContent(hs: Hotspot, labels: { severity: string; recommended: string; directions: string; category: string }) {
  const root = document.createElement("div");
  root.style.cssText = "font-family:inherit;padding:4px 6px;max-width:240px;color:#1A1A1A;line-height:1.4";
  const title = document.createElement("strong");
  title.style.cssText = "font-size:14px;display:block;margin-bottom:2px";
  title.textContent = `AQI ${hs.avg_aqi} · ${labels.category}`;
  const sev = document.createElement("span");
  sev.style.cssText = "font-size:12px;color:#555;display:block;margin-bottom:6px";
  sev.textContent = `${labels.severity}: ${hs.severity}/10`;
  const act = document.createElement("p");
  act.style.cssText = "margin:0 0 8px;font-size:12.5px;font-weight:600";
  act.textContent = `${labels.recommended}: ${hs.action}`;
  const link = document.createElement("a");
  link.href = directionsUrl(hs.lat, hs.lon);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.cssText = "font-size:12.5px;font-weight:700;color:#005AFF";
  link.textContent = `${labels.directions} →`;
  root.append(title, sev, act, link);
  return root;
}

export default function HotspotsMapCard({ hotspots, centerLat, centerLon }: HotspotsMapCardProps) {
  const { t } = useI18n();
  const key = mapsKey();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarker = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const broken = useSyncExternalStore(subscribeBroken, mapsBrokenSnapshot, () => false);
  const failed = !key || loadError || broken;

  // Create the map once.
  useEffect(() => {
    const el = mapRef.current;
    if (!key || broken || !el || mapObj.current) return;

    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => markMapsBroken("authentication failure");
    const watcher = new MutationObserver(() => {
      if (el.querySelector(".dismissButton, .gm-err-container")) {
        watcher.disconnect();
        markMapsBroken("error dialog (billing or key restriction)");
      }
    });
    watcher.observe(el, { childList: true, subtree: true });

    if (!optionsSet) {
      setOptions({ key, v: "weekly" });
      optionsSet = true;
    }
    (async () => {
      try {
        const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;
        await importLibrary("marker");
        mapObj.current = new Map(mapRef.current!, {
          center: { lat: centerLat, lng: centerLon },
          zoom: 12,
          mapId: "vayu_hotspot_map",
          disableDefaultUI: true,
          zoomControl: true,
          // One finger scrolls the page on phones; two fingers move the map.
          gestureHandling: "cooperative",
        });
        setReady(true);
      } catch (e) {
        console.error("[map] failed to load Google Maps", e);
        setLoadError(true);
      }
    })();
    return () => watcher.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, broken]);

  // Recentre + user pin when the location changes.
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map) return;
    const center = { lat: centerLat, lng: centerLon };
    map.panTo(center);
    if (!userMarker.current) {
      const dot = document.createElement("div");
      dot.style.cssText =
        "width:16px;height:16px;border-radius:50%;background:#005AFF;border:2.5px solid white;box-shadow:0 0 10px 4px rgba(0,90,255,0.5)";
      userMarker.current = new google.maps.marker.AdvancedMarkerElement({ map, position: center, content: dot, title: t.detect.you });
    } else {
      userMarker.current.position = center;
    }
  }, [ready, centerLat, centerLon, t.detect.you]);

  // Redraw hotspot pins when the data changes.
  useEffect(() => {
    const map = mapObj.current;
    if (!ready || !map) return;
    markers.current.forEach((m) => (m.map = null));
    markers.current = hotspots.map((hs) => {
      const pin = document.createElement("div");
      pin.style.cssText = `width:30px;height:30px;border-radius:50%;background:${COLOUR_MAP[hs.colour] ?? "#f97316"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:700`;
      pin.textContent = String(hs.severity);
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: hs.lat, lng: hs.lon },
        content: pin,
        title: `AQI ${hs.avg_aqi}`,
      });
      const info = new google.maps.InfoWindow({
        content: infoContent(hs, {
          severity: t.report.severity,
          recommended: t.detect.recommended,
          directions: t.act.directions,
          category: aqiCategoryText(hs.aqi_category, t),
        }),
      });
      marker.addListener("gmp-click", () => info.open({ anchor: marker, map }));
      return marker;
    });
  }, [ready, hotspots, t]);

  // Fallback when no Maps key is configured or Google Maps fails to load.
  const d = 0.06;
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLon - d}%2C${centerLat - d}%2C${centerLon + d}%2C${centerLat + d}&layer=mapnik&marker=${centerLat}%2C${centerLon}`;

  return (
    <div className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-3xl bg-[#FAFAFA] shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex shrink-0 items-center justify-between border-b border-black/6 px-4 py-3.5 sm:px-6 sm:py-4">
        <h3 className="text-[19px] font-bold tracking-tight text-[#1A1A1A] sm:text-[22px]">
          {t.detect.mapTitle} {hotspots.length > 0 && <span className="text-[16px] text-orange-500 sm:text-[18px]">({hotspots.length})</span>}
        </h3>
        <Link
          href="/map"
          className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-1.5 text-[13px] font-semibold text-[#1A1A1A] transition-colors hover:bg-black/10"
        >
          {t.detect.fullMap}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </Link>
      </div>

      <div className="relative min-h-[300px] flex-1 p-3 sm:px-4">
        {failed ? (
          <div className="relative h-full min-h-[276px] overflow-hidden rounded-2xl">
            <iframe title={t.detect.mapTitle} src={osm} className="absolute inset-0 h-full w-full border-0" loading="lazy" />
            {hotspots.length > 0 && (
              <ul className="no-scrollbar absolute inset-x-2 bottom-2 flex gap-2 overflow-x-auto">
                {hotspots.slice(0, 6).map((hs) => (
                  <li key={hs.id} className="shrink-0">
                    <a
                      href={directionsUrl(hs.lat, hs.lon)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-bold text-[#1A1A1A] shadow-md"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOUR_MAP[hs.colour] ?? "#f97316" }} />
                      AQI {hs.avg_aqi}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div ref={mapRef} className="h-full min-h-[276px] w-full overflow-hidden rounded-2xl bg-[#EDEDED]" />
        )}
        {!failed && hotspots.length === 0 && ready && (
          <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-[#595959] shadow-md">
            {t.detect.noHotspots}
          </span>
        )}
      </div>
    </div>
  );
}
