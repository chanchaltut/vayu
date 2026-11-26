"use client";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import Toast from "../Toast";
import MicButton from "../buttons/MicButton";
import { useI18n } from "@/lib/i18n";
import { UPLOAD_COORDS_KEY, useVayuData } from "@/lib/vayuData";

interface AnalysisResult {
  smoke_detected: boolean;
  dust_detected: boolean;
  severity: number;
  pollution_type: string;
  estimated_aqi_impact: string;
  description: string;
  confidence: number;
}

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
// Vercel rejects request bodies over 4.5 MB, so photos are resized before upload.
const MAX_UPLOAD_BYTES = 4.2 * 1024 * 1024;
const MAX_EDGE = 1920;

async function shrinkImage(file: File): Promise<File> {
  if (file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. a format the browser can't decode; send as-is
  }
}

function getPosition(timeout = 8000): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout, maximumAge: 30000 }
    );
  });
}

export default function UploadCard() {
  const { t, fmt, lang } = useI18n();
  const { coords } = useVayuData();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<"idle" | "locating" | "uploading">("idle");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError(t.report.notImage);
    if (f.size > MAX_INPUT_BYTES) return setError(t.report.tooLarge);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    pick(e.target.files?.[0]);
    e.target.value = ""; // allow re-selecting the same file
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
  };

  const submit = async () => {
    if (!file) return setError(t.report.selectFirst);
    setError(null);
    setStage("locating");
    const gps = await getPosition();
    const { lat, lon } = gps ?? coords; // fall back to the visitor's detected area
    setStage("uploading");

    try {
      const image = await shrinkImage(file);
      if (image.size > MAX_UPLOAD_BYTES) throw new Error(t.report.tooLarge);

      const form = new FormData();
      form.append("image", image);
      form.append("lat", String(lat));
      form.append("lon", String(lon));
      if (description.trim()) form.append("description", description.trim());

      const res = await fetch("/api/photos", { method: "POST", body: form });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || t.report.failed);

      setResult(json.data);
      setCount((c) => c + 1);
      if (gps) localStorage.setItem(UPLOAD_COORDS_KEY, JSON.stringify(gps));
      clear();
      setDescription("");
      setToast({ message: t.report.success, type: "success" });
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : t.report.failed;
      setError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setStage("idle");
    }
  };

  const busy = stage !== "idle";
  const submitLabel = stage === "locating" ? t.report.locating : stage === "uploading" ? t.report.analysing : t.report.submit;
  const sevColor = (s: number) => (s >= 8 ? "text-red-600" : s >= 5 ? "text-orange-500" : "text-green-600");
  const impactColor = (i: string) =>
    /low|good/i.test(i) ? "text-green-600" : /mod|medium/i.test(i) ? "text-amber-500" : "text-red-600";

  const spinner = (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="rainbow-border relative w-full max-w-150 rounded-[30px] p-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] md:rounded-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onInput} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={onInput} />

      <div className="flex w-full flex-col gap-4 rounded-[27px] bg-white p-3.5 sm:p-5 md:gap-6 md:rounded-[29px] md:px-6 md:py-8">
        {/* Dropzone / preview */}
        <div
          role="button"
          tabIndex={0}
          aria-label={t.report.choosePhoto}
          onClick={() => !preview && galleryRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !preview && galleryRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[22px] border-2 border-dashed transition-colors sm:aspect-[16/9] md:aspect-auto md:h-52 md:rounded-3xl ${
            dragging ? "border-[#005AFF] bg-[#005AFF]/5" : preview ? "border-transparent" : "cursor-pointer border-black/10 bg-[#F5F5F5] hover:bg-[#EBEBEB]"
          }`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                aria-label={t.report.remove}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/75"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 text-center text-[#595959]">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:h-12 md:w-12">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <span className="text-[17px] font-semibold tracking-tight text-[#1A1A1A] md:text-[18px]">{t.report.dropTitle}</span>
              <span className="-mt-2 text-[13.5px] font-medium">{t.report.dropHint}</span>
            </div>
          )}
        </div>

        {/* Phone: camera / gallery side by side */}
        <div className="grid grid-cols-2 gap-2.5 md:hidden">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] text-[15px] font-semibold text-white active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t.report.takePhoto}
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-[15px] font-semibold text-[#1A1A1A] active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            {t.report.gallery}
          </button>
        </div>

        {/* Description (+ desktop submit) */}
        <div className="flex items-center gap-2.5 md:gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={busy || !file}
            className="hidden h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-[15px] font-semibold tracking-tight text-black shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:opacity-40 md:flex"
          >
            {busy && spinner}
            {submitLabel}
          </button>
          <label className="flex h-12 min-w-0 flex-1 items-center rounded-full border border-transparent bg-[#F5F5F5] px-5 transition-colors duration-300 focus-within:border-black/10 focus-within:bg-white">
            <span className="sr-only">{t.report.describe}</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && file && !busy && submit()}
              placeholder={t.report.describe}
              maxLength={300}
              enterKeyHint="send"
              className="w-full bg-transparent text-[16px] font-medium text-[#1A1A1A] outline-none placeholder:text-[#8C8C8C] md:text-[15px]"
            />
          </label>
          <MicButton
            locale={lang.locale}
            label={t.report.speak}
            listeningLabel={t.report.listening}
            onText={(txt) => setDescription((d) => (d ? `${d} ${txt}` : txt).slice(0, 300))}
            className="bg-[#F5F5F5] shadow-none md:bg-white md:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          />
        </div>

        {/* Phone: full-width submit */}
        <button
          type="button"
          onClick={submit}
          disabled={busy || !file}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#005AFF] text-[16px] font-semibold text-white shadow-[0_8px_24px_rgba(0,90,255,0.25)] transition-all active:scale-[0.99] disabled:bg-[#BFBFBF] disabled:shadow-none md:hidden"
        >
          {busy && spinner}
          {submitLabel}
        </button>

        <p className="-mt-1 flex items-center justify-center gap-1.5 text-center text-[12.5px] font-medium text-[#8C8C8C] md:-mt-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          {t.report.locationNote}
        </p>

        {error && (
          <p role="alert" className="-mt-1 text-center text-[14px] font-medium text-red-500">
            {error}
          </p>
        )}
        {count > 0 && (
          <p className="flex items-center justify-center gap-1.5 text-center text-[14.5px] font-bold tracking-tight text-green-600">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{count === 1 ? t.report.thanksOne : fmt(t.report.thanksMany, { n: count })}</span>
          </p>
        )}

        {result && (
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-black/5 bg-[#F8F8F8] p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[16px] font-bold text-[#1A1A1A]">{t.report.result}</h4>
              <span className={`rounded-full bg-white px-3 py-1 text-[13px] font-bold ${sevColor(result.severity)}`}>
                {t.report.severity} {result.severity}/10
              </span>
            </div>
            {/* Gemini's free-text description stays in the language Gemini wrote it in. */}
            <p className="text-[14px] font-medium leading-[1.5] text-[#444]">{result.description}</p>
            <div className="grid grid-cols-2 gap-2 border-t border-black/5 pt-3 sm:grid-cols-4">
              <Stat label={result.smoke_detected ? t.report.smoke : t.report.noSmoke}>
                <span className={result.smoke_detected ? "text-red-600" : "text-green-600"}>{result.smoke_detected ? "●" : "✓"}</span>
              </Stat>
              <Stat label={t.report.type}>
                <span className="capitalize text-[#1A1A1A]">{result.pollution_type}</span>
              </Stat>
              <Stat label={t.report.impact}>
                <span className={`capitalize ${impactColor(result.estimated_aqi_impact)}`}>{result.estimated_aqi_impact.replace("_", " ")}</span>
              </Stat>
              <Stat label={t.report.confidence}>
                <span className="text-[#1A1A1A]">{Math.round(result.confidence * 100)}%</span>
              </Stat>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-white px-3 py-2">
      <span className="text-[11.5px] font-semibold text-[#8C8C8C]">{label}</span>
      <span className="text-[14px] font-bold">{children}</span>
    </div>
  );
}
