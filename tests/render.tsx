import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Server-render a component to HTML, for asserting on markup and attributes. */
export function render(node: ReactElement): string {
  return renderToStaticMarkup(node);
}
