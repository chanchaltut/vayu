interface InstructionCardProps {
  title: string;
  description: string;
}

export default function InstructionCard({
  title,
  description,
}: InstructionCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-84">
      {/* Title placed outside and above the box */}
      <h3 className="text-[18px] font-bold text-black tracking-tight">
        {title}
      </h3>

      {/* Gradient Border Wrapper (2px padding creates the border thickness) */}
      <div
        className="w-full h-35 rounded-3xl p-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        style={{
          background:
            "linear-gradient(135deg, #FF3B30 0%, #C200FB 25%, #005AFF 50%, #00D604 80%, #FFCC00 100%)",
        }}
      >
        {/* Inner White Box */}
        <div className="w-full h-full bg-white rounded-[22px] p-5 flex items-start">
          <p className="text-[15px] text-[#1A1A1A] leading-[1.4] font-medium tracking-tight">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
