interface TextDescriptionCardProps {
  reasoning?: string;
}

export default function TextDescriptionCard({
  reasoning = "AI is analysing data. Run hotspot detection to populate this.",
}: TextDescriptionCardProps) {
  return (
    <div
      className="w-full h-full rounded-3xl p-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] shrink-0"
      style={{ background: "linear-gradient(135deg, #FF3B30 0%, #C200FB 25%, #005AFF 50%, #00D604 80%, #FFCC00 100%)" }}
    >
      <div className="w-full h-full bg-white rounded-[22px] px-6 py-5 flex flex-col items-start gap-1.5">
        <h4 className="text-[17px] font-bold text-[#1A1A1A] tracking-tight">Gemini Analysis</h4>
        <p className="text-[15px] text-[#1A1A1A] leading-[1.4] font-medium tracking-tight">{reasoning}</p>
      </div>
    </div>
  );
}
