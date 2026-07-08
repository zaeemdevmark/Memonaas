"use client";

interface SizeGuideButtonProps {
  onClick: () => void;
}

export default function SizeGuideButton({ onClick }: SizeGuideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm underline underline-offset-2 text-stone-500 hover:text-stone-800 transition-colors"
    >
      Size Guide
    </button>
  );
}
