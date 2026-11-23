import { formatMoney, type Currency, type MarketId } from "@/lib/markets";
import { cn } from "@/lib/utils";

export type PriceLabels = {
  included: string;
  includedGlobal: string;
  unavailable: string;
  tabby?: string;
};

/**
 * One price, with what it covers underneath: everything is included in every
 * market, and Global says so in full (shipping, duties and taxes). `null`
 * means the design has no price in this market.
 */
export function Price({
  minor,
  currency,
  market,
  labels,
  showTabby = false,
  className,
}: {
  minor: number | null;
  currency: Currency;
  market: MarketId | "libya";
  labels: PriceLabels;
  showTabby?: boolean;
  className?: string;
}) {
  if (minor === null) {
    return <p className={cn("text-small text-muted-foreground", className)}>{labels.unavailable}</p>;
  }
  const tabby =
    showTabby && market === "uae" && labels.tabby
      ? labels.tabby.replace("{amount}", formatMoney(Math.ceil(minor / 4), currency))
      : null;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="text-h3 font-heading">
        <bdi>{formatMoney(minor, currency)}</bdi>
      </p>
      <p className="text-small text-muted-foreground">{market === "global" ? labels.includedGlobal : labels.included}</p>
      {tabby ? <p className="text-small text-muted-foreground">{tabby}</p> : null}
    </div>
  );
}
