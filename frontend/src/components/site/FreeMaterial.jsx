import { useState } from "react";
import { toast } from "sonner";
import { Download, Gift, FileText, CheckCircle2 } from "lucide-react";
import { api, fileUrl } from "../../lib/api";
import { Reveal, SectionTitle } from "./Reveal";

export const FreeMaterial = ({ freeDocs = [] }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", school: "" });
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState([]);

  // Sigurna provera niza da ne bi pucao kod nad null/undefined
  const safeDocs = Array.isArray(freeDocs) ? freeDocs : [];
  const safeUnlocked = Array.isArray(unlocked) ? unlocked : [];

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Unesi ime i email adresu.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/leads", form);
      const docs = Array.isArray(data?.documents) ? data.documents : [];
      setUnlocked(docs);
      toast.success(`Otključano materijala: ${docs.length}. Preuzimanje je počelo.`);
      if (docs[0]) window.open(fileUrl(docs[0].download_url), "_blank", "noopener");
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
                title="Besplatni materijali za preuzimanje"
                subtitle="Uzmi deo teorije, primer testa i uzorak praktikuma da vidiš kako izgledaju moji materijali i način rada — bez ikakve obaveze."
              />

              <div className="mt-7 space-y-3" data-testid="free-docs-list">
                {safeDocs.length === 0 && (
                  <p className="text-sm text-[#94A3B8]">Materijali se trenutno pripremaju.</p>
                )}
                {safeDocs.map((d) => {
                  const ready = safeUnlocked.find((u) => u.id === d.id);
                  return (
                    <div
                      key={d.id}
                      data-testid={`free-doc-${d.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 transition-all duration-300 hover:border-[#4A90D9]"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="grid place-items-center w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] shrink-0">
                          <FileText className="w-4 h-4 text-[#2E5CA8]" />
                        </span>
                        <span className="text-sm font-medium text-[#0A1F44] truncate">{d.title}</span>
                      </span>
                      {ready ? (
                        <a
                          href={fileUrl(ready.download_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`free-download-${d.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[#0A1F44] hover:bg-[#1B3A6B] text-white px-5 py-2.5 text-xs font-semibold transition-colors duration-300"
                        >
                          <Download className="w-3.5 h-3.5" /> Preuzmi
                        </a>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">unesi podatke →</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {safeUnlocked.length > 0 && (
                <p className="mt-6 inline-flex items-center gap-2 text-sm text-[#047857]" data-testid="free-unlocked-note">
                  <CheckCircle2 className="w-4 h-4" /> Svi materijali su otključani — preuzmi koliko želiš.
                </p>
              )}
            </Reveal>
          </div>

          <div className="bg-[#0A1F44] p-8 sm:p-12 relative grain">
            <Reveal delay={80}>
              <h3 className="font-head text-xl sm:text-2xl font-semibold text-white">
                Unesi podatke i preuzmi sve
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Jedan unos otključava sve besplatne materijale. Podaci su nam potrebni samo da ti pošaljemo materijal
                i obavestimo te o novim terminima.
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
                  {loading ? "Pripremam..." : `Preuzmi besplatno${safeDocs.length > 1 ? ` (${safeDocs.length})` : ""}`}
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
