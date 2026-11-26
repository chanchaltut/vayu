interface InstructionCardProps {
  step: number;
  title: string;
  description: string;
  last?: boolean;
}

/**
 * Phones: a numbered vertical step with a connecting line.
 * Tablet / desktop: the titled gradient-bordered card from the original design.
 */
export default function InstructionCard({ step, title, description, last = false }: InstructionCardProps) {
  return (
    <>
      <li className="relative flex gap-4 md:hidden">
        <div className="flex flex-col items-center">
          <span className="rainbow-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-[2px]">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#1A1A1A]">{step}</span>
          </span>
          {!last && <span className="mt-1 w-px flex-1 bg-gradient-to-b from-black/20 to-black/0" />}
        </div>
        <div className={last ? "pb-0" : "pb-7"}>
          <h3 className="pt-1.5 text-[17px] font-bold tracking-tight text-black">{title}</h3>
          <p className="mt-1.5 text-[14.5px] font-medium leading-[1.5] tracking-tight text-[#4a4a4a]">{description}</p>
        </div>
      </li>

      <li className="hidden flex-col items-center gap-3 md:flex">
        <h3 className="text-center text-[17px] font-bold tracking-tight text-black lg:text-[18px]">{title}</h3>
        <div className="rainbow-border h-full w-full rounded-3xl p-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex h-full min-h-35 w-full items-start rounded-[22px] bg-white p-5">
            <p className="text-[14.5px] font-medium leading-[1.45] tracking-tight text-[#1A1A1A] lg:text-[15px]">{description}</p>
          </div>
        </div>
      </li>
    </>
  );
}
