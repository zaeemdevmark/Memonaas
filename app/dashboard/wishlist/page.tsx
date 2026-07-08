import { requireCustomer } from "@/lib/auth/helpers";
import { getWishlist }     from "@/lib/services/wishlist.service";
import WishlistManager     from "@/components/dashboard/WishlistManager";

export default async function WishlistPage() {
  const { customerId } = await requireCustomer();
  const wishlist        = await getWishlist(customerId);

  return <WishlistManager initialItems={wishlist.items} />;
}
