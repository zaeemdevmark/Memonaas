import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1.5 text-[11px] tracking-[0.08em] uppercase text-[#999] pt-5 pb-2 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="select-none text-[#DDD]" aria-hidden="true">
              /
            </span>
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-[#111] transition-colors duration-150"
            >
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-[#333]" : ""}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
