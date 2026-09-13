import { useState } from "react";
import { BookOpen, Eye, ShoppingBag, X } from "lucide-react";
import { API } from "../../lib/api";
import { Reveal, SectionTitle } from "./Reveal";

export const Materials = ({ documents = [], onOrder }) => {
  const [preview, setPreview] = useState(null);
  
  // Sigurna provera niza
  const safeDocs = Array.isArray(documents) ? documents : [];
  const skripte = safeDocs.filter((d) => d?.category === "skripta");

  return (
    <section id="materijali" data-testid="materials-section" className="py-16 sm:py-24 bg-white">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow="Materijali"
            title="Skripte i praktikumi"
            subtitle="Materijali nastali iz 17 godina rada sa studentima — sažeta teorija, jasni primeri i zadaci sa detaljnim rešenjima. Pogledaj prvih 5 strana pre poručivanja."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {skripte.map((d, i) => (
            <Reveal key={d.id} delay={i * 80}>
              <article
                data-testid={`material-card-${d.id}`}
                className="h-full flex flex-col rounded-3xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5"
              >
                <div className="relative h-44 bg-gradient-to-br from-[#1B3A6B] to-[#0A1F44] grid place-items-center">
                  <BookOpen className="w-14 h-14 text-[#D4AF37]/80" />
                  <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.16em] text-white/70">
                    {d.group}
                  </span>
                </div>
                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  <h3 className="font-head text-lg sm:text-xl font-semibold text-[#1B3A6B]">{d.title}</h3>
                  {d.price && <div className="mt-3 font-head text-2xl font-bold text-[#0A1F44]">{d.price}</div>}
                  <p className="mt-3 text-sm text-[#475569] leading-relaxed flex-1">
                    PDF materijal sa sažetom teorijom, primerima i zadacima. Preview prvih 5 strana dostupan odmah.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setPreview(d)}
                      data-testid={`material-preview-${d.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#E2E8F0] text-[#1B3A6B] px-5 py-3 text-sm font-medium hover:border-[#4A90D9] transition-colors duration-300"
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button
                      onClick={() => onOrder && onOrder(d)}
                      data-testid={`material-order-${d.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0A1F44] hover:bg-[#1B3A6B] text-white px-5 py-3 text-sm font-semibold transition-colors duration-300"
                    >
                      <ShoppingBag className="w-4 h-4" /> Poruči
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-[#0A1F44]/80 backdrop-blur-sm p-4"
          data-testid="preview-modal"
          onClick={(e) => e.target === e.currentTarget && setPreview(null)}
        >
          <div className="w-full max-w-3xl rounded-3xl bg-white overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-head text-base sm:text-lg font-semibold text-[#0A1F44]">{preview.title}</h3>
                <p className="text-xs text-[#94A3B8]">Preview — prvih 5 strana. Zaštićen sadržaj.</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                data-testid="preview-close"
                className="grid place-items-center w-9 h-9 rounded-full hover:bg-[#F1F5F9] text-[#475569]"
                aria-label="Zatvori"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative bg-[#F1F5F9] no-select" onContextMenu={(e) => e.preventDefault()}>
              <iframe
                title="preview"
                data-testid="preview-frame"
                src={`${API}/documents/${preview.id}/preview#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                className="w-full h-[65vh] border-0"
              />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="font-head text-3xl sm:text-5xl font-bold text-[#0A1F44]/10 rotate-[-24deg] tracking-widest">
                  ANDRI-TIM
                </span>
              </div>
            </div>
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-[#F7F5F0]">
              <p className="text-xs text-[#475569]">Puna verzija se poručuje kontaktom — {preview.price || "cena na upit"}.</p>
              <button
                onClick={() => {
                  onOrder && onOrder(preview);
                  setPreview(null);
                }}
                data-testid="preview-order"
                className="rounded-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#0A1F44] px-6 py-2.5 text-sm font-semibold transition-colors"
              >
                Poruči punu verziju
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
