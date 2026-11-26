interface TeamMemberProps {
  role: string;
  name: string;
  alignment?: "left" | "right";
  instagram?: string;
  github?: string;
  linkedin?: string;
  /** Phones: render as a compact card. */
  compact?: boolean;
}

const ICONS = {
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  GitHub: (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
};

export default function TeamMember({ role, name, alignment = "left", instagram, github, linkedin, compact = false }: TeamMemberProps) {
  const isRight = alignment === "right";
  const links = [
    instagram && { label: "Instagram" as const, href: `https://www.instagram.com/${instagram}` },
    github && { label: "GitHub" as const, href: `https://github.com/${github}` },
    linkedin && { label: "LinkedIn" as const, href: `https://www.linkedin.com/in/${linkedin}` },
  ].filter(Boolean) as { label: keyof typeof ICONS; href: string }[];

  return (
    <div
      className={
        compact
          ? "flex h-full flex-col justify-between gap-4 rounded-3xl border border-black/8 bg-white/90 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-sm"
          : `flex flex-col gap-4 ${isRight ? "items-end text-right" : "items-start text-left"}`
      }
    >
      <div className="flex flex-col gap-1">
        <span className={`font-medium tracking-tight text-[#8C8C8C] ${compact ? "text-[12.5px] leading-snug" : "text-[16px]"}`}>{role}</span>
        <h3 className={`font-bold leading-none tracking-tight text-[#171717] ${compact ? "text-[19px] leading-[1.1]" : "text-[26px] xl:text-[32px]"}`}>{name}</h3>
      </div>
      <div className="flex items-center gap-2.5 md:gap-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={`${name} on ${l.label}`}
            title={l.label}
            className={`flex items-center justify-center rounded-full bg-[#171717] text-white transition-colors hover:bg-[#333] ${compact ? "h-9 w-9" : "h-9.5 w-9.5"}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ICONS[l.label]}
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
