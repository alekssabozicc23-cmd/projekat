import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#0A1F44] py-16 sm:py-20">
        <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <Link to="/" data-testid="back-home" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Nazad na sajt
          </Link>
          <h1 className="font-head text-4xl sm:text-5xl font-bold text-white mt-6">Politika privatnosti</h1>
          <p className="mt-4 text-white/60 text-sm">Poslednja izmena: jun 2026.</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto py-14 sm:py-20 space-y-8 text-[#475569] text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="font-head text-2xl font-semibold text-[#0A1F44] mb-3">Koje podatke prikupljamo</h2>
          <p>
            Prikupljamo isključivo podatke koje sami unesete u forme na sajtu: ime i prezime, email adresu, broj
            telefona, razred/fakultet i sadržaj poruke. Ne koristimo alate za praćenje ponašanja ni reklamne kolačiće.
          </p>
        </section>
        <section>
          <h2 className="font-head text-2xl font-semibold text-[#0A1F44] mb-3">Zašto ih koristimo</h2>
          <p>
            Podaci se koriste da bismo odgovorili na vaš zahtev za konsultacije ili čas, poslali besplatan materijal i,
            ako se saglasite, obavestili vas o novim terminima i paketima. Podaci se ne prodaju i ne dele sa trećim
            licima u marketinške svrhe.
          </p>
        </section>
        <section>
          <h2 className="font-head text-2xl font-semibold text-[#0A1F44] mb-3">Čuvanje i bezbednost</h2>
          <p>
            Podaci se čuvaju u zaštićenoj bazi kojoj pristupa samo Andriana Grozdanović. Materijali (skripte,
            praktikumi) su autorsko delo i nije dozvoljeno njihovo dalje deljenje ili umnožavanje.
          </p>
        </section>
        <section>
          <h2 className="font-head text-2xl font-semibold text-[#0A1F44] mb-3">Vaša prava</h2>
          <p>
            U svakom trenutku možete zahtevati pregled, ispravku ili brisanje svojih podataka — dovoljno je da nam se
            javite na email ili Viber naveden u kontakt sekciji sajta.
          </p>
        </section>
        <section>
          <h2 className="font-head text-2xl font-semibold text-[#0A1F44] mb-3">Uslovi korišćenja</h2>
          <p>
            Zakazivanje termina putem sajta predstavlja zahtev, a ne potvrđenu rezervaciju — termin je potvrđen tek
            nakon poruke ili mejla potvrde. Uplaćeni paketi su namenjeni isključivo licnoj upotrebi korisnika.
          </p>
        </section>
      </div>
    </div>
  );
}
