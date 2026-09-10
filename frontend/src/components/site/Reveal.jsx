import { useEffect, useRef, useState } from "react";

export const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
};

export const SectionTitle = ({ eyebrow, title, subtitle, light = false, testid }) => (
  <div className="max-w-3xl" data-testid={testid}>
    {eyebrow && (
      <span
        className={`inline-block text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase mb-4 ${
          light ? "text-[#D4AF37]" : "text-[#2E5CA8]"
        }`}
      >
        {eyebrow}
      </span>
    )}
    <h2
      className={`font-head text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight ${
        light ? "text-white" : "text-[#0A1F44]"
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`mt-5 text-sm md:text-lg leading-relaxed ${light ? "text-white/70" : "text-[#475569]"}`}>
        {subtitle}
      </p>
    )}
  </div>
);

export const useCountUp = (target, run) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let frame;
    const start = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run]);
  return value;
};
