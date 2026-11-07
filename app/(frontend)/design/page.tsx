import type { Metadata } from "next";
import { Configurator } from "@/components/design/configurator";
import { parseConfig } from "@/lib/configurator/options";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.design.metaTitle };
}

export default async function DesignPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Configurator initialConfig={parseConfig(await searchParams)} />;
}
