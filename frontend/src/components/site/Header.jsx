import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

const links = [
  { href: "#o-meni", label: "O meni", primary: true },
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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/94 backdrop-blur-xl border-b border-[#E7EDF6] shadow-[0_10px_30px_-24px_rgba(10,31,68,0.5)]"
          : "bg-gradient-to-b from-[#0A1F44]/60 to-transparent"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between h-[76px]">
        <a href="#top" data-testid="logo-link" className="flex items-center gap-3 group">
          <span className={`grid place-items-center w-11 h-11 rounded-xl font-head font-extrabold text-lg shadow-md transition-all duration-300 group-hover:scale-105 ${scrolled ? "bg-[#0A1F44] text-[#D4AF37]" : "bg-[#D4AF37] text-[#0A1F44]"}`}>
            AT
          </span>
          <span className="leading-tight">
            <span className={`block font-head font-semibold text-sm sm:text-base transition-colors duration-300 ${scrolled ? "text-[#0A1F44]" : "text-white"}`}>ANDRI-TIM</span>
            <span className={`block text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${scrolled ? "text-[#8496AE]" : "text-white/65"}`}>
              Andriana Grozdanović
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-${l.href.replace("#", "")}`}
              className={`text-sm whitespace-nowrap transition-colors duration-300 ${
                scrolled ? "text-[#52627A] hover:text-[#0A1F44]" : "text-white/85 hover:text-[#D4AF37]"
              } ${l.primary ? "" : "hidden min-[1750px]:inline"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${(settings?.phone || "").replace(/[^\d+]/g, "")}`}
            data-testid="header-phone"
            className={`hidden xl:inline-flex items-center gap-2 rounded-full text-sm px-4 py-2 whitespace-nowrap transition-colors duration-300 ${
              scrolled ? "bg-[#0A1F44] hover:bg-[#1B3A6B] text-white" : "bg-white/12 hover:bg-white/25 border border-white/25 text-white backdrop-blur-sm"
            }`}
          >
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            {settings?.phone}
          </a>
          <Link
            to="/admin"
            data-testid="admin-link"
            className={`hidden sm:inline-flex text-xs transition-colors ${scrolled ? "text-[#94A3B8] hover:text-[#0A1F44]" : "text-white/55 hover:text-white"}`}
          >
            Admin
          </Link>
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className={`lg:hidden grid place-items-center w-10 h-10 rounded-lg border transition-colors duration-300 ${
              scrolled ? "bg-white text-[#0A1F44] border-[#E7EDF6] shadow-sm" : "bg-white/12 text-white border-white/25 backdrop-blur-sm"
            }`}
            aria-label="Meni"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-[#E7EDF6] px-6 py-5 shadow-lg" data-testid="mobile-menu">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[#334155] py-2 border-b border-[#F1F5F9]"
              >
                {l.label}
              </a>
            ))}
            <Link to="/admin" className="text-sm text-[#2E5CA8] py-2">
              Admin panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
