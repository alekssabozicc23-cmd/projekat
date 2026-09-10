import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Award, Users, Star } from "lucide-react";
import { useCountUp } from "./Reveal";

const StatCard = ({ icon: Icon, target, suffix, label, delay }) => {
  const [run, setRun] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRun(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const value = useCountUp(target, run);
  return (
    <div className="flex items-start gap-4 px-5 py-5 sm:px-6 sm:py-6 border-l border-white/10 first:border-l-0">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] shrink-0 mt-1" />
      <div>
        <div className="font-head text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {value.toLocaleString("sr-RS")}
          {suffix}
        </div>
        <div className="text-xs sm:text-sm text-white/60 mt-1 leading-snug">{label}</div>
      </div>
    </div>
  );
};

export const HeroSlider = ({ settings }) => {
  const slides = settings?.hero_slides?.length ? settings.hero_slides : [];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (d) => setIdx((i) => (i + d + slides.length) % slides.length);
  const active = slides[idx] || {};

  return (
    <section id="top" data-testid="hero-section" className="relative bg-[#0A1F44] overflow-hidden grain">
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity ease-out"
            style={{ transitionDuration: "1200ms", opacity: i === idx ? 1 : 0 }}
          >
            <img
              src={s.image}
              alt={s.title || "Andri-Tim"}
              className="w-full h-full object-cover object-center"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F44] via-[#0A1F44]/90 to-[#0A1F44]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-transparent to-[#0A1F44]/60" />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-36 pb-16 sm:pt-44 sm:pb-24">
        <div className="max-w-2xl">
          <span
            key={`badge-${idx}`}
            data-testid="hero-badge"
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs sm:text-sm text-[#D4AF37] font-medium tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            {active.badge}
          </span>
          <h1
            key={`title-${idx}`}
            data-testid="hero-title"
            className="font-head text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mt-6"
          >
            {active.title}
          </h1>
          <p key={`sub-${idx}`} data-testid="hero-subtitle" className="mt-6 text-sm md:text-lg text-white/75 leading-relaxed max-w-xl">
            {active.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#studenti"
              data-testid="hero-packages-btn"
              className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#0A1F44] font-semibold px-7 py-3.5 text-sm sm:text-base shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Pogledaj pakete
            </a>
            <a
              href="#konsultacije"
              data-testid="hero-consult-btn"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 hover:bg-white/15 text-white font-medium px-7 py-3.5 text-sm sm:text-base backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              Zakaži konsultacije
            </a>
          </div>
        </div>

        <div
          data-testid="hero-stats"
          className="mt-14 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md divide-y sm:divide-y-0 divide-white/10 max-w-3xl"
        >
          <StatCard icon={Award} target={17} suffix="+" label="godina iskustva u pripremi" delay={300} />
          <StatCard icon={Users} target={3000} suffix="+" label="pripremljenih učenika" delay={500} />
          <StatCard icon={Star} target={31} suffix="" label="desetki na kolokvijumu 2024." delay={700} />
        </div>

        {slides.length > 1 && (
          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={() => go(-1)}
              data-testid="hero-prev"
              aria-label="Prethodna slika"
              className="grid place-items-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              data-testid="hero-next"
              aria-label="Sledeća slika"
              className="grid place-items-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 ml-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  data-testid={`hero-dot-${i}`}
                  aria-label={`Slika ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === idx ? "w-10 bg-[#D4AF37]" : "w-4 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
