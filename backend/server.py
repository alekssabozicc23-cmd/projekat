import os
import uuid
import hmac
import hashlib
import asyncio
import logging
from pathlib import Path
from datetime import datetime, timezone, date, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Header, UploadFile, File, Form, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emailer import send_email, render_template  # noqa: E402
from storage import init_storage, put_object, get_object, APP_NAME, MIME_TYPES  # noqa: E402
from pdfgen import make_pdf, placeholder_pages  # noqa: E402

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Andri-Tim API")
api = APIRouter(prefix="/api")

ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
TOKEN_SECRET = os.environ['ADMIN_TOKEN_SECRET']
NO_ID = {"_id": 0}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def admin_token() -> str:
    return hmac.new(TOKEN_SECRET.encode(), ADMIN_PASSWORD.encode(), hashlib.sha256).hexdigest()


def require_admin(x_admin_token: Optional[str] = Header(None)):
    if not x_admin_token or not hmac.compare_digest(x_admin_token, admin_token()):
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    return True


# ---------------------------------------------------------------- models
class LoginIn(BaseModel):
    password: str


class ConsultationIn(BaseModel):
    name: str
    contact: str
    email: Optional[str] = None
    subject: str
    message: Optional[str] = ""


class BookingIn(BaseModel):
    name: str
    grade: str
    phone: str
    email: Optional[str] = None
    note: Optional[str] = ""
    slot_date: str
    slot_time: str


class LeadIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    school: Optional[str] = ""


class ContactIn(BaseModel):
    name: str
    email: Optional[str] = None
    contact: Optional[str] = ""
    message: str


class PackageIn(BaseModel):
    category: str = "student"
    group: str = "Finansijsko računovodstvo"
    name: str
    price: str
    features: List[str] = []
    featured: bool = False
    badge: Optional[str] = None
    order: int = 0
    note: Optional[str] = ""
    document_id: Optional[str] = None


class TestimonialIn(BaseModel):
    name: str
    school: str = ""
    subject: str = ""
    rating: int = 5
    text: str
    order: int = 0


class FaqIn(BaseModel):
    question: str
    answer: str
    order: int = 0


class VideoIn(BaseModel):
    title: str
    url: str
    package: Optional[str] = ""
    order: int = 0
    is_free: bool = False


class VideoUrlItem(BaseModel):
    id: str
    url: str


class VideoBulkUrls(BaseModel):
    items: List[VideoUrlItem]


class VideoBulkCreate(BaseModel):
    package: str = ""
    lines: str


class SlotAction(BaseModel):
    slot_date: str
    slot_time: str


class StatusIn(BaseModel):
    status: str


# ---------------------------------------------------------------- seed
DEFAULT_SETTINGS = {
    "id": "site",
    "phone": "064/455-25-67",
    "viber": "viber://chat?number=%2B381644552567",
    "whatsapp": "https://wa.me/381644552567",
    "instagram": "https://www.instagram.com/casovi.racunovodstva.andriana/",
    "instagram_handle": "@casovi.racunovodstva.andriana",
    "email": "andritim.centar@gmail.com",
    "notify_email": "andritim.centar@gmail.com",
    "address": "Niš, Srbija",
    "hero_slides": [
        {
            "image": "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/tn98tpeu_5.jpeg",
            "badge": "17 godina iskustva",
            "title": "Položi računovodstvo bez stresa",
            "subtitle": "Uz 17 godina iskustva i preko 3.000 uspešno položenih ispita i kolokvijuma.",
        },
        {
            "image": "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/gfiwdsbw_1.jpeg",
            "badge": "Sertifikati i rezultati",
            "title": "Tvoja desetka je sledeća",
            "subtitle": "U 2024. godini 31 učenik je na prvom kolokvijumu iz upravljačkog računovodstva dobio ocenu 10.",
        },
        {
            "image": "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/c04yi4jw_4.jpeg",
            "badge": "Sistematičan rad",
            "title": "Praktikumi, video lekcije i konsultacije",
            "subtitle": "Sve što ti je potrebno za ispit — na jednom mestu, tvojim tempom.",
        },
    ],
    "about_image": "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/tn98tpeu_5.jpeg",
    "gallery": [
        "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/gfiwdsbw_1.jpeg",
        "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/mekti9ir_3.jpeg",
        "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/c04yi4jw_4.jpeg",
        "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/fpkxok8v_2.jpeg",
        "https://customer-assets-7cd3h4nn.emergentagent.net/job_study-ua-accounting/artifacts/tn98tpeu_5.jpeg",
    ],
    "gallery_title": "Galerija — časovi, sertifikati i materijali",
    "gallery_note": "Sve slike sa sajta na jednom mestu. Klikni na sliku za veći prikaz.",
    "slot_hours": ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
    "results_title": "Rezultati sa poslednjih rokova",
    "results_note": "Brojevi se ažuriraju posle svakog roka — ovo su ocene mojih učenika.",
    "results": [
        {"rok": "Januarski rok 2026.", "subject": "Finansijsko računovodstvo", "tens": 12, "passed": 34},
        {"rok": "Oktobarski rok 2025.", "subject": "Upravljačko računovodstvo", "tens": 9, "passed": 27},
        {"rok": "I kolokvijum 2024.", "subject": "Upravljačko računovodstvo", "tens": 31, "passed": 58},
    ],
    "updated_at": now_iso(),
}

