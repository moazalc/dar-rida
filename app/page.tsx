import { Detail } from "@/components/home/detail";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Invitation } from "@/components/home/invitation";
import { Paths } from "@/components/home/paths";
import { RidaCollection } from "@/components/home/rida-collection";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const dict = await getDictionary(await getLocale());

  return (
    <>
      <Hero dict={dict} />
      <Paths dict={dict} />
      <RidaCollection dict={dict} />
      <Invitation dict={dict} />
      <Detail dict={dict} />
      <HowItWorks dict={dict} />
    </>
  );
}
