import Image from "next/image";

export default function BigCloudLogo() {
  const row = "flex h-[46px] items-center text-[52px] xs:h-[50px] xs:text-[58px] sm:h-20 sm:text-[100px] lg:h-32 lg:text-[160px]";
  const dot = "relative mx-0.5 -mb-1.5 h-8 w-8 xs:h-9 xs:w-9 sm:mx-1 sm:-mb-2 sm:h-16 sm:w-16 lg:mx-2 lg:-mb-4 lg:h-25 lg:w-25";
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center" role="img" aria-label="cloud community">
      <div className="absolute -z-10 h-[300px] w-[300px] xs:h-[340px] xs:w-[340px] sm:h-[460px] sm:w-[460px] lg:h-175 lg:w-175">
        <Image src="/assets/Ellipse 1.svg" alt="" fill className="mt-6 object-contain lg:mt-14" />
      </div>
      <div className="flex flex-col items-end font-bold leading-[0.85] tracking-tighter text-[#1A1A1A] lg:-mt-40" aria-hidden>
        <div className={row}>
          <span>cl</span>
          <span className={dot}>
            <Image src="/assets/Shape 106.svg" alt="" fill className="object-contain" />
          </span>
          <span>ud</span>
        </div>
        <div className={row}>
          <span>c</span>
          <span className={dot}>
            <Image src="/assets/GreenShape.svg" alt="" fill className="object-contain" />
          </span>
          <span>mmunity</span>
        </div>
      </div>
    </div>
  );
}
