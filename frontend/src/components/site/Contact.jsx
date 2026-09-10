import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Phone, Mail, Instagram, MessageCircle, Send, MapPin } from "lucide-react";
import { api } from "../../lib/api";
import { viberLink, whatsappLink } from "../../lib/contact";
import { Reveal, SectionTitle } from "./Reveal";

export const Contact = ({ settings }) => {
  const [form, setForm] = useState({ name: "", email: "", contact: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error("Unesi ime i poruku.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Poruka je poslata. Javljam se u najkraćem roku!");
      setForm({ name: "", email: "", contact: "", message: "" });
    } catch {
      toast.error("Greška pri slanju poruke.");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-[#D4AF37] focus:bg-white/10";

  const channels = [
    { icon: MessageCircle, label: "Viber", value: settings?.phone, href: viberLink(settings), testid: "contact-viber" },
    { icon: Phone, label: "WhatsApp", value: settings?.phone, href: whatsappLink(settings), testid: "contact-whatsapp" },
    { icon: Instagram, label: "Instagram", value: settings?.instagram_handle || "@casovi.racunovodstva.andriana", href: settings?.instagram, testid: "contact-instagram" },
    { icon: Mail, label: "Email", value: settings?.email, href: `mailto:${settings?.email}`, testid: "contact-email" },
  ];

  return (
    <footer id="kontakt" data-testid="contact-section" className="bg-[#0A1F44] relative grain">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionTitle
                light
                eyebrow="Kontakt"
                title="Javi se — prvi razgovor ništa ne košta"
                subtitle="Najbrže me dobijaš na Viber ili WhatsApp. Odgovaram lično, obično istog dana."
              />
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {channels.map((c) => (
                  <a
                    key={c.label}
                    href={c.href || "#"}
                    target={c.href?.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    data-testid={c.testid}
                    className="flex items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-4 transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
                  >
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#D4AF37]/15 shrink-0">
                      <c.icon className="w-5 h-5 text-[#D4AF37]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-white/50">{c.label}</span>
                      <span className="block text-sm text-white font-medium truncate">{c.value}</span>
                    </span>
                  </a>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-[#D4AF37]" /> {settings?.address}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:col-span-6">
            <form onSubmit={submit} data-testid="contact-form" className="rounded-3xl border border-white/12 bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8 space-y-4">
              <h3 className="font-head text-lg font-semibold text-white">Pošalji poruku</h3>
              <input data-testid="contact-name" className={input} placeholder="Ime i prezime *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input data-testid="contact-email-input" className={input} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input data-testid="contact-phone-input" className={input} placeholder="Telefon / Viber" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <textarea data-testid="contact-message" className={`${input} min-h-[120px]`} placeholder="Tvoje pitanje *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button
                type="submit"
                disabled={loading}
                data-testid="contact-submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] hover:bg-[#C59B27] disabled:opacity-60 text-[#0A1F44] font-semibold py-3.5 text-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" /> {loading ? "Šaljem..." : "Pošalji poruku"}
              </button>
            </form>
          </Reveal>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#D4AF37] text-[#0A1F44] font-head font-extrabold text-sm">
              AT
            </span>
            <span className="text-xs text-white/50">
              © {new Date().getFullYear()} Andri-Tim edukacioni centar · Andriana Grozdanović, dipl. ecc.
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <Link to="/privatnost" data-testid="privacy-link" className="hover:text-white transition-colors">
              Politika privatnosti
            </Link>
            <Link to="/admin" className="hover:text-white transition-colors">
              Admin panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
