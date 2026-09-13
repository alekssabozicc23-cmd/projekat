import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { api } from "../../lib/api";
import { Reveal, SectionTitle } from "./Reveal";

const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub"];

const mondayOf = (d) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(12, 0, 0, 0);
  return x;
};

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
};

const stateStyle = {
  slobodno: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] hover:bg-[#D1FAE5] hover:border-[#047857] cursor-pointer",
  "na cekanju": "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] cursor-not-allowed",
  zauzeto: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] cursor-not-allowed",
  zatvoreno: "bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed",
};

export const Highschool = () => {
  const [weekStart, setWeekStart] = useState(mondayOf(new Date()));
  const [data, setData] = useState({ week: [], hours: [], slots: [] });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", grade: "", phone: "", email: "", note: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const iso = weekStart.toISOString().slice(0, 10);
      const { data: res } = await api.get("/slots", { params: { week_start: iso } });
      
      // Sigurna provera nivoa podataka iz odgovora
      setData({
        week: Array.isArray(res?.week) ? res.week : [],
        hours: Array.isArray(res?.hours) ? res.hours : [],
        slots: Array.isArray(res?.slots) ? res.slots : [],
      });
    } catch (err) {
      console.error("Greška pri dohvatanju slotova:", err);
      setData({ week: [], hours: [], slots: [] });
    }
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  // Sigurne provere nizova
  const safeWeek = Array.isArray(data?.week) ? data.week : [];
  const safeHours = Array.isArray(data?.hours) ? data.hours : [];
  const safeSlots = Array.isArray(data?.slots) ? data.slots : [];

  const stateOf = (d, h) =>
    safeSlots.find((s) => s?.slot_date === d && s?.slot_time === h)?.state || "slobodno";

  const shiftWeek = (n) => {
    const x = new Date(weekStart);
    x.setDate(x.getDate() + n * 7);
    setWeekStart(x);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.grade || !form.phone) {
      toast.error("Popuni ime, razred i telefon.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/bookings", { ...form, slot_date: selected.date, slot_time: selected.time });
      toast.success("Zahtev za termin je poslat! Dobićeš potvrdu.");
      setSelected(null);
      setForm({ name: "", grade: "", phone: "", email: "", note: "" });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Greška pri rezervaciji.");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10";

  return (
    <section id="srednjoskolci" data-testid="highschool-section" className="py-16 sm:py-24 bg-[#F7F5F0] relative">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <Reveal>
          <SectionTitle
            eyebrow="Za srednjoškolce"
            title="Časovi računovodstva za srednju školu"
            subtitle="Časovi po 60 minuta, radnim danima i subotom od 14h do 19h. Izaberi slobodan termin u kalendaru i pošalji zahtev — potvrdu dobijaš lično od Andriane."
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 rounded-3xl bg-white border border-[#E7EDF6] p-4 sm:p-6 shadow-[0_30px_60px_-40px_rgba(10,31,68,0.45)]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <button
                onClick={() => shiftWeek(-1)}
                data-testid="week-prev"
                className="grid place-items-center w-10 h-10 rounded-full border border-[#E2E8F0] text-[#1B3A6B] hover:bg-[#F8FAFC] transition-colors"
                aria-label="Prethodna nedelja"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="font-head text-sm sm:text-base font-semibold text-[#0A1F44]" data-testid="week-label">
                  {safeWeek.length ? `${fmt(safeWeek[0])} – ${fmt(safeWeek[safeWeek.length - 1])}` : "..."}
                </div>
                <div className="text-xs text-[#94A3B8] mt-0.5 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 14:00 – 19:00
                </div>
              </div>
              <button
                onClick={() => shiftWeek(1)}
                data-testid="week-next"
                className="grid place-items-center w-10 h-10 rounded-full border border-[#E2E8F0] text-[#1B3A6B] hover:bg-[#F8FAFC] transition-colors"
                aria-label="Sledeća nedelja"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
              <div className="min-w-[560px]" data-testid="slots-grid">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  <div />
                  {safeWeek.map((d, i) => (
                    <div key={d} className="text-center">
                      <div className="text-xs font-semibold text-[#0A1F44]">{DAYS[i]}</div>
                      <div className="text-[11px] text-[#94A3B8]">{fmt(d)}</div>
                    </div>
                  ))}
                </div>
                {safeHours.map((h) => (
                  <div key={h} className="grid grid-cols-7 gap-2 mb-2">
                    <div className="text-xs text-[#475569] font-medium grid place-items-center">{h}</div>
                    {safeWeek.map((d) => {
                      const st = stateOf(d, h);
                      return (
                        <button
                          key={`${d}-${h}`}
                          data-testid={`slot-${d}-${h}`}
                          disabled={st !== "slobodno"}
                          onClick={() => setSelected({ date: d, time: h })}
                          className={`h-11 rounded-xl border text-[11px] font-semibold transition-all duration-300 ${stateStyle[st] || stateStyle.zatvoreno}`}
                        >
                          {st === "slobodno" ? "slobodno" : st === "na cekanju" ? "čeka" : st === "zauzeto" ? "zauzeto" : "—"}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-[#475569]">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#A7F3D0] border border-[#047857]" /> slobodno
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#FDE68A] border border-[#B45309]" /> zahtev na čekanju
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#FECACA] border border-[#B91C1C]" /> zauzeto
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#E2E8F0] border border-[#94A3B8]" /> nije dostupno
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-[#0A1F44]/70 backdrop-blur-sm p-4"
          data-testid="booking-modal"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <form
            onSubmit={submit}
            className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-head text-xl font-semibold text-[#0A1F44]">Rezervacija termina</h3>
                <p className="text-sm text-[#475569] mt-1" data-testid="booking-slot-label">
                  {selected.date} u {selected.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                data-testid="booking-close"
                className="grid place-items-center w-9 h-9 rounded-full hover:bg-[#F1F5F9] text-[#475569]"
                aria-label="Zatvori"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input data-testid="booking-name" className={input} placeholder="Ime i prezime *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input data-testid="booking-grade" className={input} placeholder="Razred i škola *" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
              <input data-testid="booking-phone" className={input} placeholder="Telefon *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input data-testid="booking-email" className={input} placeholder="Email (za potvrdu)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea data-testid="booking-note" className={`${input} min-h-[90px]`} placeholder="Napomena (tema, šta ti nije jasno...)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="booking-submit"
              className="mt-6 w-full rounded-full bg-[#D4AF37] hover:bg-[#C59B27] disabled:opacity-60 text-[#0A1F44] font-semibold py-3.5 text-sm transition-colors duration-300"
            >
              {loading ? "Šaljem..." : "Pošalji zahtev za termin"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};
