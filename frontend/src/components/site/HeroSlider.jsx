import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Award, Users, Star, Sparkles } from "lucide-react";
import { useCountUp } from "./Reveal";

const StatCard = ({ icon: Icon, target, suffix, label, delay }) => {
  const [run, setRun] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRun(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const value = useCountUp(target, run);
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white border border-[#E7EDF6] px-6 py-6 shadow-[0_14px_40px_-26px_rgba(10,31,68,0.45)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_-24px_rgba(10,31,68,0.4)]">
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#EEF3FA] shrink-0">
        <Icon className="w-5 h-5 text-[#2E5CA8]" />
      </span>
      <div>
        <div className="font-head text-3xl sm:text-4xl font-bold text-[#0A1F44] tabular-nums leading-none">
          {value.toLocaleString("sr-RS")}
          {suffix}
        </div>
        <div className="text-xs sm:text-sm text-[#64748B] mt-2 leading-snug">{label}</div>
      </div>
    </div>
  );
};

export const HeroSlider = ({ settings }) => {
  const slides = settings?.hero_slides?.length ? settings.hero_slides : [];
  const [idx, setIdx] = useState(0);

 
  const go = (d) => setIdx((i) => (i + d + slides.length) % slides.length);
  const active = slides[idx] || {};

  return (
    <>
      <section
        id="top"
        data-testid="hero-section"
        className="relative w-full h-[92vh] min-h-[600px] max-h-[900px] overflow-hidden bg-[#0A1F44]"
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity ease-out"
            style={{ transitionDuration: "1400ms", opacity: i === idx ? 1 : 0 }}
          >
            <img
              src={s.image}
              alt={s.title || "Andri-Tim"}
              loading={i === 0 ? "eager" : "lazy"}
             className="w-full h-full object-cover object-[center_18%] lg:object-[75%_22%]"
              style={{ animation: i === idx ? "heroZoom 12s ease-out forwards" : "none" }}
            />
            <div className="absolute inset-0 bg-[#0A1F44]/35" />
          </div>
        ))}


        <div className="relative h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-end lg:justify-center pt-36 pb-16 lg:pt-48 lg:pb-16">
          <div className="max-w-xl lg:max-w-[38%] xl:max-w-[35%]">
            <span
              data-testid="hero-badge"
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#0A1F44]/40 backdrop-blur-sm px-4 py-1.5 text-xs sm:text-sm text-[#E9CF7C] font-semibold tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {active.badge}
            </span>

            <h1
              key={`title-${idx}`}
              data-testid="hero-title"
              className="font-head text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-white leading-[1.08] tracking-tight mt-6 drop-shadow-[0_4px_24px_rgba(10,31,68,0.55)]"
            >
              {active.title}
            </h1>
            <p
              key={`sub-${idx}`}
              data-testid="hero-subtitle"
              className="mt-6 text-sm md:text-lg text-white/90 leading-relaxed max-w-xl drop-shadow-[0_2px_12px_rgba(10,31,68,0.7)]"
            >
              {active.subtitle}
            </p>
	           
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#studenti"
                data-testid="hero-packages-btn"
                className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#0A1F44] font-semibold px-7 py-3.5 text-sm sm:text-base shadow-xl shadow-[#0A1F44]/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Pogledaj pakete
              </a>
              <a
                href="#konsultacije"
                data-testid="hero-consult-btn"
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 hover:bg-white/20 text-white font-medium px-7 py-3.5 text-sm sm:text-base backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                Zakakazi individualni cas
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-[#F6F9FD] to-white py-12 sm:py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div data-testid="hero-stats" className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 -mt-20 sm:-mt-24 relative z-10">
            <StatCard icon={Award} target={17} suffix="+" label="godina iskustva u pripremi učenika" delay={400} />
            <StatCard icon={Users} target={3000} suffix="+" label="pripremljenih učenika i položenih ispita" delay={650} />
            <StatCard icon={Star} target={31} suffix="" label="učenika sa ocenom 10 na I kolokvijumu 2024." delay={900} />
          </div>
        </div>
      </section>
    </>
  );
};