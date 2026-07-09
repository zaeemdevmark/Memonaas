import Image from "next/image";
import Link from "next/link";

const TILES = [
  { label: "3-Piece Lawn Suits", href: "/collections/3-piece-suits", image: "/seed/cat-suits.jpg" },
  { label: "Festive Wear", href: "/collections/festive-wear", image: "/seed/cat-festive.jpg" },
  { label: "New Arrivals", href: "/shop", image: "/seed/cat-new.jpg" },
];

export default function CategoryTiles() {
  return (
    <section className="bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 min-[640px]:grid-cols-3 gap-5 md:gap-7">
          {TILES.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="group relative aspect-[3/4] rounded-[4px] overflow-hidden block"
            >
              <Image
                src={tile.image}
                alt={tile.label}
                fill
                sizes="(max-width: 639px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent pt-16 pb-5 px-5">
                <span className="font-display text-lg text-white">{tile.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
