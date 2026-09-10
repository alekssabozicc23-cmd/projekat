import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Lock, LogOut, Image as ImageIcon, FileText, Video, Package, CalendarDays,
  MessageSquareQuote, HelpCircle, Phone, Users, Trash2, Plus, Crown, Save, Upload, ExternalLink, Gift, Pencil,
} from "lucide-react";
import { api, adminApi, fileUrl, setToken, getToken, clearToken } from "../lib/api";

const inputCls =
  "w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300";
const btnPrimary = `${btn} bg-[#0A1F44] hover:bg-[#1B3A6B] text-white`;
const btnGold = `${btn} bg-[#D4AF37] hover:bg-[#C59B27] text-[#0A1F44]`;
const btnGhost = `${btn} border border-[#E2E8F0] text-[#1B3A6B] hover:border-[#4A90D9]`;
const card = "rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-sm";

const TABS = [
  { id: "slike", label: "Slike", icon: ImageIcon },
  { id: "dokumenti", label: "Dokumenti", icon: FileText },
  { id: "video", label: "Video", icon: Video },
  { id: "paketi", label: "Paketi i cene", icon: Package },
  { id: "termini", label: "Zakazivanje", icon: CalendarDays },
  { id: "utisci", label: "Utisci", icon: MessageSquareQuote },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "kontakt", label: "Kontakt podaci", icon: Phone },
  { id: "baza", label: "Baza korisnika", icon: Users },
];

/* ---------------------------------------------------------------- upload */
const UploadButton = ({ kind = "asset", label = "Učitaj sliku", onDone, testid, accept = "image/*" }) => {
  const [busy, setBusy] = useState(false);
  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const { data } = await adminApi.post("/admin/upload", fd);
      onDone(data.url);
      toast.success("Fajl je učitan.");
    } catch {
      toast.error("Učitavanje nije uspelo.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <label className={`${btnGhost} cursor-pointer`} data-testid={testid}>
      <Upload className="w-4 h-4" />
      {busy ? "Učitavam..." : label}
      <input type="file" accept={accept} className="hidden" onChange={handle} />
    </label>
  );
};

