// Shared primitive components for the customer dashboard

export function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const STATUS_STYLE: Record<string, string> = {
  Pending:    "bg-gray-50   text-gray-600   border border-gray-200",
  Processing: "bg-amber-50  text-amber-600  border border-amber-200",
  Shipped:    "bg-violet-50 text-violet-600 border border-violet-200",
  Delivered:  "bg-green-50  text-green-600  border border-green-200",
  Cancelled:  "bg-red-50    text-red-500    border border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${STATUS_STYLE[status] ?? "bg-gray-50 text-gray-600 border border-gray-200"}`}>
      {status}
    </span>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-light text-[var(--black)] mb-7">
      {children}
    </h2>
  );
}

export function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="text-[#CCCCCC]">{icon}</div>
      <p className="text-[13px] text-[var(--black)] font-medium">{title}</p>
      {body && <p className="text-[12px] text-[var(--muted)]">{body}</p>}
    </div>
  );
}

export function InlineInput({
  label, value, onChange, type = "text", placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border px-4 py-3 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
          error ? "border-red-300 focus:border-red-400" : "border-[#E8E8E8] focus:border-[var(--black)]"
        }`}
      />
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-[12px] px-4 py-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
      </svg>
      {msg}
    </div>
  );
}

export function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[12px] px-4 py-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
      </svg>
      {msg}
    </div>
  );
}

export function SkeletonLine({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-[#F0F0F0] animate-pulse rounded-sm`} />;
}

export function SkeletonCard() {
  return (
    <div className="border border-[#E8E8E8] p-6 space-y-3 animate-pulse">
      <SkeletonLine w="w-1/3" h="h-8" />
      <SkeletonLine w="w-1/2" />
    </div>
  );
}

export function fp(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    year: "numeric", month: "long", day: "numeric",
  });
}
