import Image from "next/image";

// "cloud community" brand mark. The two "o"s are coloured shapes.
export default function CloudLogo() {
  const row = "flex h-[22px] items-center text-[26px] leading-none md:h-9 md:text-[38px] lg:h-11 lg:text-[48px]";
  const dot = "relative -mb-1 mx-px h-4 w-4 md:mx-0.5 md:h-5.5 md:w-5.5 lg:-mb-1.5 lg:h-7 lg:w-7";
  return (
    <div className="flex flex-col items-end font-bold tracking-tight text-white" aria-label="cloud community" role="img">
      <div className={row} aria-hidden>
        <span>cl</span>
        <span className={dot}>
          <Image src="/assets/RedShape.svg" alt="" fill className="object-contain" />
        </span>
        <span>ud</span>
      </div>
      <div className={row} aria-hidden>
        <span>c</span>
        <span className={dot}>
          <Image src="/assets/GreenShape.svg" alt="" fill className="object-contain" />
        </span>
        <span>mmunity</span>
      </div>
    </div>
  );
}
