import { useState } from "react";
import { Check, Crown, MessageCircle } from "lucide-react";
import { viberLink } from "../../lib/contact";
import { Reveal, SectionTitle } from "./Reveal";

export const Packages = ({ packages, settings, onOrder }) => {
  const groups = [...new Set(packages.map((p) => p.group))];
  const [filter, setFilter] = useState("Svi paketi");
  const tabs = ["Svi paketi", ...groups];
  const shown = filter === "Svi paketi" ? packages : packages.filter((p) => p.group === filter);

  return (
    <section id="studenti" data-testid="packages-section" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow="Za studente"
            title="Paketi za kolokvijume i ispite"
            subtitle="Sve što ti je potrebno na jednom mestu: teorija, praktikumi sa rešenjima, video lekcije i konsultacije bez ograničenja. Izaberi paket koji odgovara tvom roku."
            testid="packages-title"
          />
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-9 flex flex-wrap gap-2" data-testid="packages-filters">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                data-testid={`package-filter-${t.replace(/\s+/g, "-").toLowerCase()}`}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium border transition-all duration-300 ${
                  filter === t
                    ? "bg-[#0A1F44] text-white border-[#0A1F44] shadow-md"
                    : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#4A90D9] hover:text-[#1B3A6B]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {shown.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <article
                data-testid={`package-card-${p.id}`}
                className={`relative h-full flex flex-col rounded-3xl p-7 sm:p-8 transition-all duration-500 hover:-translate-y-1.5 ${
                  p.featured
                    ? "bg-[#0A1F44] text-white border-2 border-[#D4AF37] shadow-2xl shadow-[#0A1F44]/20"
                    : "bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl"
                }`}
              >
                {p.featured && (
                  <span
                    data-testid={`package-badge-${p.id}`}
                    className="absolute -top-3.5 left-7 inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] text-[#0A1F44] px-4 py-1.5 text-xs font-bold tracking-wide shadow-lg"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    {p.badge || "Paket meseca"}
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    p.featured ? "text-[#D4AF37]" : "text-[#4A90D9]"
                  }`}
                >
                  {p.group}
                </span>
                <h3 className={`font-head text-xl sm:text-2xl font-semibold mt-3 ${p.featured ? "text-white" : "text-[#1B3A6B]"}`}>
                  {p.name}
                </h3>
                <div className="mt-5 flex items-end gap-2">
                  <span className={`font-head text-3xl font-bold ${p.featured ? "text-[#D4AF37]" : "text-[#0A1F44]"}`}>
                    {p.price}
                  </span>
                </div>
                {p.note && (
                  <p className={`mt-3 text-sm ${p.featured ? "text-white/70" : "text-[#475569]"}`}>{p.note}</p>
                )}

                <ul className="mt-6 space-y-3 flex-1">
                  {(p.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span
                        className={`grid place-items-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${
                          p.featured ? "bg-[#D4AF37]/20" : "bg-[#2E5CA8]/10"
                        }`}
                      >
                        <Check className={`w-3 h-3 ${p.featured ? "text-[#D4AF37]" : "text-[#2E5CA8]"}`} />
                      </span>
                      <span className={`text-sm leading-relaxed ${p.featured ? "text-white/80" : "text-[#475569]"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onOrder(p)}
                    data-testid={`package-order-${p.id}`}
                    className={`flex-1 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                      p.featured
                        ? "bg-[#D4AF37] hover:bg-[#C59B27] text-[#0A1F44]"
                        : "bg-[#0A1F44] hover:bg-[#1B3A6B] text-white"
                    }`}
                  >
                    Poruči paket
                  </button>
                  <a
                    href={viberLink(settings)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Otvori Viber čet sa Andrianom"
                    data-testid={`package-viber-${p.id}`}
                    className={`grid place-items-center rounded-full px-5 py-3 text-sm font-medium border transition-colors duration-300 ${
                      p.featured
                        ? "border-white/25 text-white hover:bg-white/10"
                        : "border-[#E2E8F0] text-[#1B3A6B] hover:border-[#4A90D9]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Pitaj na Viberu
                    </span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
