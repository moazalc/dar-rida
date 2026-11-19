import { AccountNav } from "@/components/account/account-nav";
import { getCustomer } from "@/lib/customers";

// Each page checks the sign-in itself (and sends guests to sign in, back to
// that page); the layout only draws the menu when there is someone to show.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer();
  return (
    <div className="mx-auto grid max-w-[90rem] gap-10 px-4 pt-12 pb-24 md:px-10 md:pt-16 md:pb-36 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16 xl:px-18">
      <aside className="lg:sticky lg:top-28 lg:h-fit">{customer && <AccountNav email={customer.email} />}</aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
