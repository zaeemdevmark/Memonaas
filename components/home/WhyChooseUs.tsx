const ITEMS = [
  {
    label: "Premium Quality Fabric",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v10.5a2.5 2.5 0 0 1-5 0V7a1 1 0 0 0-1-1H6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6v12a3 3 0 0 0 3 3h9" />
      </svg>
    ),
  },
  {
    label: "Elegant Boutique Designs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 6-8 12-8-12 8-6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16M9.5 3 8 9l4 12M14.5 3 16 9l-4 12" />
      </svg>
    ),
  },
  {
    label: "Perfect for Every Occasion",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75h18M4.5 9.75v9a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-9M12 9.75V21M8.5 6.75a2 2 0 1 1 3.5-1.8 2 2 0 1 1 3.5 1.8H8.5Z" />
      </svg>
    ),
  },
  {
    label: "Cash on Delivery",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h13.5v9H2.25v-9ZM15.75 11.25h2.478a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .44 1.061v2.379h-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 17.25a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm10.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[var(--bg)] py-16 md:py-20 border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <h2 className="text-center font-display text-2xl md:text-3xl text-[var(--ink)] mb-12">
          Why Choose Memonaas
        </h2>
        <div className="grid grid-cols-2 min-[640px]:grid-cols-4 gap-8 md:gap-6">
          {ITEMS.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-3 text-[var(--accent-ink)]">
              {item.icon}
              <span className="text-[13px] text-[var(--ink)] max-w-[140px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
