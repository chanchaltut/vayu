export default function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-white-grid">
      {/* 
        Randomly placed dimmed boxes snapping to the 64px grid. 
        Using background color #F5F5F5 to match the Figma selection colors.
      */}
      <div className="absolute top-16 left-32 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute top-64 left-96 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute top-32 right-60 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute bottom-56 left-48 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute bottom-24 right-92 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute top-112 right-28 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute top-80 left-176 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute bottom-56 right-156 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute top-144 left-16 w-16 h-16 bg-[#F5F5F5]"></div>
      <div className="absolute bottom-88 right-60 w-16 h-16 bg-[#F5F5F5]"></div>
    </div>
  );
}
