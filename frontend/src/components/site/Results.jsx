import { useEffect, useRef, useState } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { Reveal, SectionTitle, useCountUp } from "./Reveal";

const ResultCard = ({ item, index }) => {
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setRun(true), index * 180);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const tens = useCountUp(Number(item.tens) || 0, run);
  const passed = useCountUp(Number(item.passed) || 0, run);

  return (
    <div
      ref={ref}
      data-testid={`result-card-${index}`}
      className="relative rounded-3xl border border-white/12 bg-white/[0.04] backdrop-blur-md p-6 sm:p-7 transition-all duration-500 hover:bg-white/[0.08] hover:-translate-y-1.5"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] px-3.5 py-1.5 text-[11px] font-semibold tracking-wide">
        <Trophy className="w-3.5 h-3.5" /> {item.rok}
      </span>
      <div className="mt-6 flex items-end gap-3">
        <span className="font-head text-5xl font-bold text-white tabular-nums leading-none">{tens}</span>
        <span className="text-sm text-[#D4AF37] font-semibold pb-1.5">desetki</span>
      </div>
      <div className="mt-3 text-sm text-white/70">{item.subject}</div>
      {Number(item.passed) > 0 && (
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-white/55">
          <TrendingUp className="w-3.5 h-3.5 text-[#4A90D9]" />
          <span className="tabular-nums">{passed}</span> položenih ukupno u ovom roku
        </div>
      )}
    </div>
  );
};

export const Results = ({ settings }) => {
  const items = settings?.results || [];
  if (!items.length) return null;

  return (
    <section id="rezultati" data-testid="results-section" className="py-16 sm:py-24 bg-[#0A1F44] relative grain">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <Reveal>
          <SectionTitle
            light
            eyebrow="Sveži rezultati"
            title={settings.results_title || "Rezultati sa poslednjih rokova"}
            subtitle={settings.results_note}
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6" data-testid="results-grid">
          {items.map((item, i) => (
            <Reveal key={`${item.rok}-${i}`} delay={i * 80}>
              <ResultCard item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
