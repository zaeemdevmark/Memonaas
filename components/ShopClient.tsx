import ProductCard from "@/components/ProductCard";

interface Product {
  id?:         string;
  slug:        string;
  name:        string;
  price:       string;
  salePrice?:  string;
  soldOut?:    boolean;
  image?:      string;
  hoverImage?: string;
}

interface ShopClientProps {
  products: Product[];
}

export default function ShopClient({ products }: ShopClientProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8 pb-16">
      {products.map((product, idx) => (
        <ProductCard key={product.slug} {...product} priority={idx === 0} />
      ))}
    </div>
  );
}
