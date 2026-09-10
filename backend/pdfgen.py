"""Minimalni generator placeholder PDF dokumenata (bez eksternih zavisnosti)."""


def _esc(t: str) -> str:
    return t.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def make_pdf(pages: list[list[str]]) -> bytes:
    objects = []
    n_pages = len(pages)
    page_ids = [4 + i * 2 for i in range(n_pages)]

    objects.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects.append(f"2 0 obj\n<< /Type /Pages /Kids [{kids}] /Count {n_pages} >>\nendobj\n")
    objects.append("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    for i, lines in enumerate(pages):
        pid = page_ids[i]
        cid = pid + 1
        content_lines = ["BT /F1 14 Tf 60 760 Td 20 TL"]
        for ln in lines:
            content_lines.append(f"({_esc(ln)}) Tj T*")
        content_lines.append("ET")
        stream = "\n".join(content_lines)
        objects.append(
            f"{pid} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 3 0 R >> >> /Contents {cid} 0 R >>\nendobj\n"
        )
        objects.append(f"{cid} 0 obj\n<< /Length {len(stream)} >>\nstream\n{stream}\nendstream\nendobj\n")

    out = "%PDF-1.4\n"
    offsets = []
    for obj in objects:
        offsets.append(len(out))
        out += obj
    xref_pos = len(out)
    count = len(objects) + 1
    out += f"xref\n0 {count}\n0000000000 65535 f \n"
    for off in offsets:
        out += f"{off:010d} 00000 n \n"
    out += f"trailer\n<< /Size {count} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n"
    return out.encode("latin-1", "replace")


def placeholder_pages(title: str, count: int) -> list[list[str]]:
    pages = []
    for i in range(1, count + 1):
        pages.append([
            "ANDRI-TIM edukacioni centar",
            "Andriana Grozdanovic, dipl. ecc.",
            "",
            title,
            f"Strana {i} od {count}",
            "",
            "Ovo je privremeni (placeholder) dokument.",
            "Pravi materijal bice zamenjen kroz admin panel.",
            "",
            "-----------------------------------------",
            "Primer sadrzaja: bilans stanja, bilans uspeha,",
            "kontni okvir, knjizenja, zadaci sa resenjima.",
        ])
    return pages