DEFAULT_PACKAGES = [
    {
        "group": "Finansijsko računovodstvo", "name": "Paket za kolokvijum", "price": "5.000 din", "order": 1,
        "features": ["Sažeta teorija", "14 video lekcija", "Praktikum sa 20 zadataka", "Rešenja svih zadataka",
                     "11 testova za proveru znanja", "Konsultacije po potrebi"],
    },
    {
        "group": "Finansijsko računovodstvo", "name": "Paket za ispit", "price": "15.000 din", "order": 2,
        "features": ["Zbirka zadataka sa rešenjima", "Radna sveska", "32 video lekcije",
                     "Skripta za usmeni deo", "Konsultacije bez ograničenja", "Sertifikat o završenoj pripremi"],
    },
    {
        "group": "Upravljačko računovodstvo", "name": "Paket za prvi deo", "price": "7.000 din", "order": 3,
        "features": ["Praktikum I deo", "Rešenja zadataka", "11 video lekcija", "Skripta za prvi deo", "Konsultacije"],
    },
    {
        "group": "Upravljačko računovodstvo", "name": "Paket za drugi deo", "price": "7.000 din", "order": 4,
        "features": ["Praktikum II deo", "Rešenja zadataka", "19 video lekcija", "Skripta za drugi deo", "Konsultacije"],
    },
    {
        "group": "Upravljačko računovodstvo", "name": "Paket za ispit (oba dela)", "price": "14.000 din", "order": 5,
        "features": ["Praktikum I i II deo", "Rešenja zadataka", "30 video lekcija", "Skripta za usmeni",
                     "Konsultacije", "Sertifikat o završenoj pripremi"],
        "featured": True, "badge": "Paket meseca",
    },
    {
        "group": "Kombinovani paket", "name": "Finansijsko + Upravljačko", "price": "25.000 din", "order": 6,
        "features": ["Kompletan paket iz finansijskog računovodstva", "Kompletan paket iz upravljačkog računovodstva",
                     "Sve video lekcije i praktikumi", "Neograničene konsultacije", "Sertifikat"],
        "note": "Najveća ušteda — dva kompletna paketa po povoljnijoj ceni.",
    },
    {
        "group": "Skripte", "name": "Skripta iz finansijskog", "price": "2.000 din", "order": 7,
        "features": ["Sažeta teorija za usmeni deo", "Jasni primeri i objašnjenja", "PDF format"],
    },
    {
        "group": "Skripte", "name": "Skripta iz upravljačkog", "price": "2.000 din", "order": 8,
        "features": ["Sažeta teorija za usmeni deo", "Jasni primeri i objašnjenja", "PDF format"],
    },
]

DEFAULT_FAQ = [
    ("Da li mi treba predznanje?", "Ne. Priprema počinje od osnova — od kontnog okvira i logike knjiženja, "
     "pa do najkompleksnijih zadataka. Radimo tvojim tempom, bez preskakanja koraka."),
    ("Kako izgledaju konsultacije?", "Konsultacije su individualne, online ili u prostoru centra u Nišu. "
     "Popuni formu sa predmetom i pitanjem, a ja te kontaktiram radi termina koji ti odgovara."),
    ("Kako dobijam materijal?", "Nakon poručivanja paketa dobijaš pristup skriptama, praktikumima i video lekcijama "
     "u PDF/video formatu, uz jasan plan učenja."),
    ("Koliko traje priprema?", "Za kolokvijum je najčešće dovoljno 2–3 nedelje sistematičnog rada, a za ceo ispit "
     "4–6 nedelja. Sve zavisi od tvog tempa i roka."),
    ("Kako se zakazuju časovi za srednjoškolce?", "Kroz kalendar na sajtu — izaberi slobodan termin (14h–19h, radnim "
     "danima i subotom), pošalji zahtev i dobijaš potvrdu."),
    ("Da li dobijam sertifikat?", "Da, uz pakete za ispit dobijaš sertifikat Andri-Tim edukacionog centra o završenoj "
     "pripremnoj nastavi."),
]

