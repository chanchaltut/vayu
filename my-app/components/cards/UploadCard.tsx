"use client";
import { useRef, useState, ChangeEvent } from "react";

interface AnalysisResult {
  smoke_detected: boolean;
  dust_detected: boolean;
  severity: number;
  pollution_type: string;
  estimated_aqi_impact: string;
  description: string;
  confidence: number;
}

export default function UploadCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) { setError("Please select a photo first."); return; }
    setLoading(true);
    setError(null);

    // Get GPS coords
    let lat = 28.6139, lon = 77.2090; // default: New Delhi
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
      );
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    } catch { /* use default */ }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("lat", String(lat));
    formData.append("lon", String(lon));
    if (description) formData.append("description", description);

    try {
      const res = await fetch("/api/photos", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s: number) =>
    s >= 8 ? "text-red-600" : s >= 5 ? "text-orange-500" : "text-green-600";

  return (
    <div
      className="w-150 rounded-4xl p-0.75 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
      style={{ background: "linear-gradient(135deg, #FF3B30 0%, #C200FB 25%, #005AFF 50%, #00D604 80%, #FFCC00 100%)" }}
    >
      <div className="w-full bg-white rounded-[29px] flex flex-col items-center justify-center gap-6 py-8 px-6">

        {/* Hidden real file input */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* Dropzone / Preview */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-136 h-52 bg-[#F5F5F5] rounded-3xl flex items-center justify-center cursor-pointer hover:bg-[#EBEBEB] transition-colors border border-transparent hover:border-black/5 overflow-hidden relative"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="w-full h-full object-cover rounded-3xl" />
          ) : (
            <span className="text-[#595959] text-[18px] font-medium tracking-tight flex items-center gap-2">
              Upload here
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </span>
          )}
        </div>

        {/* Input + Buttons Row */}
        <div className="w-136 h-12 flex items-center gap-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="w-38 h-12 bg-white border border-black/10 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-[15px] font-semibold text-black tracking-tight">
              {loading ? "Analysing..." : "Upload photo"}
            </span>
          </button>

          <div className="flex-1 h-full bg-[#F5F5F5] rounded-full flex items-center px-5 border border-transparent focus-within:border-black/10 focus-within:bg-white transition-colors duration-300">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see"
              className="bg-transparent outline-none w-full text-[15px] text-[#1A1A1A] font-medium placeholder-[#8C8C8C]"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-[14px] font-medium">{error}</p>
        )}

        {/* Result Panel */}
        {result && (
          <div className="w-136 bg-[#F8F8F8] rounded-2xl p-5 flex flex-col gap-2 border border-black/5">
            <div className="flex items-center justify-between">
              <h4 className="text-[16px] font-bold text-[#1A1A1A]">Gemini Vision Result</h4>
              <span className={`text-[14px] font-bold ${severityColor(result.severity)}`}>
                Severity {result.severity}/10
              </span>
            </div>
            <p className="text-[14px] text-[#444] leading-[1.5]">{result.description}</p>
            <div className="flex gap-4 mt-1 flex-wrap">
              <span className="text-[13px] font-semibold text-[#1A1A1A]">
                {result.smoke_detected ? "🔥 Smoke detected" : "✅ No smoke"}
              </span>
              <span className="text-[13px] font-semibold text-[#1A1A1A]">
                Type: <span className="font-medium text-[#555]">{result.pollution_type}</span>
              </span>
              <span className="text-[13px] font-semibold text-[#1A1A1A]">
                AQI Impact: <span className="font-medium text-[#555]">{result.estimated_aqi_impact}</span>
              </span>
              <span className="text-[13px] font-semibold text-[#1A1A1A]">
                Confidence: <span className="font-medium text-[#555]">{Math.round(result.confidence * 100)}%</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