/* ---------------------------------------------------------------- slike */
const SlikeTab = ({ settings, saveSettings }) => {
  const [draft, setDraft] = useState(settings);
  useEffect(() => setDraft(settings), [settings]);
  if (!draft) return null;

  const setSlide = (i, key, value) => {
    const slides = draft.hero_slides.map((s, k) => (k === i ? { ...s, [key]: value } : s));
    setDraft({ ...draft, hero_slides: slides });
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Hero slajder (naslovne slike)</h3>
        <p className="text-sm text-[#475569] mt-1">Zameni sliku i tekst za svaki od tri slajda.</p>
        <div className="mt-5 space-y-6">
          {draft.hero_slides.map((s, i) => (
            <div key={i} className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4" data-testid={`admin-slide-${i}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <img src={s.image} alt="" className="w-full sm:w-40 h-28 object-cover rounded-lg border border-[#E2E8F0]" />
                <div className="flex-1 space-y-3">
                  <input className={inputCls} value={s.badge || ""} onChange={(e) => setSlide(i, "badge", e.target.value)} placeholder="Mala oznaka" data-testid={`slide-badge-${i}`} />
                  <input className={inputCls} value={s.title || ""} onChange={(e) => setSlide(i, "title", e.target.value)} placeholder="Naslov" data-testid={`slide-title-${i}`} />
                  <textarea className={inputCls} value={s.subtitle || ""} onChange={(e) => setSlide(i, "subtitle", e.target.value)} placeholder="Podnaslov" data-testid={`slide-subtitle-${i}`} />
                  <div className="flex flex-wrap gap-3">
                    <input className={`${inputCls} flex-1 min-w-[200px]`} value={s.image} onChange={(e) => setSlide(i, "image", e.target.value)} placeholder="Link ka slici" />
                    <UploadButton kind="images" label="Zameni sliku" testid={`slide-upload-${i}`} onDone={(url) => setSlide(i, "image", fileUrl(url))} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Fotografija u sekciji „O meni”</h3>
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
          <img src={draft.about_image} alt="" className="w-32 h-40 object-cover rounded-lg border border-[#E2E8F0]" />
          <div className="flex-1 space-y-3">
            <input className={inputCls} value={draft.about_image} onChange={(e) => setDraft({ ...draft, about_image: e.target.value })} data-testid="about-image-input" />
            <UploadButton kind="images" label="Zameni fotografiju" testid="about-image-upload" onDone={(url) => setDraft({ ...draft, about_image: fileUrl(url) })} />
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Galerija na početnoj strani</h3>
        <p className="text-sm text-[#475569] mt-1">Ove slike se prikazuju u sekciji „Galerija” i u utiscima.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">Naslov galerije</label>
            <input className={inputCls} value={draft.gallery_title || ""} onChange={(e) => setDraft({ ...draft, gallery_title: e.target.value })} data-testid="gallery-title-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">Kratak opis</label>
            <input className={inputCls} value={draft.gallery_note || ""} onChange={(e) => setDraft({ ...draft, gallery_note: e.target.value })} data-testid="gallery-note-input" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {(draft.gallery || []).map((g, i) => (
            <div key={i} className="flex flex-wrap gap-3 items-center">
              <img src={g} alt="" className="w-16 h-16 object-cover rounded-lg border border-[#E2E8F0]" />
              <input
                className={`${inputCls} flex-1 min-w-[200px]`}
                value={g}
                onChange={(e) => {
                  const gal = [...draft.gallery];
                  gal[i] = e.target.value;
                  setDraft({ ...draft, gallery: gal });
                }}
              />
              <UploadButton
                kind="images"
                label="Zameni"
                testid={`gallery-upload-${i}`}
                onDone={(url) => {
                  const gal = [...draft.gallery];
                  gal[i] = fileUrl(url);
                  setDraft({ ...draft, gallery: gal });
                }}
              />
              <button
                className={btnGhost}
                data-testid={`gallery-remove-${i}`}
                onClick={() => setDraft({ ...draft, gallery: draft.gallery.filter((_, k) => k !== i) })}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <UploadButton kind="images" label="Dodaj novu sliku u galeriju" testid="gallery-add" onDone={(url) => setDraft({ ...draft, gallery: [...(draft.gallery || []), fileUrl(url)] })} />
        </div>
      </div>

      <button className={btnGold} onClick={() => saveSettings(draft)} data-testid="save-images">
        <Save className="w-4 h-4" /> Sačuvaj slike i tekstove
      </button>
    </div>
  );
};

/* ---------------------------------------------------------------- dokumenti */
const DokumentiTab = () => {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ title: "", category: "skripta", group: "", price: "" });
  const [files, setFiles] = useState({ file: null, preview: null });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await adminApi.get("/admin/documents");
    setDocs(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.title || !files.file) {
      toast.error("Unesi naziv i izaberi PDF.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", files.file);
      if (files.preview) fd.append("preview", files.preview);
      await adminApi.post("/admin/documents", fd);
      toast.success("Dokument je dodat.");
      setForm({ title: "", category: "skripta", group: "", price: "" });
      setFiles({ file: null, preview: null });
      load();
    } catch {
      toast.error("Dodavanje nije uspelo.");
    } finally {
      setBusy(false);
    }
  };

  const replace = async (id, target, file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("target", target);
    await adminApi.post(`/admin/documents/${id}/replace`, fd);
    toast.success("Dokument je zamenjen.");
    load();
  };

  const update = async (id, patch) => {
    try {
      await adminApi.put(`/admin/documents/${id}`, patch);
      toast.success("Izmene su sačuvane.");
      load();
    } catch {
      toast.error("Čuvanje nije uspelo.");
    }
  };

  const remove = async (id) => {
    await adminApi.delete(`/admin/documents/${id}`);
    toast.success("Dokument je obrisan.");
    load();
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Dodaj novi dokument</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className={inputCls} placeholder="Naziv dokumenta *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="doc-title" />
          <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="doc-category">
            <option value="skripta">Skripta (prikaz na sajtu sa preview-om)</option>
            <option value="free">Besplatan materijal za preuzimanje</option>
            <option value="praktikum">Praktikum / rešenja (interno)</option>
          </select>
          <input className={inputCls} placeholder="Predmet / grupa" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} data-testid="doc-group" />
          <input className={inputCls} placeholder="Cena (npr. 2.000 din)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="doc-price" />
          <label className={`${btnGhost} cursor-pointer`} data-testid="doc-file">
            <Upload className="w-4 h-4" /> {files.file ? files.file.name : "Izaberi PDF (pun dokument) *"}
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFiles({ ...files, file: e.target.files?.[0] || null })} />
          </label>
          <label className={`${btnGhost} cursor-pointer`} data-testid="doc-preview-file">
            <Upload className="w-4 h-4" /> {files.preview ? files.preview.name : "Preview PDF (prvih 5 strana)"}
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFiles({ ...files, preview: e.target.files?.[0] || null })} />
          </label>
        </div>
        <button className={`${btnGold} mt-5`} onClick={create} disabled={busy} data-testid="doc-create">
          <Plus className="w-4 h-4" /> {busy ? "Dodajem..." : "Dodaj dokument"}
        </button>
      </div>

      <div className="space-y-4">
        {docs.map((d) => (
          <DocRow key={d.id} doc={d} onUpdate={update} onReplace={replace} onRemove={remove} />
        ))}
      </div>
    </div>
  );
};

const DocRow = ({ doc, onUpdate, onReplace, onRemove }) => {
  const [edit, setEdit] = useState(false);
  const [local, setLocal] = useState(doc);
  useEffect(() => setLocal(doc), [doc]);

  return (
    <div className={card} data-testid={`admin-doc-${doc.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-head font-semibold text-[#0A1F44]">{doc.title}</div>
          <div className="text-xs text-[#94A3B8] mt-1">
            {doc.category} · {doc.group || "—"} · {doc.price || "bez cene"} · {doc.is_active ? "aktivan" : "sakriven"}
            {doc.preview_path ? " · ima preview" : " · bez preview-a"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={edit ? btnPrimary : btnGhost} onClick={() => setEdit((v) => !v)} data-testid={`doc-edit-${doc.id}`}>
            <Pencil className="w-4 h-4" /> {edit ? "Zatvori" : "Izmeni"}
          </button>
          <a className={btnGhost} href={fileUrl(`/api/files/${doc.storage_path}`)} target="_blank" rel="noopener noreferrer" data-testid={`doc-open-${doc.id}`}>
            <ExternalLink className="w-4 h-4" /> Otvori
          </a>
          <button className={btnGhost} onClick={() => onUpdate(doc.id, { is_active: !doc.is_active })} data-testid={`doc-toggle-${doc.id}`}>
            {doc.is_active ? "Sakrij" : "Prikaži"}
          </button>
          <button className={`${btnGhost} !text-[#B91C1C]`} onClick={() => onRemove(doc.id)} data-testid={`doc-delete-${doc.id}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {edit && (
        <div className="mt-5 pt-5 border-t border-[#E2E8F0]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">Naziv</label>
              <input className={inputCls} value={local.title || ""} onChange={(e) => setLocal({ ...local, title: e.target.value })} data-testid={`doc-edit-title-${doc.id}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">Gde se prikazuje</label>
              <select className={inputCls} value={local.category || "skripta"} onChange={(e) => setLocal({ ...local, category: e.target.value })} data-testid={`doc-edit-category-${doc.id}`}>
                <option value="skripta">Skripta (sekcija Materijali, sa preview-om)</option>
                <option value="free">Besplatan materijal za preuzimanje</option>
                <option value="praktikum">Praktikum / rešenja (interno)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">Predmet / grupa</label>
              <input className={inputCls} value={local.group || ""} onChange={(e) => setLocal({ ...local, group: e.target.value })} data-testid={`doc-edit-group-${doc.id}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">Cena</label>
              <input className={inputCls} value={local.price || ""} onChange={(e) => setLocal({ ...local, price: e.target.value })} data-testid={`doc-edit-price-${doc.id}`} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className={btnGold}
              onClick={() => onUpdate(doc.id, { title: local.title, category: local.category, group: local.group, price: local.price })}
              data-testid={`doc-save-${doc.id}`}
            >
              <Save className="w-4 h-4" /> Sačuvaj izmene
            </button>
            <label className={`${btnGhost} cursor-pointer`} data-testid={`doc-replace-${doc.id}`}>
              <Upload className="w-4 h-4" /> Zameni pun PDF
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onReplace(doc.id, "full", e.target.files[0])} />
            </label>
            <label className={`${btnGhost} cursor-pointer`} data-testid={`doc-replace-preview-${doc.id}`}>
              <Upload className="w-4 h-4" /> Zameni preview (5 strana)
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onReplace(doc.id, "preview", e.target.files[0])} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- generic list CRUD */
const ListTab = ({ endpoint, publicPath, fields, emptyItem, titleKey, label }) => {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(emptyItem);

  const load = useCallback(async () => {
    const { data } = await api.get(publicPath);
    setItems(data);
  }, [publicPath]);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    try {
      await adminApi.post(`/admin/${endpoint}`, draft);
      setDraft(emptyItem);
      toast.success("Sačuvano.");
      load();
    } catch {
      toast.error("Greška pri čuvanju.");
    }
  };
  const save = async (item) => {
    const payload = { ...item };
    delete payload.id;
    delete payload.created_at;
    await adminApi.put(`/admin/${endpoint}/${item.id}`, payload);
    toast.success("Izmene su sačuvane.");
    load();
  };
  const remove = async (id) => {
    await adminApi.delete(`/admin/${endpoint}/${id}`);
    toast.success("Obrisano.");
    load();
  };

  const renderField = (f, value, onChange, testidPrefix) => {
    if (f.type === "textarea")
      return <textarea className={`${inputCls} min-h-[90px]`} placeholder={f.label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={`${testidPrefix}-${f.key}`} />;
    if (f.type === "list")
      return (
        <textarea
          className={`${inputCls} min-h-[110px]`}
          placeholder={`${f.label} (jedna stavka po redu)`}
          value={(value || []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n").filter((x) => x.trim()))}
          data-testid={`${testidPrefix}-${f.key}`}
        />
      );
    if (f.type === "number")
      return <input type="number" className={inputCls} placeholder={f.label} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} data-testid={`${testidPrefix}-${f.key}`} />;
    return <input className={inputCls} placeholder={f.label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={`${testidPrefix}-${f.key}`} />;
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Dodaj {label}</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" || f.type === "list" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">{f.label}</label>
              {renderField(f, draft[f.key], (v) => setDraft({ ...draft, [f.key]: v }), `new-${endpoint}`)}
            </div>
          ))}
        </div>
        <button className={`${btnGold} mt-5`} onClick={create} data-testid={`create-${endpoint}`}>
          <Plus className="w-4 h-4" /> Dodaj
        </button>
      </div>

      {items.map((item) => (
        <ItemEditor
          key={item.id}
          item={item}
          fields={fields}
          endpoint={endpoint}
          titleKey={titleKey}
          renderField={renderField}
          onSave={save}
          onRemove={remove}
        />
      ))}
    </div>
  );
};

const ItemEditor = ({ item, fields, endpoint, titleKey, renderField, onSave, onRemove }) => {
  const [local, setLocal] = useState(item);
  useEffect(() => setLocal(item), [item]);
  const [open, setOpen] = useState(false);

  return (
    <div className={card} data-testid={`admin-${endpoint}-${item.id}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <button className="text-left" onClick={() => setOpen((v) => !v)} data-testid={`toggle-${endpoint}-${item.id}`}>
          <div className="font-head font-semibold text-[#0A1F44]">{local[titleKey]}</div>
          <div className="text-xs text-[#94A3B8] mt-1">{open ? "Sakrij izmene" : "Klikni za izmenu"}</div>
        </button>
        <div className="flex gap-2">
          {endpoint === "packages" && (
            <button
              className={local.featured ? btnGold : btnGhost}
              data-testid={`feature-${item.id}`}
              onClick={async () => {
                await adminApi.post(`/admin/packages/${item.id}/feature`);
                toast.success("Paket meseca je ažuriran.");
                window.location.reload();
              }}
            >
              <Crown className="w-4 h-4" /> {local.featured ? "Paket meseca" : "Označi kao paket meseca"}
            </button>
          )}
          <button className={`${btnGhost} !text-[#B91C1C]`} onClick={() => onRemove(item.id)} data-testid={`delete-${endpoint}-${item.id}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" || f.type === "list" ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">{f.label}</label>
                {renderField(f, local[f.key], (v) => setLocal({ ...local, [f.key]: v }), `edit-${item.id}`)}
              </div>
            ))}
          </div>
          <button className={`${btnPrimary} mt-5`} onClick={() => onSave(local)} data-testid={`save-${endpoint}-${item.id}`}>
            <Save className="w-4 h-4" /> Sačuvaj izmene
          </button>
        </>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- termini */
const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub"];
const mondayOf = (d) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(12, 0, 0, 0);
  return x;
};

const TerminiTab = () => {
  const [week, setWeek] = useState(mondayOf(new Date()));
  const [slots, setSlots] = useState({ week: [], hours: [], slots: [] });
  const [bookings, setBookings] = useState([]);
  const [consults, setConsults] = useState([]);

  const load = useCallback(async () => {
    const iso = week.toISOString().slice(0, 10);
    const [s, b, c] = await Promise.all([
      api.get("/slots", { params: { week_start: iso } }),
      adminApi.get("/admin/bookings"),
      adminApi.get("/admin/consultations"),
    ]);
    setSlots(s.data);
    setBookings(b.data);
    setConsults(c.data);
  }, [week]);
  useEffect(() => {
    load();
  }, [load]);

  const toggleSlot = async (d, h, state) => {
    if (state === "zatvoreno") await adminApi.post("/admin/slots/unblock", { slot_date: d, slot_time: h });
    else if (state === "slobodno") await adminApi.post("/admin/slots/block", { slot_date: d, slot_time: h });
    else return toast.error("Termin je rezervisan — reši rezervaciju u listi ispod.");
    load();
  };

  const setBooking = async (id, status) => {
    await adminApi.put(`/admin/bookings/${id}`, { status });
    toast.success("Status je ažuriran.");
    load();
  };

  const setConsult = async (id, status) => {
    await adminApi.put(`/admin/consultations/${id}`, { status });
    toast.success("Status je ažuriran.");
    load();
  };

  const shift = (n) => {
    const x = new Date(week);
    x.setDate(x.getDate() + n * 7);
    setWeek(x);
  };

  const colorOf = {
    slobodno: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    "na cekanju": "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    zauzeto: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
    zatvoreno: "bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0]",
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Kalendar termina (srednjoškolci)</h3>
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => shift(-1)} data-testid="admin-week-prev">‹</button>
            <button className={btnGhost} onClick={() => shift(1)} data-testid="admin-week-next">›</button>
          </div>
        </div>
        <p className="text-sm text-[#475569] mt-1">Klik na slobodan termin ga zatvara, klik na zatvoren ga ponovo otvara.</p>
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-7 gap-2 mb-2">
              <div />
              {slots.week.map((d, i) => (
                <div key={d} className="text-center text-xs font-semibold text-[#0A1F44]">
                  {DAYS[i]}
                  <div className="text-[11px] text-[#94A3B8] font-normal">{d.slice(8)}.{d.slice(5, 7)}.</div>
                </div>
              ))}
            </div>
            {slots.hours.map((h) => (
              <div key={h} className="grid grid-cols-7 gap-2 mb-2">
                <div className="text-xs text-[#475569] grid place-items-center">{h}</div>
                {slots.week.map((d) => {
                  const st = slots.slots.find((s) => s.slot_date === d && s.slot_time === h)?.state || "slobodno";
                  return (
                    <button
                      key={`${d}-${h}`}
                      onClick={() => toggleSlot(d, h, st)}
                      data-testid={`admin-slot-${d}-${h}`}
                      className={`h-10 rounded-lg border text-[10px] font-semibold ${colorOf[st]}`}
                    >
                      {st === "slobodno" ? "slobodno" : st === "zatvoreno" ? "zatvoreno" : st === "zauzeto" ? "zauzeto" : "čeka"}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Zahtevi za časove ({bookings.length})</h3>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 && <p className="text-sm text-[#94A3B8]">Još nema zahteva.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-4" data-testid={`admin-booking-${b.id}`}>
              <div className="text-sm">
                <div className="font-semibold text-[#0A1F44]">
                  {b.name} · {b.slot_date} u {b.slot_time}
                </div>
                <div className="text-xs text-[#475569] mt-1">
                  {b.grade} · {b.phone} · {b.email || "bez mejla"} · status: <b>{b.status}</b>
                </div>
                {b.note && <div className="text-xs text-[#94A3B8] mt-1">„{b.note}”</div>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className={btnGold} onClick={() => setBooking(b.id, "potvrdjeno")} data-testid={`confirm-booking-${b.id}`}>Potvrdi</button>
                <button className={btnGhost} onClick={() => setBooking(b.id, "otkazano")} data-testid={`cancel-booking-${b.id}`}>Otkaži</button>
                <button
                  className={`${btnGhost} !text-[#B91C1C]`}
                  onClick={async () => {
                    await adminApi.delete(`/admin/bookings/${b.id}`);
                    load();
                  }}
                  data-testid={`delete-booking-${b.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Zahtevi za konsultacije ({consults.length})</h3>
        <div className="mt-4 space-y-3">
          {consults.length === 0 && <p className="text-sm text-[#94A3B8]">Još nema zahteva.</p>}
          {consults.map((c) => (
            <div key={c.id} className="rounded-xl border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-4" data-testid={`admin-consult-${c.id}`}>
              <div className="text-sm">
                <div className="font-semibold text-[#0A1F44]">{c.name} · {c.subject}</div>
                <div className="text-xs text-[#475569] mt-1">
                  {c.contact} · {c.email || "bez mejla"} · status: <b>{c.status}</b>
                </div>
                {c.message && <div className="text-xs text-[#94A3B8] mt-1">„{c.message}”</div>}
              </div>
              <div className="flex flex-wrap gap-2">
                <select className={inputCls} value={c.status} onChange={(e) => setConsult(c.id, e.target.value)} data-testid={`consult-status-${c.id}`}>
                  <option value="na cekanju">na čekanju</option>
                  <option value="kontaktiran">kontaktiran</option>
                  <option value="zavrseno">završeno</option>
                </select>
                <button
                  className={`${btnGhost} !text-[#B91C1C]`}
                  onClick={async () => {
                    await adminApi.delete(`/admin/consultations/${c.id}`);
                    load();
                  }}
                  data-testid={`delete-consult-${c.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- video */
const VideoTab = () => {
  const [videos, setVideos] = useState([]);
  const [urls, setUrls] = useState({});
  const [bulk, setBulk] = useState({ package: "", lines: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get("/videos");
    setVideos(data);
    setUrls(Object.fromEntries(data.map((v) => [v.id, v.url || ""])));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const saveUrls = async () => {
    setBusy(true);
    try {
      const items = videos
        .filter((v) => (urls[v.id] || "") !== (v.url || ""))
        .map((v) => ({ id: v.id, url: urls[v.id] || "" }));
      if (!items.length) {
        toast.info("Nema izmena za čuvanje.");
        return;
      }
      await adminApi.post("/admin/videos/bulk-urls", { items });
      toast.success(`Sačuvano linkova: ${items.length}`);
      load();
    } catch {
      toast.error("Čuvanje nije uspelo.");
    } finally {
      setBusy(false);
    }
  };

  const bulkCreate = async () => {
    if (!bulk.lines.trim()) {
      toast.error("Unesi barem jedan red.");
      return;
    }
    await adminApi.post("/admin/videos/bulk-create", bulk);
    toast.success("Lekcije su dodate.");
    setBulk({ package: "", lines: "" });
    load();
  };

  const remove = async (id) => {
    await adminApi.delete(`/admin/videos/${id}`);
    toast.success("Lekcija je obrisana.");
    load();
  };

  const groups = [...new Set(videos.map((v) => v.package || "Bez predmeta"))];
  const filled = videos.filter((v) => (urls[v.id] || "").trim()).length;

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Brzi unos linkova</h3>
        <p className="text-sm text-[#475569] mt-1">
          Nalepi link (YouTube, Google Drive, Vimeo) pored naziva lekcije i klikni „Sačuvaj sve linkove”.
          Lekcije bez linka na sajtu pišu „Dostupno uz paket”.
        </p>
        <div className="mt-3 text-sm font-semibold text-[#1B3A6B]" data-testid="video-progress">
          Popunjeno: {filled} / {videos.length} lekcija · besplatnih: {videos.filter((v) => v.is_free).length}
        </div>
        <p className="mt-2 text-xs text-[#94A3B8]">
          Tri lekcije označene kao „Besplatna” prikazuju se na vrhu video sekcije i gledaju se direktno na sajtu.
        </p>
        <button className={`${btnGold} mt-4`} onClick={saveUrls} disabled={busy} data-testid="save-video-urls">
          <Save className="w-4 h-4" /> {busy ? "Čuvam..." : "Sačuvaj sve linkove"}
        </button>
      </div>

      {groups.map((g) => (
        <div key={g} className={card} data-testid={`video-group-${g}`}>
          <h4 className="font-head font-semibold text-[#0A1F44] flex items-center gap-2">
            <Video className="w-4 h-4 text-[#4A90D9]" /> {g}
          </h4>
          <div className="mt-4 space-y-3">
            {videos
              .filter((v) => (v.package || "Bez predmeta") === g)
              .map((v) => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center gap-3" data-testid={`video-row-${v.id}`}>
                  <div className="sm:w-1/3 text-sm text-[#0A1F44] font-medium">{v.title}</div>
                  <input
                    className={`${inputCls} flex-1`}
                    placeholder="Nalepi link lekcije (https://...)"
                    value={urls[v.id] ?? ""}
                    onChange={(e) => setUrls({ ...urls, [v.id]: e.target.value })}
                    data-testid={`video-url-${v.id}`}
                  />
                  <div className="flex gap-2">
                    <button
                      className={v.is_free ? btnGold : btnGhost}
                      onClick={async () => {
                        await adminApi.post(`/admin/videos/${v.id}/free`);
                        toast.success(v.is_free ? "Lekcija više nije besplatna." : "Lekcija je označena kao besplatna.");
                        load();
                      }}
                      data-testid={`video-free-${v.id}`}
                    >
                      <Gift className="w-4 h-4" /> {v.is_free ? "Besplatna" : "Označi besplatnu"}
                    </button>
                    {urls[v.id] && (
                      <a className={btnGhost} href={urls[v.id]} target="_blank" rel="noopener noreferrer" data-testid={`video-test-${v.id}`}>
                        <ExternalLink className="w-4 h-4" /> Proveri
                      </a>
                    )}
                    <button className={`${btnGhost} !text-[#B91C1C]`} onClick={() => remove(v.id)} data-testid={`video-delete-${v.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Dodaj više lekcija odjednom</h3>
        <p className="text-sm text-[#475569] mt-1">
          Jedna lekcija po redu. Ako imaš link, napiši ga posle znaka <b>|</b> — primer:
          <br />
          <code className="text-xs">Amortizacija osnovnih sredstava | https://youtu.be/xxxxxxxxxxx</code>
        </p>
        <div className="mt-4 space-y-3">
          <input
            className={inputCls}
            placeholder="Predmet / paket (npr. Finansijsko računovodstvo)"
            value={bulk.package}
            onChange={(e) => setBulk({ ...bulk, package: e.target.value })}
            data-testid="video-bulk-package"
          />
          <textarea
            className={`${inputCls} min-h-[140px]`}
            placeholder={"Naziv lekcije | link\nNaziv lekcije | link"}
            value={bulk.lines}
            onChange={(e) => setBulk({ ...bulk, lines: e.target.value })}
            data-testid="video-bulk-lines"
          />
        </div>
        <button className={`${btnPrimary} mt-4`} onClick={bulkCreate} data-testid="video-bulk-create">
          <Plus className="w-4 h-4" /> Dodaj lekcije
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- kontakt */
const KontaktTab = ({ settings, saveSettings }) => {
  const [draft, setDraft] = useState(settings);
  useEffect(() => setDraft(settings), [settings]);
  if (!draft) return null;
  const f = [
    ["phone", "Broj telefona"],
    ["viber", "Viber link (viber://chat?number=...)"],
    ["whatsapp", "WhatsApp link (https://wa.me/...)"],
    ["instagram", "Instagram link"],
    ["instagram_handle", "Instagram korisničko ime (npr. @casovi.racunovodstva.andriana)"],
    ["email", "Email adresa (prikazana na sajtu)"],
    ["notify_email", "Email za obaveštenja o zahtevima"],
    ["address", "Grad / adresa"],
  ];
  return (
    <div className={card}>
      <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Kontakt podaci</h3>
      <p className="text-sm text-[#475569] mt-1">Izmene se odmah primenjuju na celom sajtu.</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {f.map(([k, label]) => (
          <div key={k}>
            <label className="block text-xs font-semibold text-[#0A1F44] mb-1.5">{label}</label>
            <input className={inputCls} value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} data-testid={`settings-${k}`} />
          </div>
        ))}
      </div>
      <button className={`${btnGold} mt-5`} onClick={() => saveSettings(draft)} data-testid="save-contact">
        <Save className="w-4 h-4" /> Sačuvaj
      </button>
    </div>
  );
};

/* ---------------------------------------------------------------- baza */
const BazaTab = () => {
  const [leads, setLeads] = useState([]);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    adminApi.get("/admin/leads").then((r) => setLeads(r.data));
    adminApi.get("/admin/messages").then((r) => setMessages(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Preuzimanja besplatnog materijala ({leads.length})</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm" data-testid="leads-table">
            <thead>
              <tr className="text-left text-xs text-[#94A3B8] border-b border-[#E2E8F0]">
                <th className="py-2 pr-4">Ime</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Telefon</th>
                <th className="py-2 pr-4">Škola / fakultet</th>
                <th className="py-2">Datum</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-[#F1F5F9]" data-testid={`lead-row-${l.id}`}>
                  <td className="py-2.5 pr-4 font-medium text-[#0A1F44]">{l.name}</td>
                  <td className="py-2.5 pr-4">{l.email}</td>
                  <td className="py-2.5 pr-4">{l.phone || "—"}</td>
                  <td className="py-2.5 pr-4">{l.school || "—"}</td>
                  <td className="py-2.5 text-xs text-[#94A3B8]">{(l.created_at || "").slice(0, 10)}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-sm text-[#94A3B8]">Još nema preuzimanja.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-head text-lg font-semibold text-[#0A1F44]">Poruke sa kontakt forme ({messages.length})</h3>
        <div className="mt-4 space-y-3">
          {messages.length === 0 && <p className="text-sm text-[#94A3B8]">Još nema poruka.</p>}
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-[#E2E8F0] p-4" data-testid={`message-${m.id}`}>
              <div className="text-sm font-semibold text-[#0A1F44]">{m.name}</div>
              <div className="text-xs text-[#94A3B8]">{m.email || "—"} · {m.contact || "—"}</div>
              <p className="text-sm text-[#475569] mt-2">{m.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- page */
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("slike");
  const [settings, setSettings] = useState(null);

  const loadSettings = useCallback(async () => {
    const { data } = await api.get("/settings");
    setSettings(data);
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    adminApi
      .get("/admin/verify")
      .then(() => {
        setAuthed(true);
        loadSettings();
      })
      .catch(() => clearToken());
  }, [loadSettings]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin/login", { password });
      setToken(data.token);
      setAuthed(true);
      loadSettings();
      toast.success("Dobrodošla, Andriana!");
    } catch {
      toast.error("Pogrešna lozinka.");
    }
  };

  const saveSettings = async (draft) => {
    try {
      const { data } = await adminApi.put("/admin/settings", draft);
      setSettings(data);
      toast.success("Sačuvano!");
    } catch {
      toast.error("Čuvanje nije uspelo.");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A1F44] px-4 grain">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl" data-testid="admin-login-form">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#0A1F44] text-[#D4AF37] mx-auto">
            <Lock className="w-6 h-6" />
          </span>
          <h1 className="font-head text-2xl font-semibold text-[#0A1F44] text-center mt-5">Admin panel</h1>
          <p className="text-sm text-[#475569] text-center mt-2">Unesi lozinku za pristup.</p>
          <input
            type="password"
            className={`${inputCls} mt-6`}
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="admin-password-input"
          />
          <button type="submit" className={`${btnGold} w-full mt-4`} data-testid="admin-login-btn">
            Prijavi se
          </button>
          <Link to="/" className="block text-center text-xs text-[#94A3B8] mt-5 hover:text-[#1B3A6B]">
            ← Nazad na sajt
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#0A1F44] text-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#D4AF37] text-[#0A1F44] font-head font-extrabold">AT</span>
            <div>
              <div className="font-head font-semibold">Admin panel</div>
              <div className="text-xs text-white/50">Andri-Tim · upravljanje sajtom</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-white/70 hover:text-white" data-testid="admin-view-site">
              Vidi sajt
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs hover:bg-white/10"
              onClick={() => {
                clearToken();
                setAuthed(false);
              }}
              data-testid="admin-logout"
            >
              <LogOut className="w-3.5 h-3.5" /> Odjavi se
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8" data-testid="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2.5 text-sm font-medium border transition-all duration-300 ${
                tab === t.id ? "bg-[#0A1F44] text-white border-[#0A1F44]" : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#4A90D9]"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "slike" && <SlikeTab settings={settings} saveSettings={saveSettings} />}
        {tab === "dokumenti" && <DokumentiTab />}
        {tab === "video" && <VideoTab />}
        {tab === "paketi" && (
          <ListTab
            endpoint="packages"
            publicPath="/packages"
            titleKey="name"
            label="paket"
            emptyItem={{ category: "student", group: "", name: "", price: "", features: [], featured: false, note: "", order: 0 }}
            fields={[
              { key: "group", label: "Grupa (npr. Finansijsko računovodstvo)" },
              { key: "name", label: "Naziv paketa" },
              { key: "price", label: "Cena (npr. 5.000 din)" },
              { key: "order", label: "Redosled", type: "number" },
              { key: "note", label: "Kratka napomena", type: "textarea" },
              { key: "features", label: "Šta paket sadrži", type: "list" },
            ]}
          />
        )}
        {tab === "termini" && <TerminiTab />}        {tab === "utisci" && (
          <ListTab
            endpoint="testimonials"
            publicPath="/testimonials"
            titleKey="name"
            label="utisak"
            emptyItem={{ name: "", school: "", subject: "", rating: 5, text: "", order: 0 }}
            fields={[
              { key: "name", label: "Ime učenika" },
              { key: "school", label: "Fakultet / škola" },
              { key: "subject", label: "Predmet i ocena" },
              { key: "rating", label: "Broj zvezdica (1-5)", type: "number" },
              { key: "order", label: "Redosled", type: "number" },
              { key: "text", label: "Utisak", type: "textarea" },
            ]}
          />
        )}
        {tab === "faq" && (
          <ListTab
            endpoint="faq"
            publicPath="/faq"
            titleKey="question"
            label="pitanje"
            emptyItem={{ question: "", answer: "", order: 0 }}
            fields={[
              { key: "question", label: "Pitanje" },
              { key: "order", label: "Redosled", type: "number" },
              { key: "answer", label: "Odgovor", type: "textarea" },
            ]}
          />
        )}
        {tab === "kontakt" && <KontaktTab settings={settings} saveSettings={saveSettings} />}
        {tab === "baza" && <BazaTab />}
      </div>
    </div>
  );
}