DEFAULT_TESTIMONIALS = [
    ("Marta Nikolić", "Ekonomski fakultet Niš", "Finansijsko računovodstvo — 10", 5,
     "Došla sam sa nulom znanja i strahom od knjiženja. Andriana je sve razložila na sitne korake i položila sam iz prvog."),
    ("Emilija Mitić", "Ekonomski fakultet Niš", "Finansijsko računovodstvo — 9", 5,
     "Praktikum i rešenja su zlato. Kada sam došla na ispit, zadaci su mi bili poznati jer smo sve tipove prošli."),
    ("Stefan Jovanović", "Ekonomski fakultet Beograd", "Upravljačko računovodstvo — 10", 5,
     "Video lekcije sam gledao kad mi je odgovaralo, a na konsultacijama smo rešavali samo ono što mi nije bilo jasno."),
    ("Jovana Perić", "Ekonomski fakultet Podgorica", "Upravljačko — kolokvijum 10", 5,
     "Najviše mi je značilo što nikada nisam osećala pritisak. Uvek strpljivo objašnjenje, koliko puta treba."),
    ("Nemanja Radović", "Ekonomska škola, Niš", "Osnovi ekonomije — 5", 5,
     "Časovi su mi vratili samopouzdanje. Konačno razumem šta radim, a ne učim napamet."),
]


DEFAULT_VIDEOS = [
    ("Finansijsko računovodstvo", [
        "Kontni okvir i logika knjiženja",
        "Dvojno knjigovodstvo — osnovna pravila",
        "Bilans stanja: aktiva i pasiva",
        "Bilans uspeha: prihodi i rashodi",
        "Nabavka i prodaja robe",
        "Zalihe materijala i obračun troškova",
        "Osnovna sredstva i amortizacija",
        "Potraživanja i obaveze",
        "Obračun PDV-a u knjiženjima",
        "Zarade i doprinosi",
        "Kapital i rezerve",
        "Zaključna knjiženja i utvrđivanje rezultata",
        "Primer kolokvijumskog zadatka — korak po korak",
        "Simulacija ispita: kompletan zadatak",
    ]),
    ("Upravljačko računovodstvo — prvi deo", [
        "Uvod u upravljačko računovodstvo",
        "Vrste i ponašanje troškova",
        "Podela troškova po mestima i nosiocima",
        "Obračun po stvarnim troškovima",
        "Obračun po planskim troškovima",
        "Kalkulacija cene koštanja",
        "Metod dodatne kalkulacije",
        "Metod deobne kalkulacije",
        "Analiza odstupanja troškova",
        "Praktikum I — rešeni zadaci",
        "Priprema za prvi kolokvijum",
    ]),
    ("Upravljačko računovodstvo — drugi deo", [
        "Sistem obračuna po varijabilnim troškovima",
        "Prag rentabilnosti (break-even)",
        "CVP analiza — primeri",
        "Marža pokrića i odlučivanje",
        "Planiranje i budžetiranje",
        "Master budžet — izrada",
        "Budžet gotovine",
        "Standardni troškovi i odstupanja",
        "Interne transferne cene",
        "Kratkoročne poslovne odluke",
        "Praktikum II — rešeni zadaci",
        "Priprema za drugi kolokvijum",
    ]),
    ("Usmeni deo ispita", [
        "Najčešća pitanja sa usmenog — finansijsko",
        "Najčešća pitanja sa usmenog — upravljačko",
        "Kako odgovoriti na teorijsko pitanje",
    ]),
]


FREE_VIDEO_TITLES = {
    "Kontni okvir i logika knjiženja",
    "Uvod u upravljačko računovodstvo",
    "Prag rentabilnosti (break-even)",
}


async def seed_videos():
    existing_titles = {v["title"] async for v in db.videos.find({}, {"_id": 0, "title": 1})}
    docs = []
    order = 0
    for group, titles in DEFAULT_VIDEOS:
        for t in titles:
            if t not in existing_titles:
                docs.append({"id": str(uuid.uuid4()), "title": t, "url": "", "package": group,
                             "is_free": t in FREE_VIDEO_TITLES, "order": order, "created_at": now_iso()})
            order += 1
    if docs:
        await db.videos.insert_many(docs)
        logger.info(f"Seed: {len(docs)} video lekcija")


