import os
import io
import uuid
from datetime import date, timedelta

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://study-ua-accounting.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "andriana123"


@pytest.fixture(scope="session")
def s():
    session = requests.Session()
    return session


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"X-Admin-Token": admin_token}


# ---- Public GETs ----
class TestPublicGets:
    def test_settings(self, s):
        r = s.get(f"{API}/settings")
        assert r.status_code == 200
        d = r.json()
        assert d.get("phone") and d.get("email")
        assert isinstance(d.get("hero_slides"), list) and len(d["hero_slides"]) >= 1

    def test_packages(self, s):
        r = s.get(f"{API}/packages")
        assert r.status_code == 200
        pkgs = r.json()
        assert len(pkgs) >= 8
        assert any(p.get("featured") for p in pkgs)

    def test_documents(self, s):
        r = s.get(f"{API}/documents")
        assert r.status_code == 200
        docs = r.json()
        assert len(docs) >= 3
        assert all("storage_path" not in d for d in docs)

    def test_testimonials(self, s):
        r = s.get(f"{API}/testimonials")
        assert r.status_code == 200 and len(r.json()) >= 5

    def test_faq(self, s):
        r = s.get(f"{API}/faq")
        assert r.status_code == 200 and len(r.json()) >= 6

    def test_videos(self, s):
        r = s.get(f"{API}/videos")
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_slots(self, s):
        r = s.get(f"{API}/slots", params={"week_start": date.today().isoformat()})
        assert r.status_code == 200
        d = r.json()
        # Mon-Sat only, no Sunday
        assert len(d["week"]) == 6, f"expected 6 days, got {len(d['week'])}"
        weekdays = [date.fromisoformat(x).weekday() for x in d["week"]]
        assert weekdays == [0, 1, 2, 3, 4, 5]
        # 14:00-19:00 hourly = 6 hours
        assert d["hours"] == ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]
        assert len(d["slots"]) == 6 * 6 == 36

    def test_videos_seed_free_and_count(self, s):
        r = s.get(f"{API}/videos")
        assert r.status_code == 200
        vids = r.json()
        assert len(vids) == 40, f"expected 40 seeded lessons, got {len(vids)}"
        assert all(v.get("package") for v in vids), "all videos should have package"
        free = [v for v in vids if v.get("is_free")]
        titles = {v["title"] for v in free}
        assert titles == {
            "Kontni okvir i logika knjiženja",
            "Uvod u upravljačko računovodstvo",
            "Prag rentabilnosti (break-even)",
        }, f"unexpected free titles: {titles}"


