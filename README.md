# Andri-Tim — sajt za pripreme iz računovodstva

Sajt za pripremu ispita i kolokvijuma iz finansijskog i upravljačkog računovodstva
(Andriana Grozdanović, dipl. ecc.), sa admin panelom za samostalno upravljanje sadržajem.

## Struktura

```
/backend      FastAPI + MongoDB API (paketi, dokumenti, termini, zahtevi, admin)
/frontend     React (CRA) + Tailwind + shadcn/ui
/memory       interne napomene (test kredencijali)
```

## Funkcionalnosti

- Hero slajder sa 3 slike i animiranim statistikama
- Biografija „O meni” sa achievements karticama
- Paketi za studente sa cenovnikom i bedžom „Paket meseca”
- Forma za zahtev za konsultacije (bez kalendara)
- Kalendar termina za srednjoškolce (12h–19h) sa rezervacijom i potvrdom
- Skripte sa zaštićenim preview-om prvih 5 strana
- Besplatan materijal uz obavezan unos podataka (lead baza)
- Utisci učenika, FAQ akordeon, kontakt sekcija (Viber/WhatsApp/Instagram/Email)
- Politika privatnosti (`/privatnost`)
- Admin panel (`/admin`) — slike, dokumenti, video, paketi i cene, zakazivanje,
  utisci, FAQ, kontakt podaci, baza korisnika

## Lokalno pokretanje

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # popuni vrednosti
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env        # postavi REACT_APP_BACKEND_URL
yarn start
```

## Environment varijable

Vidi `backend/.env.example` i `frontend/.env.example`. Nijedna lozinka ni ključ
nije hardkodovan u kodu.

## Admin pristup

`/admin` — lozinka se čita iz `ADMIN_PASSWORD` (backend `.env`).
