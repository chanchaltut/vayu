import Image from "next/image";

export default function CloudLogo() {
  return (
    <div className="flex flex-col items-end text-white font-bold tracking-tight">
      {/* Top Line: "cl[RedShape]ud" */}
      <div className="flex items-center leading-none text-[48px] h-11">
        <span>cl</span>
        <div className="mx-0.5 -mb-1.5 relative w-7 h-7 flex items-center justify-center">
          <Image
            src="/assets/RedShape.svg"
            alt="o"
            fill
            className="object-contain"
          />
        </div>
        <span>ud</span>
      </div>

      {/* Bottom Line: "c[GreenShape]mmunity" */}
      <div className="flex items-center leading-none text-[48px] h-11">
        <span>c</span>
        <div className="mx-0.5 -mb-1.5 relative w-7 h-7 flex items-center justify-center">
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
  );
}
