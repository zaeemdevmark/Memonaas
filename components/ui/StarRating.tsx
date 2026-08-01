function Star({ fill }: { fill: number }) {
  const id = `star-clip-${Math.round(fill * 100)}`;
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 inline-block" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--accent)" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={`url(#${id})`}
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

interface StarRatingProps {
  rating: number;
  count:  number;
  showCount?: boolean;
  className?: string;
}

/** Compact "★★★★★ (125)" rating line used under product titles on card grids. */
export default function StarRating({ rating, count, showCount = true, className = "" }: StarRatingProps) {
  if (count <= 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="inline-flex items-center gap-[1px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, rating - i))} />
        ))}
      </span>
      {showCount && <span className="text-[10.5px] text-[var(--muted)]">({count})</span>}
    </div>
  );
}