# ---- Free-video admin toggle & bulk urls ----
class TestVideoFreeAndBulk:
    def test_toggle_free_and_bulk_url(self, s, admin_headers):
        vids = s.get(f"{API}/videos").json()
        # pick a non-free lesson
        target = next(v for v in vids if not v.get("is_free"))
        vid = target["id"]
        # toggle to free
        r = s.post(f"{API}/admin/videos/{vid}/free", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["is_free"] is True
        # toggle back
        r = s.post(f"{API}/admin/videos/{vid}/free", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["is_free"] is False

        # bulk url update
        test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        r = s.post(f"{API}/admin/videos/bulk-urls",
                   json={"items": [{"id": vid, "url": test_url}]}, headers=admin_headers)
        assert r.status_code == 200 and r.json()["updated"] == 1
        # verify persisted
        vids2 = s.get(f"{API}/videos").json()
        got = next(v for v in vids2 if v["id"] == vid)
        assert got["url"] == test_url
        # cleanup - clear
        s.post(f"{API}/admin/videos/bulk-urls",
               json={"items": [{"id": vid, "url": ""}]}, headers=admin_headers)


# ---- Consultations, Contact ----
class TestForms:
    def test_consultation(self, s):
        payload = {"name": "TEST_Kandidat", "contact": "064/000-00-00",
                   "email": "test_consult@example.com", "subject": "Paket za ispit", "message": "TEST"}
        r = s.post(f"{API}/consultations", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] and d["status"] == "na cekanju"

    def test_contact(self, s):
        r = s.post(f"{API}/contact", json={"name": "TEST_C", "email": "t@t.com", "message": "hi TEST"})
        assert r.status_code == 200
        assert r.json()["id"]


# ---- Bookings + slot state ----
class TestBookings:
    def test_booking_flow_and_duplicate(self, s):
        # pick a free slot
        week = (date.today() + timedelta(days=14)).isoformat()
        r = s.get(f"{API}/slots", params={"week_start": week})
        slots = r.json()["slots"]
        free = next(x for x in slots if x["state"] == "slobodno")
        payload = {"name": "TEST_Ucenik", "grade": "3", "phone": "060",
                   "slot_date": free["slot_date"], "slot_time": free["slot_time"]}
        r1 = s.post(f"{API}/bookings", json=payload)
        assert r1.status_code == 200, r1.text
        # duplicate
        r2 = s.post(f"{API}/bookings", json=payload)
        assert r2.status_code == 400
        # verify slot na cekanju
        r3 = s.get(f"{API}/slots", params={"week_start": week})
        this = next(x for x in r3.json()["slots"]
                    if x["slot_date"] == free["slot_date"] and x["slot_time"] == free["slot_time"])
        assert this["state"] == "na cekanju"
        # store for downstream
        pytest.booking_id = r1.json()["id"]
        pytest.booked_slot = free


# ---- Leads ----
class TestLeads:
    def test_lead_download(self, s):
        r = s.post(f"{API}/leads", json={"name": "TEST_Lead", "email": "lead_test@example.com"})
        assert r.status_code == 200, r.text
        url = r.json()["download_url"]
        assert url.startswith("/api/files/")
        r2 = s.get(f"{BASE_URL}{url}")
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("application/pdf")


# ---- Document preview ----
class TestDocPreview:
    def test_skripta_preview(self, s):
        docs = s.get(f"{API}/documents").json()
        skripta = next(d for d in docs if d["category"] == "skripta")
        r = s.get(f"{API}/documents/{skripta['id']}/preview")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")


# ---- Admin auth ----
class TestAdminAuth:
    def test_wrong_password(self, s):
        r = s.post(f"{API}/admin/login", json={"password": "wrong"})
        assert r.status_code == 401

    def test_admin_endpoint_requires_header(self, s):
        r = s.get(f"{API}/admin/bookings")
        assert r.status_code == 401

    def test_admin_verify(self, s, admin_headers):
        r = s.get(f"{API}/admin/verify", headers=admin_headers)
        assert r.status_code == 200


# ---- Admin CRUD ----
class TestAdminCRUD:
    def test_packages_crud_and_feature(self, s, admin_headers):
        payload = {"name": "TEST_Paket", "price": "1 din", "features": ["a"], "group": "Skripte", "order": 99}
        r = s.post(f"{API}/admin/packages", json=payload, headers=admin_headers)
        assert r.status_code == 200
        pkg = r.json()
        pid = pkg["id"]
        # update
        payload["name"] = "TEST_Paket_upd"
        r = s.put(f"{API}/admin/packages/{pid}", json=payload, headers=admin_headers)
        assert r.status_code == 200 and r.json()["name"] == "TEST_Paket_upd"
        # feature toggle
        r = s.post(f"{API}/admin/packages/{pid}/feature", headers=admin_headers)
        assert r.status_code == 200 and r.json()["featured"] is True
        r = s.post(f"{API}/admin/packages/{pid}/feature", headers=admin_headers)
        assert r.json()["featured"] is False
        # delete
        r = s.delete(f"{API}/admin/packages/{pid}", headers=admin_headers)
        assert r.status_code == 200

    def test_testimonials_crud(self, s, admin_headers):
        r = s.post(f"{API}/admin/testimonials",
                   json={"name": "TEST_T", "text": "ok"}, headers=admin_headers)
        assert r.status_code == 200
        tid = r.json()["id"]
        r = s.delete(f"{API}/admin/testimonials/{tid}", headers=admin_headers)
        assert r.status_code == 200

    def test_faq_crud(self, s, admin_headers):
        r = s.post(f"{API}/admin/faq", json={"question": "TEST_Q", "answer": "A"}, headers=admin_headers)
        assert r.status_code == 200
        fid = r.json()["id"]
        r = s.delete(f"{API}/admin/faq/{fid}", headers=admin_headers)
        assert r.status_code == 200

    def test_videos_crud(self, s, admin_headers):
        r = s.post(f"{API}/admin/videos",
                   json={"title": "TEST_V", "url": "https://youtu.be/x"}, headers=admin_headers)
        assert r.status_code == 200
        vid = r.json()["id"]
        r = s.delete(f"{API}/admin/videos/{vid}", headers=admin_headers)
        assert r.status_code == 200


# ---- Admin settings ----
class TestAdminSettings:
    def test_update_and_read(self, s, admin_headers):
        original = s.get(f"{API}/settings").json()
        new_phone = "064/999-99-99"
        r = s.put(f"{API}/admin/settings",
                  json={"phone": new_phone, "email": original["email"], "instagram": original["instagram"]},
                  headers=admin_headers)
        assert r.status_code == 200
        assert s.get(f"{API}/settings").json()["phone"] == new_phone
        # restore
        s.put(f"{API}/admin/settings", json={"phone": original["phone"]}, headers=admin_headers)


# ---- Admin documents ----
class TestAdminDocs:
    def _make_pdf(self):
        return (b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n")

    def test_doc_lifecycle(self, s, admin_headers):
        files = {"file": ("t.pdf", self._make_pdf(), "application/pdf")}
        data = {"title": "TEST_Doc", "category": "skripta", "group": "Test", "price": "1 din"}
        r = s.post(f"{API}/admin/documents", files=files, data=data, headers=admin_headers)
        assert r.status_code == 200, r.text
        did = r.json()["id"]
        # replace
        files = {"file": ("t2.pdf", self._make_pdf(), "application/pdf")}
        r = s.post(f"{API}/admin/documents/{did}/replace",
                   files=files, data={"target": "full"}, headers=admin_headers)
        assert r.status_code == 200
        # toggle is_active
        r = s.put(f"{API}/admin/documents/{did}", json={"is_active": False}, headers=admin_headers)
        assert r.status_code == 200 and r.json()["is_active"] is False
        # delete - should soft delete
        r = s.delete(f"{API}/admin/documents/{did}", headers=admin_headers)
        assert r.status_code == 200
        # verify not in public list
        pub = s.get(f"{API}/documents").json()
        assert not any(d["id"] == did for d in pub)


# ---- Slot block/unblock ----
class TestAdminSlots:
    def test_block_unblock(self, s, admin_headers):
        week = (date.today() + timedelta(days=21)).isoformat()
        slots = s.get(f"{API}/slots", params={"week_start": week}).json()["slots"]
        free = next(x for x in slots if x["state"] == "slobodno")
        payload = {"slot_date": free["slot_date"], "slot_time": free["slot_time"]}
        r = s.post(f"{API}/admin/slots/block", json=payload, headers=admin_headers)
        assert r.status_code == 200
        slots2 = s.get(f"{API}/slots", params={"week_start": week}).json()["slots"]
        this = next(x for x in slots2 if x["slot_date"] == payload["slot_date"] and x["slot_time"] == payload["slot_time"])
        assert this["state"] == "zatvoreno"
        r = s.post(f"{API}/admin/slots/unblock", json=payload, headers=admin_headers)
        assert r.status_code == 200
        slots3 = s.get(f"{API}/slots", params={"week_start": week}).json()["slots"]
        this = next(x for x in slots3 if x["slot_date"] == payload["slot_date"] and x["slot_time"] == payload["slot_time"])
        assert this["state"] == "slobodno"


# ---- Admin bookings/consultations ----
class TestAdminBookings:
    def test_lists_and_confirm(self, s, admin_headers):
        r = s.get(f"{API}/admin/bookings", headers=admin_headers)
        assert r.status_code == 200
        bookings = r.json()
        r = s.get(f"{API}/admin/consultations", headers=admin_headers)
        assert r.status_code == 200

        # find a na cekanju booking
        target = next((b for b in bookings if b.get("status") == "na cekanju"), None)
        if not target:
            pytest.skip("No pending booking to confirm")
        r = s.put(f"{API}/admin/bookings/{target['id']}",
                  json={"status": "potvrdjeno"}, headers=admin_headers)
        assert r.status_code == 200
        # slot should be zauzeto
        week = target["slot_date"]
        slots = s.get(f"{API}/slots", params={"week_start": week}).json()["slots"]
        this = next(x for x in slots
                    if x["slot_date"] == target["slot_date"] and x["slot_time"] == target["slot_time"])
        assert this["state"] == "zauzeto"
        # cleanup - delete booking
        s.delete(f"{API}/admin/bookings/{target['id']}", headers=admin_headers)
