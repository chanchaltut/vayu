"use client";
import GridBackground from "@/components/backgrounds/GridBackground";
import TeamMember from "@/components/cards/TeamMember";
import BigCloudLogo from "@/components/texts/BigCloudLogo";
import { useI18n } from "@/lib/i18n";
import { TEAM } from "@/lib/seo";

export default function Footer() {
  const { t } = useI18n();
  const [a, b, c, d] = TEAM;
  const member = (p: (typeof TEAM)[number], alignment: "left" | "right", compact = false) => (
    <TeamMember
      role={t.team[p.roleKey]}
      name={p.name}
      alignment={alignment}
      instagram={p.instagram}
      github={p.github}
      linkedin={p.linkedin}
      compact={compact}
    />
  );

  return (
    <footer id="team" className="relative w-full overflow-hidden bg-transparent">
      <GridBackground />

      {/* ── Phone & tablet: logo, team grid, closing line ───────────────── */}
      <div className="relative z-10 flex flex-col px-4 pb-32 pt-14 sm:px-6 md:pb-12 lg:hidden">
        <h2 className="sr-only">{t.team.heading}</h2>
        <div className="relative flex h-[260px] items-center justify-center xs:h-[290px] sm:h-[380px]">
          <BigCloudLogo />
        </div>
        <ul className="relative mx-auto mt-6 grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-4">
          {TEAM.map((p) => (
            <li key={p.github}>{member(p, "left", true)}</li>
          ))}
        </ul>
        <p
          aria-hidden
          className="mt-12 text-center font-black uppercase leading-[0.82] tracking-tighter text-[#171717]"
          style={{ fontSize: "clamp(48px, 16.5vw, 136px)", transform: "scaleY(1.25)", transformOrigin: "bottom" }}
        >
          Let&apos;s work
          <br />
          together
        </p>
        <span className="mt-8 text-center text-[13px] font-medium tracking-tight text-[#595959]">{t.team.copyright}</span>
      </div>

      {/* ── Desktop: team in the four corners around the big logo ────────── */}
      <div className="relative hidden h-150 w-full lg:block">
        <div className="relative z-10 flex h-full w-full flex-col justify-between pb-32">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <BigCloudLogo />
          </div>
          <div className="pointer-events-none relative z-10 flex w-full items-start justify-between p-12 xl:p-16">
            <div className="pointer-events-auto">{member(a, "left")}</div>
            <div className="pointer-events-auto">{member(b, "right")}</div>
          </div>
          <div className="pointer-events-none relative z-10 mt-auto flex w-full flex-col">
            <div className="mb-4 flex w-full items-end justify-between px-12 xl:px-16">
              <div className="pointer-events-auto">{member(c, "left")}</div>
              <div className="pointer-events-auto">{member(d, "right")}</div>
            </div>
            <div className="pointer-events-auto mb-6 w-full px-12 xl:px-16">
              <span className="text-[15px] font-medium tracking-tight text-[#171717]">{t.team.copyright}</span>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 z-20 mb-[-2%] flex w-full items-end justify-center overflow-hidden pt-28">
          <p
            aria-hidden
            className="whitespace-nowrap font-black tracking-tighter text-[#171717] drop-shadow-md"
            style={{ fontSize: "7.5vw", lineHeight: "0.75", transform: "scaleY(1.4)", transformOrigin: "bottom" }}
          >
            LET&apos;S WORK TOGETHER
          </p>
        </div>
      </div>
    </footer>
  );
}
