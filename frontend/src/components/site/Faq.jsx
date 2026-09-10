import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Reveal, SectionTitle } from "./Reveal";

export const Faq = ({ faq }) => {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" data-testid="faq-section" className="py-16 sm:py-24 bg-white">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <Reveal className="lg:col-span-4">
          <SectionTitle
            eyebrow="Najčešća pitanja"
            title="Pitanja koja svi postave"
            subtitle="Ako ne nađeš odgovor, javi se na Viber — odgovaram lično."
          />
        </Reveal>

        <div className="lg:col-span-8 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
          {faq.map((f, i) => (
            <div key={f.id} data-testid={`faq-item-${f.id}`}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                data-testid={`faq-toggle-${f.id}`}
                className="w-full flex items-start justify-between gap-6 text-left py-6 group"
              >
                <span className="font-head text-base sm:text-lg font-medium text-[#0A1F44] group-hover:text-[#2E5CA8] transition-colors">
                  {f.question}
                </span>
                <span
                  className={`grid place-items-center w-8 h-8 rounded-full shrink-0 transition-all duration-300 ${
                    open === i ? "bg-[#0A1F44] text-white rotate-180" : "bg-[#F1F5F9] text-[#1B3A6B]"
                  }`}
                >
                  {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-500 ease-out"
                style={{ maxHeight: open === i ? 400 : 0, opacity: open === i ? 1 : 0 }}
              >
                <p className="pb-6 pr-12 text-sm md:text-base text-[#475569] leading-relaxed">{f.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
