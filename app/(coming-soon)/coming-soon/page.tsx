/**
 * Shown for every shop page while COMING_SOON is set (proxy.ts). The picture is
 * public/media/coming-soon.jpg: replace that file to change it.
 */
export default function ComingSoonPage() {
  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden bg-espresso px-4 text-center text-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- one full-bleed picture, no resizing needed */}
      <img src="/media/coming-soon.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div className="relative flex flex-col items-center gap-6">
        <h1 className="font-heading text-5xl font-light tracking-[0.2em] uppercase sm:text-7xl">Dar Rida</h1>
        <p className="font-heading text-2xl font-light italic sm:text-3xl">Coming soon</p>
        <p lang="ar" dir="rtl" className="font-heading text-2xl sm:text-3xl">
          قريباً
        </p>
        <a href="mailto:info@darrida.net" className="mt-4 text-sm tracking-widest uppercase underline-offset-4 hover:underline">
          info@darrida.net
        </a>
      </div>
    </main>
  );
}
