import { Craft } from "@/components/home/craft";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Paths } from "@/components/home/paths";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const dict = await getDictionary(await getLocale());

  return (
    <>
      <Hero dict={dict} />
      <Paths dict={dict} />
      <Craft dict={dict} />
      <HowItWorks dict={dict} />
    </>
  );
}
