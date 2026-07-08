import Image from "next/image";

export default function DeformedContainer() {
  return (
    <div className="relative w-full overflow-visible drop-shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {/* 1. Background Layer: Using your SVG directly */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/Hero Card.svg"
          alt="Background shape"
          fill
          className="object-fill"
          priority
        />
      </div>

      {/* 2. Content Layer: Removed all clip-paths and inline gradients */}
      <div className="relative z-10 w-full p-6 flex flex-row items-stretch gap-8">
        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <p className="text-[15px] text-[#171717] leading-[1.6] font-medium tracking-tight">
            Every alert on this panel has been verified by our AI —
            cross-referencing citizen-submitted photos with live ground sensor
            readings before surfacing it here. No unconfirmed reports, no noise.
            When a hotspot crosses the severity threshold for your ward, it
            appears at the top of this list with the exact location, pollution
            type, recommended response, and a countdown to your response SLA.
            Your role is simple: review the alert, deploy the right resource,
            and mark it resolved. Every action you take is logged with a
            timestamp and attached to the incident record — building a
            ward-level accountability trail that district administrators and
            your MP&apos;s office can review at any time.
          </p>

          {/* Indented bottom paragraph aligning with the SVG cutout */}
          <div className="w-full flex justify-center ml-20 mt-6">
            {/* The w-[60%] naturally forces the text to wrap around the empty cut-out zone */}
            <p className="w-[60%] text-[15px] text-[#171717] leading-[1.6] font-medium tracking-tight">
              Every minute a hotspot goes unaddressed, a neighbourhood pays the
              price.
            </p>
          </div>
        </div>

        {/* Right: Architecture Image */}
        <div className="w-130 h-65 relative rounded-[14px] overflow-hidden shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/5">
          <Image
            src="/assets/Municipality.png"
            alt="Municipality Building"
            fill
            sizes="520px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
