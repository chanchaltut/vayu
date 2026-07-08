export default function UploadButton() {
  return (
    <button
      type="button"
      className="w-38 h-12 bg-white border border-black/10 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 cursor-pointer"
    >
      <span className="text-[16px] font-semibold text-black tracking-tight">
        Upload photo
      </span>
    </button>
  );
}
