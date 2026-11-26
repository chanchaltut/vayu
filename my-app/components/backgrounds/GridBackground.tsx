// White grid with a few shaded cells snapped to it. On phones the grid is 40px,
// so only a handful of cells (positioned in multiples of 40px) are shown.
export default function GridBackground() {
  return (
    <div aria-hidden className="bg-white-grid pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hidden md:contents">
        <div className="absolute top-16 left-32 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute top-64 left-96 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute top-32 right-60 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute bottom-56 left-48 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute bottom-24 right-92 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute top-112 right-28 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute top-80 left-176 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute bottom-56 right-156 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute top-144 left-16 h-16 w-16 bg-[#F5F5F5]" />
        <div className="absolute bottom-88 right-60 h-16 w-16 bg-[#F5F5F5]" />
      </div>
      <div className="md:hidden">
        <div className="absolute top-[40px] left-[40px] h-10 w-10 bg-[#F5F5F5]" />
        <div className="absolute top-[200px] left-[280px] h-10 w-10 bg-[#F5F5F5]" />
        <div className="absolute top-[480px] left-[120px] h-10 w-10 bg-[#F5F5F5]" />
        <div className="absolute top-[760px] left-[320px] h-10 w-10 bg-[#F5F5F5]" />
        <div className="absolute top-[1040px] left-[0px] h-10 w-10 bg-[#F5F5F5]" />
      </div>
    </div>
  );
}
