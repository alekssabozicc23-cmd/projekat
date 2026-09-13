import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Header } from "../components/site/Header";
import { HeroSlider } from "../components/site/HeroSlider";
import { About } from "../components/site/About";
import { Packages } from "../components/site/Packages";
import { Consultation } from "../components/site/Consultation";
import { Highschool } from "../components/site/Highschool";
import { Materials } from "../components/site/Materials";
import { Videos } from "../components/site/Videos";
import { Gallery } from "../components/site/Gallery";
import { FreeMaterial } from "../components/site/FreeMaterial";
import { Testimonials } from "../components/site/Testimonials";
import { Faq } from "../components/site/Faq";
import { Contact } from "../components/site/Contact";

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [packages, setPackages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faq, setFaq] = useState([]);
  const [videos, setVideos] = useState([]);
  const [prefill, setPrefill] = useState("");
  const [loading, setLoading] = useState(true);
  const consultRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [s, p, d, t, f, v] = await Promise.all([
        api.get("/settings").catch(() => ({ data: {} })),
        api.get("/packages").catch(() => ({ data: [] })),
        api.get("/documents").catch(() => ({ data: [] })),
        api.get("/testimonials").catch(() => ({ data: [] })),
        api.get("/faq").catch(() => ({ data: [] })),
        api.get("/videos").catch(() => ({ data: [] })),
      ]);

      setSettings(s.data || {});
      setPackages(Array.isArray(p.data) ? p.data : []);
      setDocuments(Array.isArray(d.data) ? d.data : []);
      setTestimonials(Array.isArray(t.data) ? t.data : []);
      setFaq(Array.isArray(f.data) ? f.data : []);
      setVideos(Array.isArray(v.data) ? v.data : []);
    } catch (err) {
      console.error("Greška pri učitavanju:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onOrder = (item) => {
    if (!item) return;
    setPrefill(item.group ? `${item.group} — ${item.name || item.title}` : item.title || "");
    document.getElementById("konsultacije")?.scrollIntoView({ behavior: "smooth" });
  };

  // Sigurne provere niza da ne bi bilo crash-a
  const safeDocs = Array.isArray(documents) ? documents : [];
  const freeDocs = safeDocs.filter((d) => d && d.category === "free" && d.is_active);
  const safeSettings = settings || {};

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A1F44]">
        <div className="text-white/60 text-sm font-head tracking-widest">ANDRI-TIM</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Header settings={safeSettings} />
      <HeroSlider settings={safeSettings} />
      <Testimonials testimonials={testimonials} gallery={safeSettings.gallery || []} />
      <About settings={safeSettings} />
      <Packages packages={packages} settings={safeSettings} onOrder={onOrder} />
      <div ref={consultRef}>
        <Consultation packages={packages} prefill={prefill} onPrefillUsed={() => setPrefill("")} />
      </div>
      <Highschool />
      <Materials documents={safeDocs} onOrder={onOrder} />
      <Videos videos={videos} onOrder={onOrder} />
      <Gallery settings={safeSettings} />
      <FreeMaterial freeDocs={freeDocs} />
      <Faq faq={faq} />
      <Contact settings={safeSettings} />
    </div>
  );
}
