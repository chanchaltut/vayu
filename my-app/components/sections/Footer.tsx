import GridBackground from "@/components/backgrounds/GridBackground";
import TeamMember from "@/components/cards/TeamMember";
import BigCloudLogo from "@/components/texts/BigCloudLogo";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative w-full h-150 overflow-hidden bg-transparent"
    >
      <div className="relative w-full h-full flex flex-col justify-between z-10 pb-32">
        {/* Background Grid */}
        <GridBackground />
        
        {/* Absolute Centered Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <BigCloudLogo />
        </div>

        {/* Top Row Corners */}
        <div className="relative z-10 w-full flex justify-between items-start p-12 lg:p-16 pointer-events-none">
          <div className="pointer-events-auto">
            <TeamMember
              role="Backend Developer"
              name="Chanchal Pradhan"
              alignment="left"
              instagram="chanchalpradhan_"
              github="chanchaltut"
              linkedin="chanchalpradhan"
            />
          </div>
          <div className="pointer-events-auto">
            <TeamMember
              role="UI/UX Designer & Hardware Engineer"
              name="Partha Biswas"
              alignment="right"
              instagram="biswasparttha"
              github="parttha06"
              linkedin="partha-biswass"
            />
          </div>
        </div>

        {/* Bottom Area Wrapper */}
        <div className="relative z-10 w-full flex flex-col pointer-events-none mt-auto">
          {/* Bottom Row Corners */}
          <div className="w-full flex justify-between items-end px-12 lg:px-16 mb-4 pointer-events-none">
            <div className="pointer-events-auto">
              <TeamMember
                role="Frontend Developer"
                name="Ankit Gupta"
                alignment="left"
                instagram="ankitgupta.connectig"
                github="ankitgupta74"
                linkedin="ankitgupta74"
              />
            </div>
            <div className="pointer-events-auto">
              <TeamMember
                role="ML Engineer"
                name="Sumit Mandi"
                alignment="right"
                instagram="verticeop_"
                github="verticeop"
                linkedin="sumit-mandi"
              />
            </div>
          </div>

          {/* Copyright Row */}
          <div className="w-full px-12 lg:px-16 mb-6 pointer-events-auto">
            <span className="text-[#171717] text-[15px] font-medium tracking-tight">
              © Copyright 2026. Doomsday. All rights reserved.
            </span>
          </div>
        </div>
      </div>

      {/* Giant "LET'S WORK TOGETHER" Text */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center items-end overflow-hidden mb-[-2%] z-20 pointer-events-none pt-28">
        <h1
          className="text-[#171717] font-black whitespace-nowrap tracking-tighter drop-shadow-md"
          style={{
            fontSize: "7.5vw",
            lineHeight: "0.75",
            transform: "scaleY(1.4)",
            transformOrigin: "bottom",
          }}
        >
          LET&apos;S WORK TOGETHER
        </h1>
      </div>
    </footer>
  );
}
