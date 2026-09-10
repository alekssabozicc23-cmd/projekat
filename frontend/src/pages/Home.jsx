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
  const consultRef = useRef(null);

  const load = useCallback(async () => {
    const [s, p, d, t, f, v] = await Promise.all([
      api.get("/settings"),
      api.get("/packages"),
      api.get("/documents"),
      api.get("/testimonials"),
      api.get("/faq"),
      api.get("/videos"),
    ]);
    setSettings(s.data);
    setPackages(p.data);
    setDocuments(d.data);
    setTestimonials(t.data);
    setFaq(f.data);
    setVideos(v.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onOrder = (item) => {
    setPrefill(item.group ? `${item.group} — ${item.name || item.title}` : item.title);
    document.getElementById("konsultacije")?.scrollIntoView({ behavior: "smooth" });
  };

  const freeDocs = documents.filter((d) => d.category === "free" && d.is_active);

  if (!settings) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A1F44]">
        <div className="text-white/60 text-sm font-head tracking-widest">ANDRI-TIM</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Header settings={settings} />
      <HeroSlider settings={settings} />
      <Testimonials testimonials={testimonials} gallery={settings.gallery} />
      <About settings={settings} />
      <Packages packages={packages} settings={settings} onOrder={onOrder} />
      <div ref={consultRef}>
        <Consultation packages={packages} prefill={prefill} onPrefillUsed={() => setPrefill("")} />
      </div>
      <Highschool />
      <Materials documents={documents} onOrder={onOrder} />
      <Videos videos={videos} onOrder={onOrder} />
      <Gallery settings={settings} />
      <FreeMaterial freeDocs={freeDocs} />
      <Faq faq={faq} />
      <Contact settings={settings} />
    </div>
  );
}