async def seed():
    existing = await db.settings.find_one({"id": "site"})
    if not existing:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
    else:
        missing = {k: v for k, v in DEFAULT_SETTINGS.items() if k not in existing}
        if not existing.get("instagram") or existing.get("instagram") == "https://www.instagram.com/":
            missing["instagram"] = DEFAULT_SETTINGS["instagram"]
            missing["instagram_handle"] = DEFAULT_SETTINGS["instagram_handle"]
        if missing:
            await db.settings.update_one({"id": "site"}, {"$set": missing})
    existing_pkgs = {p["name"] async for p in db.packages.find({}, {"_id": 0, "name": 1})}
    docs = []
    for p in DEFAULT_PACKAGES:
        if p["name"] in existing_pkgs:
            continue
        docs.append({"id": str(uuid.uuid4()), "category": "student", "featured": p.get("featured", False),
                     "badge": p.get("badge"), "note": p.get("note", ""), "document_id": None,
                     "group": p["group"], "name": p["name"], "price": p["price"],
                     "features": p["features"], "order": p["order"], "created_at": now_iso()})
    if docs:
        await db.packages.insert_many(docs)
    if await db.faq.count_documents({}) == 0:
        await db.faq.insert_many([{"id": str(uuid.uuid4()), "question": q, "answer": a, "order": i}
                                  for i, (q, a) in enumerate(DEFAULT_FAQ)])
    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([
            {"id": str(uuid.uuid4()), "name": n, "school": s, "subject": sub, "rating": r, "text": t, "order": i}
            for i, (n, s, sub, r, t) in enumerate(DEFAULT_TESTIMONIALS)])
    if await db.videos.count_documents({}) == 0:
        await db.videos.insert_many([
            {"id": str(uuid.uuid4()), "title": "Uvod u dvojno knjigovodstvo", "url": "",
             "package": "Finansijsko računovodstvo", "order": 0, "created_at": now_iso()},
        ])
    await seed_videos()
    await seed_documents()


PLACEHOLDER_DOCS = [
    ("Skripta iz finansijskog računovodstva", "skripta", "Finansijsko računovodstvo", 24, True),
    ("Skripta iz upravljačkog računovodstva", "skripta", "Upravljačko računovodstvo", 24, True),
    ("Besplatan vodič: 5 najčešćih grešaka na kolokvijumu", "free", "Besplatno", 6, False),
]


async def seed_documents():
    existing = {d["title"] async for d in db.documents.find({}, {"_id": 0, "title": 1})}
    try:
        for title, category, group, pages, has_preview in PLACEHOLDER_DOCS:
            if title in existing:
                continue
            doc_id = str(uuid.uuid4())
            full = make_pdf(placeholder_pages(title, pages))
            full_path = f"{APP_NAME}/docs/{doc_id}.pdf"
            await asyncio.to_thread(put_object, full_path, full, "application/pdf")
            preview_path = None
            if has_preview:
                prev = make_pdf(placeholder_pages(title + " (preview)", 5))
                preview_path = f"{APP_NAME}/docs/{doc_id}-preview.pdf"
                await asyncio.to_thread(put_object, preview_path, prev, "application/pdf")
            await db.documents.insert_one({
                "id": doc_id, "title": title, "category": category, "group": group,
                "price": "2.000 din" if category == "skripta" else "",
                "storage_path": full_path, "preview_path": preview_path,
                "original_filename": f"{title}.pdf", "content_type": "application/pdf",
                "is_active": True, "is_deleted": False, "order": 0, "created_at": now_iso(),
            })
        logger.info("Placeholder dokumenti kreirani")
    except Exception as e:
        logger.error(f"Seed dokumenata nije uspeo: {e}")


@app.on_event("startup")
async def startup():
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await seed()


# ---------------------------------------------------------------- public
@api.get("/")
async def root():
    return {"message": "Andri-Tim API"}


@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"id": "site"}, NO_ID)
    return s or DEFAULT_SETTINGS


@api.get("/packages")
async def list_packages():
    return await db.packages.find({}, NO_ID).sort("order", 1).to_list(200)


@api.get("/documents")
async def list_documents(category: Optional[str] = None):
    q = {"is_deleted": False}
    if category:
        q["category"] = category
    docs = await db.documents.find(q, NO_ID).sort("order", 1).to_list(200)
    for d in docs:
        d.pop("storage_path", None)
    return docs


@api.get("/testimonials")
async def list_testimonials():
    return await db.testimonials.find({}, NO_ID).sort("order", 1).to_list(200)


