function CodIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 8.25v10.5a1.5 1.5 0 0 0 1.5 1.5h16.5a1.5 1.5 0 0 0 1.5-1.5V8.25M2.25 8.25l1.386-3.6A1.5 1.5 0 0 1 5.045 3.75h13.91a1.5 1.5 0 0 1 1.409 1.9L21.75 8.25M12 12.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
    </svg>
  );
}

function ShippingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V15h1.5m10.5 3.75a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5V15h-1.5m-13.5 0V6.75A1.5 1.5 0 0 1 5.25 5.25h9a1.5 1.5 0 0 1 1.5 1.5v8.25m-10.5 0h10.5m0 0h3.75l1.5-4.5h-5.25m0 0V6.75" />
    </svg>
  );
}

function ExchangeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

const ITEMS = [
  { icon: CodIcon,      label: "Cash on Delivery" },
  { icon: ShippingIcon, label: "Free Shipping over Rs. 10,000" },
  { icon: ExchangeIcon, label: "7-Day Exchange" },
];

export default function TrustBadgesRow() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3.5 py-5 border-y border-[var(--border)]">
      {ITEMS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2.5 text-[var(--muted)]">
          <span className="text-[var(--accent-text)]">
            <Icon />
          </span>
          <span className="text-[13px] leading-tight tracking-wide">{label}</span>
        </li>
      ))}
    </ul>
  );
}
