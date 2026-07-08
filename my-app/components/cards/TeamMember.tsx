interface TeamMemberProps {
  role: string;
  name: string;
  alignment: "left" | "right";
  instagram?: string;
  github?: string;
  linkedin?: string;
}

export default function TeamMember({
  role,
  name,
  alignment,
  instagram,
  github,
  linkedin,
}: TeamMemberProps) {
  const isRight = alignment === "right";

  return (
    <div
      className={`flex flex-col gap-4 ${isRight ? "items-end text-right" : "items-start text-left"}`}
    >
      {/* Text Info */}
      <div className="flex flex-col gap-1">
        <span className="text-[16px] text-[#8C8C8C] font-medium tracking-tight">
          {role}
        </span>
        <h4 className="text-[32px] text-[#171717] font-bold tracking-tight leading-none">
          {name}
        </h4>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-3">
        {/* Instagram */}
        {instagram && (
          <a
            href={`https://instagram.com/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="w-9.5 h-9.5 bg-[#171717] rounded-full flex items-center justify-center text-white hover:bg-[#333333] transition-colors cursor-pointer pointer-events-auto"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        )}

        {/* GitHub */}
        {github && (
          <a
            href={`https://github.com/${github}`}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="w-9.5 h-9.5 bg-[#171717] rounded-full flex items-center justify-center text-white hover:bg-[#333333] transition-colors cursor-pointer pointer-events-auto"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
        )}

        {/* LinkedIn */}
        {linkedin && (
          <a
            href={`https://linkedin.com/in/${linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="w-9.5 h-9.5 bg-[#171717] rounded-full flex items-center justify-center text-white hover:bg-[#333333] transition-colors cursor-pointer pointer-events-auto"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
