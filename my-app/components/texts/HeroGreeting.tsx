interface HeroGreetingProps {
  line1?: string;
  line2?: string;
}

export default function HeroGreeting({
  line1 = "Good",
  line2 = "Morning",
}: HeroGreetingProps) {
  return (
    <div className="flex flex-col text-white font-bold leading-[0.85] tracking-tight">
      <h1 className="text-[clamp(80px,8vw,130px)] m-0 p-0">{line1}</h1>
      <h1 className="text-[clamp(80px,8vw,130px)] m-0 p-0">{line2}</h1>
    </div>
  );
}