@api.get("/faq")
async def list_faq():
    return await db.faq.find({}, NO_ID).sort("order", 1).to_list(200)


@api.get("/videos")
async def list_videos():
    return await db.videos.find({}, NO_ID).sort("order", 1).to_list(200)


@api.get("/files/{path:path}")
async def serve_file(path: str):
    rec = await db.documents.find_one({"$or": [{"storage_path": path}, {"preview_path": path}], "is_deleted": False})
    if not rec and not await db.assets.find_one({"storage_path": path}):
        raise HTTPException(status_code=404, detail="Fajl nije nađen")
    try:
        data, ctype = await asyncio.to_thread(get_object, path)
    except Exception:
        raise HTTPException(status_code=404, detail="Fajl nije nađen")
    return Response(content=data, media_type=ctype, headers={"Cache-Control": "public, max-age=3600"})


@api.get("/documents/{doc_id}/preview")
async def document_preview(doc_id: str):
    rec = await db.documents.find_one({"id": doc_id, "is_deleted": False})
    if not rec or not rec.get("preview_path"):
        raise HTTPException(status_code=404, detail="Preview nije dostupan")
    data, ctype = await asyncio.to_thread(get_object, rec["preview_path"])
    return Response(content=data, media_type=ctype,
                    headers={"Content-Disposition": "inline", "Cache-Control": "no-store"})


# ---------------------------------------------------------------- slots & bookings
def week_dates(start: str) -> List[str]:
    d = date.fromisoformat(start)
    d = d - timedelta(days=d.weekday())
    return [(d + timedelta(days=i)).isoformat() for i in range(6)]


@api.get("/slots")
async def get_slots(week_start: Optional[str] = None):
    settings = await db.settings.find_one({"id": "site"}, NO_ID) or DEFAULT_SETTINGS
    hours = settings.get("slot_hours") or DEFAULT_SETTINGS["slot_hours"]
    start = week_start or date.today().isoformat()
    days = week_dates(start)
    bookings = await db.bookings.find({"slot_date": {"$in": days}, "status": {"$ne": "otkazano"}}, NO_ID).to_list(500)
    blocked = await db.blocked_slots.find({"slot_date": {"$in": days}}, NO_ID).to_list(500)
    taken = {(b["slot_date"], b["slot_time"]): b["status"] for b in bookings}
    blk = {(b["slot_date"], b["slot_time"]) for b in blocked}
    out = []
    for d in days:
        for h in hours:
            key = (d, h)
            if key in blk:
                state = "zatvoreno"
            elif key in taken:
                state = "zauzeto" if taken[key] == "potvrdjeno" else "na cekanju"
            else:
                state = "slobodno"
            out.append({"slot_date": d, "slot_time": h, "state": state})
    return {"week": days, "hours": hours, "slots": out}


@api.post("/bookings")
async def create_booking(payload: BookingIn):
    settings = await db.settings.find_one({"id": "site"}, NO_ID) or DEFAULT_SETTINGS
    if await db.blocked_slots.find_one({"slot_date": payload.slot_date, "slot_time": payload.slot_time}):
        raise HTTPException(status_code=400, detail="Termin nije dostupan")
    if await db.bookings.find_one({"slot_date": payload.slot_date, "slot_time": payload.slot_time,
                                   "status": {"$ne": "otkazano"}}):
        raise HTTPException(status_code=400, detail="Termin je već rezervisan")
    doc = payload.model_dump()
    doc.update({"id": str(uuid.uuid4()), "status": "na cekanju", "created_at": now_iso()})
    await db.bookings.insert_one(dict(doc))
    rows = [("Ime", payload.name), ("Razred", payload.grade), ("Telefon", payload.phone),
            ("Termin", f"{payload.slot_date} u {payload.slot_time}"), ("Napomena", payload.note or "-")]
    notify = settings.get("notify_email")
    if notify:
        await send_email(to=notify, subject="Novi zahtev za čas (srednja škola)",
                         html=render_template(heading="Novi zahtev za termin",
                                              intro="Pristigao je novi zahtev za čas preko sajta.",
                                              rows=rows, outro="Potvrdi ili otkaži termin u admin panelu."),
                         reply_to=payload.email or None)
    if payload.email:
        await send_email(to=payload.email, subject="Primili smo tvoj zahtev za čas",
                         html=render_template(heading=f"Zdravo {payload.name},",
                                              intro="Primili smo tvoj zahtev za termin. Andriana će ti potvrditi termin telefonom ili mejlom.",
                                              rows=rows, outro="Vidimo se na času!"),
                         reply_to=notify)
    doc.pop("_id", None)
    return doc


