import Image from "next/image";

const QUOTES = [
  { text: "Absolutely loved the fabric and fit — every detail felt considered.", author: "Ayesha K." },
  { text: "Beautiful design and superb quality. I was genuinely impressed.", author: "Sara M." },
];

export default function Testimonials() {
  return (
    <section className="bg-[var(--surface)]">
      <div className="flex flex-col min-[900px]:flex-row items-stretch">
        <div className="relative w-full min-[900px]:w-[42%] aspect-[4/3] min-[900px]:aspect-auto min-h-[280px] min-[900px]:min-h-[420px]">
          <Image
            src="/images/testimonial.jpg"
            alt="Memonaas customer wearing a piece from the collection"
            fill
            sizes="(max-width: 899px) 100vw, 42vw"
            className="object-cover"
          />
          {/* Blend the photo's edge into the surface background, matching the hero treatment */}
          <div
            aria-hidden="true"
            className="hidden min-[900px]:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[var(--surface)]"
          />
          <div
            aria-hidden="true"
            className="min-[900px]:hidden absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--surface)] to-transparent"
          />
        </div>
        <div className="min-w-0 min-[900px]:w-[58%] flex flex-col justify-center gap-6 px-6 md:px-14 py-12">
          {QUOTES.map((q) => (
            <div key={q.author} className="border-l-2 border-[var(--accent)] pl-5">
              <p className="font-display text-lg md:text-xl text-[var(--ink)] italic leading-snug max-w-lg">
                &ldquo;{q.text}&rdquo;
              </p>
              <p className="mt-2 text-[13px] text-[var(--muted)]">— {q.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
