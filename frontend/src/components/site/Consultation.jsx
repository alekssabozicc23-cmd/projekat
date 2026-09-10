import { useState } from "react";
import { toast } from "sonner";
import { Send, CalendarCheck } from "lucide-react";
import { api } from "../../lib/api";
import { Reveal, SectionTitle } from "./Reveal";

const empty = { name: "", contact: "", email: "", subject: "", message: "" };

export const Consultation = ({ packages, prefill, onPrefillUsed }) => {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const value = { ...form, subject: prefill || form.subject };

  const set = (k) => (e) => {
    if (k === "subject" && prefill) onPrefillUsed?.();
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!value.name || !value.contact || !value.subject) {
      toast.error("Popuni ime, kontakt i predmet/paket.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/consultations", value);
      toast.success("Zahtev je poslat! Andriana će te kontaktirati u najkraćem roku.");
      setForm(empty);
      onPrefillUsed?.();
    } catch {
      toast.error("Došlo je do greške. Pokušaj ponovo ili se javi na Viber.");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all duration-300 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10";

  return (
    <section id="konsultacije" data-testid="consultation-section" className="py-16 sm:py-24 bg-white">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <Reveal className="lg:col-span-5">
            <SectionTitle
              eyebrow="Konsultacije"
              title="Zakaži konsultacije bez obaveze"
              subtitle="Bez kalendara i čekanja — pošalji zahtev sa predmetom i pitanjem, a ja ti se javljam na Viber ili mejl sa terminom koji ti odgovara."
            />
            <div className="mt-8 rounded-2xl bg-[#F7F5F0] border border-[#E2E8F0] p-6">
              <CalendarCheck className="w-6 h-6 text-[#2E5CA8]" />
              <p className="mt-3 text-sm text-[#475569] leading-relaxed">
                Konsultacije su individualne, online ili u prostoru centra u Nišu. Traju dokle god ima pitanja —
                cilj je da izađeš sa jasnom slikom, ne sa spiskom nedoumica.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-7">
            <form
              onSubmit={submit}
              data-testid="consultation-form"
              className="rounded-3xl border border-[#E2E8F0] bg-white shadow-xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-2">Ime i prezime *</label>
                <input data-testid="consult-name" className={input} value={value.name} onChange={set("name")} placeholder="Marija Marković" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-2">Telefon / Viber *</label>
                <input data-testid="consult-contact" className={input} value={value.contact} onChange={set("contact")} placeholder="06x xxx xxxx" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-2">Email (za potvrdu)</label>
                <input data-testid="consult-email" className={input} value={value.email} onChange={set("email")} placeholder="ime@email.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-2">Predmet / paket *</label>
                <select data-testid="consult-subject" className={input} value={value.subject} onChange={set("subject")}>
                  <option value="">Izaberi...</option>
                  {prefill && !packages.some((p) => `${p.group} — ${p.name}` === prefill) && (
                    <option value={prefill}>{prefill}</option>
                  )}
                  {packages.map((p) => (
                    <option key={p.id} value={`${p.group} — ${p.name}`}>
                      {p.group} — {p.name}
                    </option>
                  ))}
                  <option value="Opšte konsultacije">Opšte konsultacije</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0A1F44] mb-2">Poruka</label>
                <textarea
                  data-testid="consult-message"
                  className={`${input} min-h-[120px] resize-y`}
                  value={value.message}
                  onChange={set("message")}
                  placeholder="Koji fakultet, kada je rok, šta ti najviše nije jasno..."
                />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-[#94A3B8] max-w-xs">
                  Podaci se koriste isključivo radi kontakta u vezi sa pripremama.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="consult-submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0A1F44] hover:bg-[#1B3A6B] disabled:opacity-60 text-white font-semibold px-7 py-3.5 text-sm transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Šaljem..." : "Pošalji zahtev"}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
