import { LeafPattern } from "@/components/drawings/leaf-pattern";
import { RidaDrawing } from "@/components/drawings/rida-drawings";
import type { Design } from "@/cms/payload-types";
import { cn } from "@/lib/utils";

/** A design's line drawing on the pale framed card, for designs without photos yet. */
export function DesignTile({
  drawing,
  label,
  id,
  className,
}: {
  drawing: Design["drawing"];
  label: string;
  id: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden border border-champagne/40 bg-card", className)}>
      <LeafPattern id={id} className="pointer-events-none absolute inset-0 text-champagne opacity-[0.09]" />
      <RidaDrawing model={drawing} label={label} className="relative mt-[4%] h-[88%] w-auto" />
    </div>
  );
}