@api.post("/consultations")
async def create_consultation(payload: ConsultationIn):
    settings = await db.settings.find_one({"id": "site"}, NO_ID) or DEFAULT_SETTINGS
    doc = payload.model_dump()
    doc.update({"id": str(uuid.uuid4()), "status": "na cekanju", "created_at": now_iso()})
    await db.consultations.insert_one(dict(doc))
    rows = [("Ime", payload.name), ("Kontakt", payload.contact), ("Email", payload.email or "-"),
            ("Predmet / paket", payload.subject), ("Poruka", payload.message or "-")]
    notify = settings.get("notify_email")
    if notify:
        await send_email(to=notify, subject="Novi zahtev za konsultacije",
                         html=render_template(heading="Novi zahtev za konsultacije",
                                              intro="Student je poslao zahtev za konsultacije preko sajta.",
                                              rows=rows), reply_to=payload.email or None)
    if payload.email:
        await send_email(to=payload.email, subject="Zahtev za konsultacije je primljen",
                         html=render_template(heading=f"Zdravo {payload.name},",
                                              intro="Primili smo tvoj zahtev za konsultacije. Kontaktiraću te u najkraćem roku.",
                                              rows=rows, outro="Do skorog viđenja, Andriana"),
                         reply_to=notify)
    doc.pop("_id", None)
    return doc


@api.post("/contact")
async def create_contact(payload: ContactIn):
    settings = await db.settings.find_one({"id": "site"}, NO_ID) or DEFAULT_SETTINGS
    doc = payload.model_dump()
    doc.update({"id": str(uuid.uuid4()), "status": "na cekanju", "created_at": now_iso()})
    await db.messages.insert_one(dict(doc))
    notify = settings.get("notify_email")
    if notify:
        await send_email(to=notify, subject="Nova poruka sa sajta",
                         html=render_template(heading="Nova poruka sa sajta", intro="Pristigla je nova poruka.",
                                              rows=[("Ime", payload.name), ("Email", payload.email or "-"),
                                                    ("Kontakt", payload.contact or "-"), ("Poruka", payload.message)]),
                         reply_to=payload.email or None)
    doc.pop("_id", None)
    return doc


@api.post("/leads")
async def create_lead(payload: LeadIn):
    settings = await db.settings.find_one({"id": "site"}, NO_ID) or DEFAULT_SETTINGS
    doc = payload.model_dump()
    doc.update({"id": str(uuid.uuid4()), "created_at": now_iso()})
    await db.leads.insert_one(dict(doc))
    free_docs = await db.documents.find({"category": "free", "is_active": True, "is_deleted": False},
                                        NO_ID).sort("order", 1).to_list(50)
    if not free_docs:
        raise HTTPException(status_code=404, detail="Besplatan materijal trenutno nije dostupan")
    notify = settings.get("notify_email")
    if notify:
        await send_email(to=notify, subject="Novo preuzimanje besplatnog materijala",
                         html=render_template(heading="Novi kontakt iz baze", intro="Neko je preuzeo besplatan materijal.",
                                              rows=[("Ime", payload.name), ("Email", str(payload.email)),
                                                    ("Telefon", payload.phone or "-"), ("Škola / fakultet", payload.school or "-")]))
    await send_email(to=str(payload.email), subject="Tvoj besplatan materijal je spreman",
                     html=render_template(heading=f"Zdravo {payload.name},",
                                          intro="Hvala što si preuzeo/la besplatan materijal. Preuzimanje je već započelo na sajtu, a materijal ti uvek ostaje dostupan preko sajta.",
                                          rows=[("Materijali", ", ".join(d["title"] for d in free_docs))],
                                          outro="Ako ti bilo šta ne bude jasno, slobodno se javi."),
                     reply_to=notify)
    documents = [{
        "id": d["id"],
        "title": d["title"],
        "download_url": f"/api/files/{d['storage_path']}",
        "filename": d.get("original_filename", "materijal.pdf"),
    } for d in free_docs]
    return {"documents": documents, **documents[0]}


