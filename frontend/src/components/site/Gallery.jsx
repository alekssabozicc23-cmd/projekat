import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Reveal, SectionTitle } from "./Reveal";

export const Gallery = ({ settings }) => {
  const [open, setOpen] = useState(-1);

  const images = [
    ...(settings?.hero_slides || []).map((s) => s.image),
    settings?.about_image,
    ...(settings?.gallery || []),
  ].filter((v, i, arr) => v && arr.indexOf(v) === i);

  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(-1);
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (!images.length) return null;

  return (
    <section id="galerija" data-testid="gallery-section" className="py-16 sm:py-24 bg-white">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow="Galerija"
            title={settings?.gallery_title || "Galerija"}
            subtitle={settings?.gallery_note}
          />
        </Reveal>

        <div className="mt-10 columns-2 md:columns-3 xl:columns-4 gap-4 sm:gap-5" data-testid="gallery-grid">
          {images.map((src, i) => (
            <Reveal key={src} delay={(i % 4) * 70} className="mb-4 sm:mb-5 break-inside-avoid">
              <button
                onClick={() => setOpen(i)}
                data-testid={`gallery-item-${i}`}
                className="group relative w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <img src={src} alt={`Andri-Tim galerija ${i + 1}`} loading="lazy" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-[#0A1F44]/0 group-hover:bg-[#0A1F44]/25 transition-colors duration-500 grid place-items-center">
                  <Images className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {open >= 0 && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[#0A1F44]/92 backdrop-blur-sm p-4"
          data-testid="gallery-lightbox"
          onClick={(e) => e.target === e.currentTarget && setOpen(-1)}
        >
          <button
            onClick={() => setOpen(-1)}
            data-testid="gallery-close"
            aria-label="Zatvori"
            className="absolute top-5 right-5 grid place-items-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setOpen((i) => (i - 1 + images.length) % images.length)}
            data-testid="gallery-prev"
            aria-label="Prethodna"
            className="absolute left-3 sm:left-8 grid place-items-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img src={images[open]} alt="" className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl" />
          <button
            onClick={() => setOpen((i) => (i + 1) % images.length)}
            data-testid="gallery-next"
            aria-label="Sledeća"
            className="absolute right-3 sm:right-8 grid place-items-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="absolute bottom-6 text-xs text-white/60 tabular-nums">
            {open + 1} / {images.length}
          </span>
        </div>
      )}
    </section>
  );
};
