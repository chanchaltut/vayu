import UploadButton from "../buttons/UploadButton";
import MicButton from "../buttons/MicButton";

export default function UploadCard() {
  return (
    <div
      className="w-150 h-98 rounded-4xl p-0.75 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
      // Custom gradient matching the Figma spectrum (Red -> Purple -> Blue -> Green -> Yellow)
      style={{
        background:
          "linear-gradient(135deg, #FF3B30 0%, #C200FB 25%, #005AFF 50%, #00D604 80%, #FFCC00 100%)",
      }}
    >
      {/* Inner White Card */}
      <div className="w-full h-full bg-white rounded-[29px] flex flex-col items-center justify-center gap-10">
        {/* 1. Dropzone Area */}
        <div className="w-136 h-60 bg-[#F5F5F5] rounded-3xl flex items-center justify-center cursor-pointer hover:bg-[#EBEBEB] transition-colors border border-transparent hover:border-black/5">
          <span className="text-[#595959] text-[18px] font-medium tracking-tight flex items-center gap-2">
            Upload here
            {/* Camera Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </span>
        </div>

        {/* 2. Buttons Row */}
        <div className="w-117 h-12 flex items-center justify-between gap-5">
          <UploadButton />

          {/* Share your thoughts input pill */}
          <div className="flex-1 h-full bg-[#F5F5F5] rounded-full flex items-center px-6 border border-transparent focus-within:border-black/10 focus-within:bg-white transition-colors duration-300">
            <input
              type="text"
              placeholder="Share your thoughts"
              className="bg-transparent outline-none w-full text-[16px] text-[#1A1A1A] font-medium placeholder-[#8C8C8C]"
            />
          </div>

          <MicButton />
        </div>
      </div>
    </div>
  );
}