# ---------------------------------------------------------------- admin
@api.post("/admin/login")
async def admin_login(payload: LoginIn):
    if not hmac.compare_digest(payload.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Pogrešna lozinka")
    return {"token": admin_token()}


@api.get("/admin/verify")
async def admin_verify(x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    return {"ok": True}


@api.put("/admin/settings")
async def update_settings(payload: dict, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    payload.pop("id", None)
    payload["updated_at"] = now_iso()
    await db.settings.update_one({"id": "site"}, {"$set": payload}, upsert=True)
    return await db.settings.find_one({"id": "site"}, NO_ID)


@api.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), kind: str = Form("asset"),
                       x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    ext = (file.filename or "bin").split(".")[-1].lower()
    ctype = file.content_type or MIME_TYPES.get(ext, "application/octet-stream")
    path = f"{APP_NAME}/{kind}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = await asyncio.to_thread(put_object, path, data, ctype)
    await db.assets.insert_one({"id": str(uuid.uuid4()), "storage_path": result["path"], "kind": kind,
                                "original_filename": file.filename, "content_type": ctype,
                                "size": result.get("size"), "created_at": now_iso()})
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}


@api.post("/admin/documents")
async def create_document(title: str = Form(...), category: str = Form("skripta"), group: str = Form(""),
                          price: str = Form(""), file: UploadFile = File(...),
                          preview: Optional[UploadFile] = File(None),
                          x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    doc_id = str(uuid.uuid4())
    data = await file.read()
    path = f"{APP_NAME}/docs/{doc_id}.pdf"
    await asyncio.to_thread(put_object, path, data, "application/pdf")
    preview_path = None
    if preview is not None:
        pdata = await preview.read()
        if pdata:
            preview_path = f"{APP_NAME}/docs/{doc_id}-preview.pdf"
            await asyncio.to_thread(put_object, preview_path, pdata, "application/pdf")
    doc = {"id": doc_id, "title": title, "category": category, "group": group, "price": price,
           "storage_path": path, "preview_path": preview_path, "original_filename": file.filename,
           "content_type": "application/pdf", "is_active": True, "is_deleted": False,
           "order": 0, "created_at": now_iso()}
    await db.documents.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@api.put("/admin/documents/{doc_id}")
async def update_document(doc_id: str, payload: dict, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    allowed = {k: v for k, v in payload.items() if k in {"title", "category", "group", "price", "is_active", "order"}}
    await db.documents.update_one({"id": doc_id}, {"$set": allowed})
    return await db.documents.find_one({"id": doc_id}, NO_ID)


@api.post("/admin/documents/{doc_id}/replace")
async def replace_document(doc_id: str, file: UploadFile = File(...), target: str = Form("full"),
                           x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    rec = await db.documents.find_one({"id": doc_id})
    if not rec:
        raise HTTPException(status_code=404, detail="Dokument nije nađen")
    data = await file.read()
    suffix = "-preview" if target == "preview" else ""
    path = f"{APP_NAME}/docs/{doc_id}{suffix}-{uuid.uuid4().hex[:8]}.pdf"
    await asyncio.to_thread(put_object, path, data, "application/pdf")
    field = "preview_path" if target == "preview" else "storage_path"
    await db.documents.update_one({"id": doc_id}, {"$set": {field: path, "original_filename": file.filename}})
    return await db.documents.find_one({"id": doc_id}, NO_ID)


@api.delete("/admin/documents/{doc_id}")
async def delete_document(doc_id: str, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    await db.documents.update_one({"id": doc_id}, {"$set": {"is_deleted": True, "is_active": False}})
    return {"ok": True}


def crud_routes(name: str, collection: str, model):
    @api.post(f"/admin/{name}", name=f"create_{name}")
    async def create_item(payload: model, x_admin_token: Optional[str] = Header(None)):  # type: ignore
        require_admin(x_admin_token)
        doc = payload.model_dump()
        doc.update({"id": str(uuid.uuid4()), "created_at": now_iso()})
        await db[collection].insert_one(dict(doc))
        doc.pop("_id", None)
        return doc

    @api.put(f"/admin/{name}/{{item_id}}", name=f"update_{name}")
    async def update_item(item_id: str, payload: model, x_admin_token: Optional[str] = Header(None)):  # type: ignore
        require_admin(x_admin_token)
        await db[collection].update_one({"id": item_id}, {"$set": payload.model_dump()})
        return await db[collection].find_one({"id": item_id}, NO_ID)

    @api.delete(f"/admin/{name}/{{item_id}}", name=f"delete_{name}")
    async def delete_item(item_id: str, x_admin_token: Optional[str] = Header(None)):
        require_admin(x_admin_token)
        await db[collection].delete_one({"id": item_id})
        return {"ok": True}


crud_routes("packages", "packages", PackageIn)
crud_routes("testimonials", "testimonials", TestimonialIn)
crud_routes("faq", "faq", FaqIn)
crud_routes("videos", "videos", VideoIn)


@api.post("/admin/packages/{pkg_id}/feature")
async def feature_package(pkg_id: str, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    pkg = await db.packages.find_one({"id": pkg_id})
    if not pkg:
        raise HTTPException(status_code=404, detail="Paket nije nađen")
    new_val = not pkg.get("featured", False)
    await db.packages.update_one({"id": pkg_id}, {"$set": {
        "featured": new_val, "badge": "Paket meseca" if new_val else None}})
    return await db.packages.find_one({"id": pkg_id}, NO_ID)


@api.post("/admin/videos/{video_id}/free")
async def toggle_free_video(video_id: str, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    v = await db.videos.find_one({"id": video_id})
    if not v:
        raise HTTPException(status_code=404, detail="Lekcija nije nađena")
    await db.videos.update_one({"id": video_id}, {"$set": {"is_free": not v.get("is_free", False)}})
    return await db.videos.find_one({"id": video_id}, NO_ID)


@api.post("/admin/videos/bulk-urls")
async def bulk_video_urls(payload: VideoBulkUrls, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    for item in payload.items:
        await db.videos.update_one({"id": item.id}, {"$set": {"url": item.url.strip()}})
    return {"updated": len(payload.items)}


@api.post("/admin/videos/bulk-create")
async def bulk_create_videos(payload: VideoBulkCreate, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    start = await db.videos.count_documents({})
    docs = []
    for i, raw in enumerate(payload.lines.splitlines()):
        line = raw.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split("|")]
        title = parts[0]
        url = parts[1] if len(parts) > 1 else ""
        docs.append({"id": str(uuid.uuid4()), "title": title, "url": url,
                     "package": payload.package, "order": start + i, "created_at": now_iso()})
    if docs:
        await db.videos.insert_many(docs)
    return {"created": len(docs)}


@api.get("/admin/bookings")
async def admin_bookings(x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    return await db.bookings.find({}, NO_ID).sort("created_at", -1).to_list(1000)


@api.put("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, payload: StatusIn, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    rec = await db.bookings.find_one({"id": booking_id})
    if not rec:
        raise HTTPException(status_code=404, detail="Rezervacija nije nađena")
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": payload.status}})
    if payload.status in ("potvrdjeno", "otkazano") and rec.get("email"):
        heading = "Termin je potvrđen" if payload.status == "potvrdjeno" else "Termin je otkazan"
        intro = ("Tvoj termin je potvrđen. Vidimo se na času!" if payload.status == "potvrdjeno"
                 else "Nažalost, izabrani termin je otkazan. Javi se da nađemo novi termin.")
        await send_email(to=rec["email"], subject=heading,
                         html=render_template(heading=heading, intro=intro,
                                              rows=[("Ime", rec["name"]),
                                                    ("Termin", f"{rec['slot_date']} u {rec['slot_time']}")]))
    return await db.bookings.find_one({"id": booking_id}, NO_ID)


@api.delete("/admin/bookings/{booking_id}")
async def admin_delete_booking(booking_id: str, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    await db.bookings.delete_one({"id": booking_id})
    return {"ok": True}


@api.post("/admin/slots/block")
async def block_slot(payload: SlotAction, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    await db.blocked_slots.update_one(payload.model_dump(), {"$set": {**payload.model_dump(), "id": str(uuid.uuid4())}},
                                      upsert=True)
    return {"ok": True}


@api.post("/admin/slots/unblock")
async def unblock_slot(payload: SlotAction, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    await db.blocked_slots.delete_many(payload.model_dump())
    return {"ok": True}


@api.get("/admin/consultations")
async def admin_consultations(x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    return await db.consultations.find({}, NO_ID).sort("created_at", -1).to_list(1000)


@api.put("/admin/consultations/{item_id}")
async def admin_update_consultation(item_id: str, payload: StatusIn, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    await db.consultations.update_one({"id": item_id}, {"$set": {"status": payload.status}})
    return await db.consultations.find_one({"id": item_id}, NO_ID)


@api.delete("/admin/consultations/{item_id}")
async def admin_delete_consultation(item_id: str, x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    await db.consultations.delete_one({"id": item_id})
    return {"ok": True}


@api.get("/admin/leads")
async def admin_leads(x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    return await db.leads.find({}, NO_ID).sort("created_at", -1).to_list(2000)


@api.get("/admin/messages")
async def admin_messages(x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    return await db.messages.find({}, NO_ID).sort("created_at", -1).to_list(1000)


@api.get("/admin/documents")
async def admin_documents(x_admin_token: Optional[str] = Header(None)):
    require_admin(x_admin_token)
    return await db.documents.find({"is_deleted": False}, NO_ID).sort("created_at", -1).to_list(500)


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
