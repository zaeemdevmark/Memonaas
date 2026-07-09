import Image from "next/image";
import Link from "next/link";

export default function FeatureSplit() {
  return (
    <section className="bg-[var(--bg)] py-4 md:py-10">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col min-[900px]:flex-row items-center gap-10 min-[900px]:gap-16">
          <div className="min-[900px]:w-[42%]">
            <h2 className="font-display text-3xl md:text-[40px] leading-[1.15] text-[var(--ink)]">
              Where Elegance Meets
              <br />
              Modern Femininity
            </h2>
            <p className="mt-6 text-[15px] text-[var(--muted)] leading-relaxed max-w-md">
              At Memonaas, we believe fashion is an expression of grace and confidence.
              Every piece blends soft luxury with intricate detailing, so it feels as
              considered on a quiet afternoon as it does at a celebration.
            </p>
            <Link
              href="/about-us"
              className="inline-flex items-center justify-center mt-8 px-7 py-3 text-sm font-medium tracking-wide rounded-[4px] bg-[var(--accent)] text-white hover:bg-[var(--accent-ink)] transition-colors"
            >
              Learn More
            </Link>
          </div>

          <div className="relative w-full min-[900px]:w-[58%] aspect-[4/5] min-[900px]:aspect-[16/11] rounded-[4px] overflow-hidden">
            <Image
              src="/images/about-story.jpg"
              alt="Where elegance meets modern femininity"
              fill
              sizes="(max-width: 899px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
