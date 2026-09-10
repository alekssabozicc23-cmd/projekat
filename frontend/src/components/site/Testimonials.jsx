import { useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal, SectionTitle } from "./Reveal";

export const Testimonials = ({ testimonials, gallery }) => {
  const [idx, setIdx] = useState(0);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count]);

  if (!count) return null;
  const active = testimonials[idx];

  return (
    <section id="utisci" data-testid="testimonials-section" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow="Utisci učenika"
            title="Njihove ocene govore umesto mene"
            subtitle="Studenti iz Niša, Beograda, Podgorice i Banja Luke, i srednjoškolci iz cele regije — evo kako su prošli."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Reveal className="lg:col-span-7">
            <div
              data-testid="testimonial-active"
              className="h-full rounded-3xl bg-white border border-[#E2E8F0] shadow-lg p-7 sm:p-10 flex flex-col"
            >
              <Quote className="w-9 h-9 text-[#D4AF37]" />
              <p className="mt-6 font-head text-lg sm:text-2xl text-[#0A1F44] leading-relaxed">
                „{active.text}”
              </p>
              <div className="mt-7 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-[#475569]">
                    {active.school}
                    {active.subject ? ` · ${active.subject}` : ""}
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < (active.rating || 5) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#E2E8F0]"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-7 flex items-center gap-3">
                <button
                  onClick={() => setIdx((i) => (i - 1 + count) % count)}
                  data-testid="testimonial-prev"
                  className="grid place-items-center w-10 h-10 rounded-full border border-[#E2E8F0] text-[#1B3A6B] hover:bg-[#F8FAFC] transition-colors"
                  aria-label="Prethodni utisak"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIdx((i) => (i + 1) % count)}
                  data-testid="testimonial-next"
                  className="grid place-items-center w-10 h-10 rounded-full border border-[#E2E8F0] text-[#1B3A6B] hover:bg-[#F8FAFC] transition-colors"
                  aria-label="Sledeći utisak"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex gap-1.5 ml-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      aria-label={`Utisak ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === idx ? "w-8 bg-[#0A1F44]" : "w-3 bg-[#CBD5E1]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-4 h-full">
              {(gallery || []).slice(0, 3).map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt="Učenici Andri-Tim centra"
                  loading="lazy"
                  className={`w-full h-full object-cover rounded-2xl shadow-md ${i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"}`}
                />
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="testimonials-grid">
          {testimonials.slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={i * 60}>
              <div
                onClick={() => setIdx(i)}
                data-testid={`testimonial-card-${t.id}`}
                className="cursor-pointer h-full rounded-2xl bg-white border border-[#E2E8F0] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, k) => (
                    <Star key={k} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-sm text-[#475569] leading-relaxed line-clamp-3">„{t.text}”</p>
                <div className="mt-4 text-[11px] text-[#94A3B8]">
                  {t.school}
                  {t.subject ? ` · ${t.subject}` : ""}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
