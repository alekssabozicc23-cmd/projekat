import { useState } from "react";
import { toast } from "sonner";
import { Download, Gift } from "lucide-react";
import { api, fileUrl } from "../../lib/api";
import { Reveal, SectionTitle } from "./Reveal";

export const FreeMaterial = ({ freeDoc }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", school: "" });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Unesi ime i email adresu.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/leads", form);
      setReady(data);
      toast.success("Materijal je spreman za preuzimanje!");
      window.open(fileUrl(data.download_url), "_blank", "noopener");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Greška. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10";

  return (
    <section id="besplatno" data-testid="free-section" className="py-16 sm:py-24 bg-[#F7F5F0]">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[28px] bg-white border border-[#E2E8F0] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/15 text-[#8B6B10] px-4 py-1.5 text-xs font-semibold tracking-wide">
                <Gift className="w-3.5 h-3.5" /> Besplatno
              </span>
              <SectionTitle
                title={freeDoc?.title || "Besplatan materijal za preuzimanje"}
                subtitle="Uzmi deo teorije i primer testa da vidiš kako izgledaju moji materijali i način rada — bez ikakve obaveze."
              />
              <ul className="mt-7 space-y-3 text-sm text-[#475569]">
                <li>• Deo sažete teorije iz računovodstva</li>
                <li>• Primer testa sa kolokvijuma</li>
                <li>• Uzorak praktikuma sa rešenjem</li>
              </ul>
              {ready && (
                <a
                  href={fileUrl(ready.download_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="free-download-link"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0A1F44] text-white px-6 py-3 text-sm font-semibold"
                >
                  <Download className="w-4 h-4" /> Preuzmi ponovo
                </a>
              )}
            </Reveal>
          </div>

          <div className="bg-[#0A1F44] p-8 sm:p-12 relative grain">
            <Reveal delay={80}>
              <h3 className="font-head text-xl sm:text-2xl font-semibold text-white">Unesi podatke i preuzmi</h3>
              <p className="mt-2 text-sm text-white/60">
                Podaci su nam potrebni samo da ti pošaljemo materijal i obavestimo te o novim terminima.
              </p>
              <form onSubmit={submit} className="mt-7 space-y-4" data-testid="free-form">
                <input data-testid="free-name" className={input} placeholder="Ime i prezime *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input data-testid="free-email" type="email" className={input} placeholder="Email adresa *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input data-testid="free-phone" className={input} placeholder="Telefon (opciono)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input data-testid="free-school" className={input} placeholder="Fakultet / škola (opciono)" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="free-submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] hover:bg-[#C59B27] disabled:opacity-60 text-[#0A1F44] font-semibold py-3.5 text-sm transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  {loading ? "Pripremam..." : "Preuzmi besplatno"}
                </button>
                <p className="text-[11px] text-white/45 leading-relaxed">
                  Slanjem podataka prihvataš{" "}
                  <a href="/privatnost" className="underline hover:text-white/80">
                    politiku privatnosti
                  </a>
                  .
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
