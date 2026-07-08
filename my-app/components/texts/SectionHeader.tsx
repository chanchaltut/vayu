interface SectionHeaderProps {
  heading: string;
  subheading: string;
}

export default function SectionHeader({
  heading,
  subheading,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center text-black">
      <h2 className="text-[64px] font-semibold tracking-[-0.02em] leading-tight m-0 p-0">
        {heading}
      </h2>
      <p className="text-[24px] font-normal tracking-[-0.02em] leading-[1.2] mt-1">
        {subheading}
      </p>
    </div>
  );
}
