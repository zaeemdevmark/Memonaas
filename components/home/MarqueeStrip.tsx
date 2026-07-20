const ITEMS = [
  "Handcrafted In Pakistan",
  "Premium Fabrics, Timeless Design",
  "Free Shipping Over Rs. 5,000",
  "New Arrivals Every Week",
];

export default function MarqueeStrip() {
  return (
    <div className="bg-[var(--ink)] overflow-hidden py-4" aria-hidden="true">
      <div className="marquee-track">
        {[...ITEMS, ...ITEMS].map((text, i) => (
          <span
            key={i}
            className="flex items-center shrink-0 px-8 text-[12.5px] font-medium tracking-[0.25em] uppercase text-[var(--accent)] whitespace-nowrap"
          >
            {text}
            <span className="ml-8 text-[var(--accent)]/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
