# PRD — Andri-Tim (sajt za pripreme iz računovodstva)

## Originalni problem
Profesionalan sajt za pripremu ispita iz računovodstva (Andriana Grozdanović, dipl. ecc., 17 godina
iskustva, 3.000+ položenih ispita). Studenti + srednjoškolci, admin panel za samostalno upravljanje
sadržajem, sav tekst na srpskom, premium plavi/navy dizajn.

## Arhitektura
- Backend: FastAPI + MongoDB (`/app/backend/server.py`), Emergent object storage (`storage.py`),
  Emergent-managed Resend email (`emailer.py`), placeholder PDF generator (`pdfgen.py`).
- Frontend: React (CRA) + Tailwind, rute `/`, `/privatnost`, `/admin`.
- Admin auth: lozinka iz `ADMIN_PASSWORD`, HMAC token u `X-Admin-Token` headeru.

## Korisnički profili
1. Student ekonomskog fakulteta — traži paket, poručuje, zakazuje konsultacije.
2. Srednjoškolac / roditelj — bira slobodan termin u kalendaru 12–19h.
3. Posetilac — preuzima besplatan materijal (ostavlja ime/email).
4. Andriana (admin) — menja slike, dokumente, cene, termine, utiske, FAQ, kontakt.

## Implementirano (jun 2026)
- Hero slajder (3 slajda, auto + strelice/dots), animirane statistike 17+/3.000+/31.
- „O meni” sa achievements karticama i citatom.
- 8 paketa sa cenovnikom, filteri po grupi, bedž „Paket meseca” (toggle iz admina).
- Forma za konsultacije (bez kalendara) sa pre-fill iz kartice paketa.
- Nedeljni kalendar termina 12:00–19:00: slobodno/na čekanju/zauzeto/zatvoreno, modal rezervacije.
- Skripte sa zaštićenim preview-om prvih 5 strana (iframe bez toolbara + watermark).
- Besplatan materijal uz lead-capture formu; leadovi vidljivi u adminu.
- Utisci (karusel + grid), FAQ akordeon, kontakt sekcija + forma, politika privatnosti.
- Email notifikacije (Resend) za konsultacije, rezervacije, leadove, poruke + potvrde korisniku.
- Admin panel: 9 tabova (slike, dokumenti, video, paketi i cene, zakazivanje, utisci, FAQ,
  kontakt podaci, baza korisnika) sa uploadom slika i PDF-ova u cloud storage.
- SEO meta tagovi, mobilna responzivnost, README + .env.example + .gitignore za GitHub export.

## Testirano
Iteracija 1: backend 100% (23 testa), frontend 100%. Bez blokirajućih grešaka.

## Backlog
- P1: prave fotografije i pravi PDF materijali (zamena kroz admin panel).
- P1: Instagram link (čeka podatak od klijentkinje).
- P2: newsletter prijava u footeru; online plaćanje; automatski backup baze.
- P2: podela `server.py` na routere; validacija veličine upload fajlova.
