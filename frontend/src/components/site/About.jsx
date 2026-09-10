import { GraduationCap, MapPin, Quote, HeartHandshake } from "lucide-react";
import { Reveal, SectionTitle } from "./Reveal";

const achievements = [
  { value: "3.000+", label: "položenih ispita i kolokvijuma" },
  { value: "17", label: "godina rada sa učenicima" },
  { value: "31", label: "desetka na kolokvijumu 2024." },
];

const facts = [
  { icon: GraduationCap, text: "Diplomirani ekonomista — Ekonomski fakultet u Nišu, 2011." },
  { icon: MapPin, text: "Studenti iz Niša, Beograda, Podgorice, Banja Luke, privatnih fakulteta i srednjih ekonomskih škola regiona." },
  { icon: HeartHandshake, text: "Individualan tempo, praktičan pristup i učenje bez stresa." },
];

export const About = ({ settings }) => (
  <section id="o-meni" data-testid="about-section" className="py-16 sm:py-24 bg-white">
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <Reveal className="lg:col-span-5">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-[#2E5CA8]/15 to-[#D4AF37]/20" />
            <img
              src={settings?.about_image}
              alt="Andriana Grozdanović"
              data-testid="about-image"
              className="relative w-full rounded-3xl object-cover aspect-[4/5] shadow-xl"
            />
            <div className="relative sm:absolute sm:-bottom-6 sm:-right-4 mt-4 sm:mt-0 rounded-2xl bg-[#0A1F44] text-white px-6 py-5 shadow-2xl">
              <div className="font-head text-2xl font-bold text-[#D4AF37]">17+</div>
              <div className="text-xs text-white/70 mt-1">godina iskustva</div>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal delay={80}>
            <SectionTitle
              eyebrow="O meni"
              title="Andriana Grozdanović, dipl. ecc."
              subtitle="Sedamnaest godina pomažem studentima i srednjoškolcima da računovodstvo prestane da bude bauk. Kroz moje pripreme prošlo je preko 3.000 uspešno položenih ispita i kolokvijuma."
            />
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-8 space-y-4">
              {facts.map((f) => (
                <div key={f.text} className="flex items-start gap-4">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#F7F5F0] border border-[#E2E8F0] shrink-0">
                    <f.icon className="w-5 h-5 text-[#2E5CA8]" />
                  </span>
                  <p className="text-sm md:text-base text-[#475569] leading-relaxed pt-2">{f.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <figure className="mt-10 relative rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-7 sm:p-8">
              <Quote className="w-8 h-8 text-[#D4AF37] mb-4" />
              <blockquote data-testid="about-quote" className="font-head text-lg sm:text-xl text-[#0A1F44] leading-relaxed">
                „Ne očekujte da vam nešto bude jasno istog trenutka kada ga čujete — znanje se gradi ponavljanjem,
                pitanjima i vežbom. Zato ovde nema glupih pitanja, ni žurbe.”
              </blockquote>
              <figcaption className="mt-4 text-sm text-[#475569]">— Andriana Grozdanović</figcaption>
            </figure>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="about-achievements">
              {achievements.map((a) => (
                <div
                  key={a.label}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="font-head text-2xl font-bold text-[#1B3A6B]">{a.value}</div>
                  <div className="text-xs text-[#475569] mt-1 leading-snug">{a.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);
