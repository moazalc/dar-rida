import { Detail } from "@/components/home/detail";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Invitation } from "@/components/home/invitation";
import { Paths } from "@/components/home/paths";
import { Spotlight } from "@/components/home/spotlight";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const dict = await getDictionary(await getLocale());

  return (
    <>
      <Hero dict={dict} />
      <Paths dict={dict} />
      <Detail dict={dict} />
      <Spotlight dict={dict} />
      <HowItWorks dict={dict} />
      <Invitation dict={dict} />
    </>
  );
}
