import { requireCustomer } from "@/lib/auth/helpers";
import { getUserProfile }  from "@/lib/services/user.service";
import { SectionTitle }    from "@/components/dashboard/ui";
import ProfileForm         from "@/components/dashboard/ProfileForm";
import PasswordForm        from "@/components/dashboard/PasswordForm";
import { notFound }        from "next/navigation";

export default async function ProfilePage() {
  const { customerId } = await requireCustomer();
  const profile        = await getUserProfile(customerId);
  if (!profile) notFound();

  return (
    <div className="max-w-lg">
      <SectionTitle>Profile Settings</SectionTitle>
      <ProfileForm initialProfile={profile} />
      <PasswordForm />
    </div>
  );
}
