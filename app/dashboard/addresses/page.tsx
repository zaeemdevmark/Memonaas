import { requireCustomer } from "@/lib/auth/helpers";
import { getAddresses }    from "@/lib/services/address.service";
import AddressManager      from "@/components/dashboard/AddressManager";

export default async function AddressesPage() {
  const { customerId } = await requireCustomer();
  const addresses      = await getAddresses(customerId);

  return <AddressManager initialAddresses={addresses} />;
}
