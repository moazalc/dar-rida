// Turns a snapshot of the 3D preview into a shareable image: the render on
// top, an ivory caption strip below with the house name and her choices.
// Browser-only (uses <canvas> and the page's loaded fonts).

const IVORY = "#f7f2e9";
const CHARCOAL = "#24211f";
const TAUPE = "#766f67";
const CHAMPAGNE = "#c7b49a";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function composeDesignImage({
  shot,
  brand,
  caption,
  summary,
  dir,
}: {
  shot: string;
  brand: string;
  caption: string;
  summary: string;
  dir: "ltr" | "rtl";
}): Promise<Blob> {
  const [img] = await Promise.all([loadImage(shot), document.fonts.ready]);
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue("--font-display") || "serif";
  const body = root.getPropertyValue("--font-body") || "sans-serif";

  const width = img.width;
  const strip = Math.max(150, Math.round(width * 0.15));
  const pad = Math.round(width * 0.045);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = img.height + strip;
  const ctx = canvas.getContext("2d")!;
  ctx.direction = dir;

  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = CHAMPAGNE;
  ctx.fillRect(0, img.height, width, Math.max(1, Math.round(strip * 0.008)));

  const start = dir === "rtl" ? width - pad : pad;
  const end = dir === "rtl" ? pad : width - pad;
  const mid = img.height + strip / 2;

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "start";
  ctx.fillStyle = CHARCOAL;
  ctx.font = `400 ${Math.round(strip * 0.3)}px ${display}`;
  ctx.fillText(brand, start, mid + strip * 0.02);
  ctx.fillStyle = TAUPE;
  ctx.font = `400 ${Math.round(strip * 0.12)}px ${body}`;
  ctx.fillText(caption, start, mid + strip * 0.24);

  ctx.textAlign = "end";
  ctx.fillStyle = CHARCOAL;
  ctx.font = `400 ${Math.round(strip * 0.13)}px ${body}`;
  ctx.fillText(summary, end, mid + strip * 0.06, width * 0.55);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))), "image/png"),
  );
}

/** Hand the browser a file to save. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
