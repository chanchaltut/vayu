import Image from "next/image";

export default function BigCloudLogo() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {/* Grey Ellipse Background Layer */}
      <div className="absolute w-175 h-175 -z-10">
        <Image
          src="/assets/Ellipse 1.svg"
          alt="Background Circle"
          fill
          className="object-contain mt-14"
        />
      </div>

      {/* Foreground Massive Text */}
      <div className="flex flex-col items-end text-[#1A1A1A] font-bold tracking-tighter leading-[0.85] -mt-40">
        {/* Top Line: cl[Blue]ud */}
        <div className="flex items-center text-[160px] h-32">
          <span>cl</span>
          <div className="mx-2 -mb-4 relative w-25 h-25 flex items-center justify-center">
            {/* Assuming Shape 106 is the Blue one. Swap if needed! */}
            <Image
              src="/assets/Shape 106.svg"
              alt="o"
              fill
              className="object-contain"
            />
          </div>
          <span>ud</span>
        </div>

        {/* Bottom Line: c[Green]mmunity */}
        <div className="flex items-center text-[160px] h-32">
          <span>c</span>
          <div className="mx-2 -mb-4 relative w-25 h-25 flex items-center justify-center">
            <Image
              src="/assets/GreenShape.svg"
              alt="o"
              fill
              className="object-contain"
            />
          </div>
          <span>mmunity</span>
        </div>
      </div>
    </div>
  );
}
