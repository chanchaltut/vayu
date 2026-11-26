interface SectionHeaderProps {
  heading: string;
  subheading: string;
  /** Small label shown above the heading on phones. */
  eyebrow?: string;
}

export default function SectionHeader({ heading, subheading, eyebrow }: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center text-black">
      {eyebrow && (
        <span className="mb-3 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#595959] md:hidden">
          {eyebrow}
        </span>
      )}
      <h2 className="m-0 max-w-[14ch] text-balance p-0 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] xs:text-[40px] sm:max-w-none sm:text-[48px] lg:text-[64px] lg:leading-tight lg:tracking-[-0.02em]">
        {heading}
      </h2>
      <p className="mt-3 max-w-[32ch] text-balance text-[16px] font-normal leading-[1.35] tracking-[-0.01em] text-[#3d3d3d] sm:max-w-none sm:text-[20px] lg:mt-1 lg:text-[24px] lg:leading-[1.2] lg:text-black">
        {subheading}
      </p>
    </div>
  );
}
