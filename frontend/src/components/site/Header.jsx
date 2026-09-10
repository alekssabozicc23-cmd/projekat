import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

const links = [
  { href: "#o-meni", label: "O meni", primary: true },
  { href: "#rezultati", label: "Rezultati" },
  { href: "#studenti", label: "Za studente", primary: true },
  { href: "#srednjoskolci", label: "Srednjoškolci", primary: true },
  { href: "#materijali", label: "Materijali", primary: true },
  { href: "#video", label: "Video lekcije" },
  { href: "#galerija", label: "Galerija", primary: true },
  { href: "#besplatno", label: "Besplatno" },
  { href: "#utisci", label: "Utisci" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontakt", label: "Kontakt", primary: true },
];

export const Header = ({ settings }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-[#0A1F44]/95 backdrop-blur-xl border-b border-white/10 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between h-[76px]">
        <a href="#top" data-testid="logo-link" className="flex items-center gap-3 group">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#D4AF37] text-[#0A1F44] font-head font-extrabold text-lg shadow-md transition-transform duration-300 group-hover:scale-105">
            AT
          </span>
          <span className="leading-tight">
            <span className="block font-head font-semibold text-white text-sm sm:text-base">ANDRI-TIM</span>
            <span className="block text-[10px] sm:text-xs tracking-[0.2em] text-white/60 uppercase">
              Andriana Grozdanović
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-${l.href.replace("#", "")}`}
              className={`text-sm whitespace-nowrap text-white/80 hover:text-[#D4AF37] transition-colors duration-300 ${
                l.primary ? "" : "hidden 2xl:inline"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${(settings?.phone || "").replace(/[^\d+]/g, "")}`}
            data-testid="header-phone"
            className="hidden xl:inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm px-4 py-2 whitespace-nowrap transition-colors duration-300"
          >
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            {settings?.phone}
          </a>
          <Link
            to="/admin"
            data-testid="admin-link"
            className="hidden sm:inline-flex text-xs text-white/50 hover:text-white/90 transition-colors"
          >
            Admin
          </Link>
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden grid place-items-center w-10 h-10 rounded-lg bg-white/10 text-white border border-white/15"
            aria-label="Meni"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden bg-[#0A1F44] border-t border-white/10 px-6 py-5" data-testid="mobile-menu">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-white/85 py-2 border-b border-white/5"
              >
                {l.label}
              </a>
            ))}
            <Link to="/admin" className="text-sm text-[#D4AF37] py-2">
              Admin panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
