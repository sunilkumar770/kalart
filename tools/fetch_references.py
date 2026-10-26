#!/usr/bin/env python3
"""KALART — GI craft reference-image sourcing.

Downloads 3-5 real-world photographs per GI-tagged craft (29 crafts of
Telangana / Andhra Pradesh) from Wikimedia Commons to serve as visual
"image prompts / style references" for generative-AI pipelines.

Quality filter:
  * JPG/PNG only (bitmaps; no SVG vectors, no 3D mockups)
  * minimum resolution 600 px on the longest side
  * prefer files whose name/description mentions the craft
Output layout:
  references/{product_slug}/ref_1.jpg ... ref_N.jpg
  references/manifest.json          (provenance + license metadata)

Usage:
  python3 tools/fetch_references.py            # fetch all 29 crafts
  python3 tools/fetch_references.py --slug pochampally-ikat   # one craft
"""
from __future__ import annotations

import argparse
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from gi_arts import GI_ARTS  # noqa: E402

API = "https://commons.wikimedia.org/w/api.php"
UA = "KALART-reference-sourcing/1.0 (design pipeline; contact: dev@kalart.app)"
ROOT = os.path.join(os.path.dirname(__file__), "..", "references")
MIN_PX = 600          # longest-side minimum
TARGET_MIN, TARGET_MAX = 3, 5
EXT_ALLOWED = {"JPEG": "jpg", "PNG": "png"}

# ---------------------------------------------------------------------------
# Curation overrides (senior-designer QA pass).
#   PIN : exact Commons file titles the team approved as style references
#   BAN : keywords for images that matched search but are NOT the craft
#         (stations, forts, landscapes, birds, unrelated persons/places…)
# ---------------------------------------------------------------------------
PINNED: dict[str, list[str]] = {
    "pochampally-ikat": [
        "File:Pochampalli Ikat saree.jpg",
        "File:Traditional ikat style of weaving machine.jpg",
        "File:Traditional waving machine at Pochampally.jpg",
        "File:Hermann Linde - Girl standing in a veranda wearing a Pochampalli sari (ca.1895).jpg",
        "File:Asu machine.jpg",
    ],
    "sircilla-koya": [
        "File:Saree Weaving by Handloom.jpg",
        "File:Saree Weaving by Handloom 2.jpg",
        "File:Saree Weaving by Handloom 3.jpg",
        "File:KTR observing Handloom Work.jpg",
    ],
    "nirmal-toys": [
        "File:Nirmal wooden Toys 01.jpg",
        "File:Nirmal wooden Toys 02.jpg",
        "File:Nirmal wooden Toys 03.jpg",
        "File:Making Nirmal Toys1.jpg",
        "File:Nirmal Handicrafts Shop.jpg",
    ],
    "bidri-metalware": [
        "File:Bidriware (Bidri craft) ewer (also lid jug) 17th century, Hyderabad Deccan. now in Victoria & Albert Museum.jpg",
        "File:Bidri ware art in craft museum.JPG",
        "File:Spittoon (ugaldan) a Bidri ware, Hyderabad, India.jpg",
        "File:Bidri ware, Albert Hall Museum.jpg",
        "File:Bidri-ware tray inlaid with silver - IMJ 84.70.132.jpg",
    ],
    "hjam-haram": [
        "File:A Dhokra cast being made by a Dharua tribal woman.jpg",
        "File:Aesthetics of Dokra.jpg",
        "File:Dokra products involve a tedious process of designing and metal casting.jpg",
        "File:Dokra from tribes of Bastar DSCN1172 01.jpg",
        "File:Dokra from tribes of Bastar DSCN1172 02.jpg",
    ],
    "dharmavaram-pattu": [
        "File:మగ్గం నేస్తున్న మహిళ. IMG 20200126 145718-01.jpg",
        "File:Saree Weaving by Handloom.jpg",
        "File:Saree Weaving by Handloom 2.jpg",
        "File:Saree Weaving by Handloom 3.jpg",
        "File:A man weaving the famous handloom Chanderi Saree.jpg",
    ],
    "puttapaka-kalamkari": [
        "File:Kalamkari painting.jpg",
        "File:Kalamkari Painting.JPG",
        "File:Kalamkari painting in progress.jpg",
        "File:Dashavatara de kalamkari, British Museum.jpg",
        "File:Kalamkari design -.jpg",
    ],
    "sholapur-phulkari": [
        "File:Close-up of contemporary Phulkari embroidery technique .jpg",
        "File:Hand embroidered Phulkari from Punjab, 2015.jpg",
        "File:Phulkari from Punjab, India, 20th century, khadi, silk, plain weave, embroidery.jpg",
        "File:Contemporary Phulkari embroidery in Rajpura in Patiala district, Punjab.jpg",
    ],
    "mangalagiri-fabric": [
        "File:Mangalagiri Sarees.jpg",
        "File:Saree Weaving by Handloom.jpg",
        "File:Saree Weaving by Handloom 2.jpg",
        "File:Saree Weaving by Handloom 3.jpg",
    ],
    "venkatagiri-fabric": [
        "File:Saree Weaving by Handloom.jpg",
        "File:Saree Weaving by Handloom 2.jpg",
        "File:Saree Weaving by Handloom 3.jpg",
        "File:Handloom silk saree weaving in Arani,Tamilnadu.png",
        "File:Weaver making saree Bishnupur.JPG",
    ],
    "narayanpet-textile": [
        "File:Saree Weaving by Handloom.jpg",
        "File:Saree Weaving by Handloom 2.jpg",
        "File:Saree Weaving by Handloom 3.jpg",
        "File:Cotton-mulmul-saree-with-blouse-5-1.jpg",
        "File:Border of Tangail sari,from the 1970s.jpg",
    ],
    "gajnuma-jewellery": [
        "File:Hyderabad Pearls with semi precious stone.jpg",
        "File:Hyderabad Pearls with semi precious stones.jpg",
        "File:Necklace, Thanjavur, Tamil Nadu, India, 1800s AD, gold, pearl, diamonds, rubies, emeralds.jpg",
        "File:Square Bejewelled Armbands.jpg",
        "File:Silver Dogri Jhumka with glass, possibly late 19th-early 20th century, Bilaspur.jpg",
    ],
    "pokkal-dollu": [
        "File:Broom of Jhojhri Grass.jpg",
        "File:Broom made of Daab Grass.jpg",
        "File:Broom Made of Seniya Grass.jpg",
        "File:First step involved in broom making.jpg",
        "File:Craft of Broom Making.jpg",
    ],
    "machilipatnam-kalamkari": [
        "File:KALAMKARI HAND PAINTED CLOTH SRIKALAHASTI AP - panoramio.jpg",
        "File:Kalamkari.jpg",
        "File:Kalamkari Art.jpg",
        "File:Kalamkari at its best.jpg",
        "File:Dashavatara de kalamkari, British Museum.jpg",
    ],
    "srikalahasti-kalamkari": [
        "File:KALAMKARI HAND PAINTED CLOTH SRIKALAHASTI AP - panoramio.jpg",
        "File:Kalamkari painting of Lord Vishnu on serpent Ananta.jpg",
        "File:Kalamkari painting.jpg",
        "File:Kalamkari Painting.JPG",
        "File:Dashavatara de kalamkari, British Museum.jpg",
    ],
    "monsoon-hemp-craft": [
        "File:Rai women weaving cloth from Allo Nettle fibres.jpg",
        "File:Hill Hemp Bendy (6207981383).jpg",
        "File:Mrs. Captain Schooner spinning nettle fibre (55730).jpg",
        "File:Captain Schooner, and Mrs. Schooner making nettle fibre (55705).jpg",
    ],
    "cheriyal-scroll-painting": [
        "File:Cheriyal painting - toddy tappers.jpg",
        "File:Cherial 1.jpg",
        "File:Cherial 2.jpg",
        "File:Cherial 3.jpg",
        "File:Cherial 4.jpg",
        "File:Cherial 5.jpg",
        "File:Cheriyal Dolls -1.jpg",
        "File:Cheriyal Dolls-2.jpg",
    ],
    "kondapalli-bommalu": [],   # handled by keyword search (already accurate)
    "etikoppaka-toys": [
        "File:Etikoppaka Lakka Bommalu.jpg",
        "File:Colorful wooden toys workshop in Sawantwadi.jpg",
        "File:The hand-painted colorful wooden dolls from Sawantwadi.jpg",
        "File:Wooden toy-making workshop, Sawantwadi, Maharashtra.jpg",
        "File:Toy painting section, Sawantwadi, Maharashtra.jpg",
    ],
    "silver-filigree-karimnagar": [],
    "dumka-weaving": [
        "File:Dhokra item Raodeo.jpg",
        "File:Dhokra items at MAP.jpg",
        "File:Dhokra art with clay.jpg",
        "File:Dhokra figurines by Dharua women of Odisha.jpg",
        "File:Final Dhokra Product after 3 - 5 week journey.jpg",
        "File:Dhokra weaves.jpg",
    ],
    "panchala-toy": [
        "File:Clay Toys IMG20241112123910.jpg",
        "File:Terracotta of Asharikandi (Hatima Doll).jpg",
        "File:Hatima Putul Traditional Terracotta Doll from Asharikandi Village Dhubri Assam 01.jpg",
        "File:Hatima Putul Traditional Terracotta Doll from Asharikandi Village Dhubri Assam 02.jpg",
        "File:Terracotta animal figurine at Odisha Crafts Museum, Bhubaneswar, Odisha, India.jpg",
        "File:Toy Vases of Terracotta-1-Govt Museum-egmore-chennai-India.jpg",
    ],
    "vijayawada-lace": [
        "File:Handmade lace at Maison Pickery, Bruges.jpg",
        "File:Etole en Blonde blanche XIXe s. Musée de la dentelle Chantilly.jpg",
        "File:Volant en Chantilly noire, XIXe s., Musée de la Dentelle de Chantilly.jpg",
        "File:Mundillo pillow.jpg",
        "File:Bobbin lace making of Slovakia.jpg",
    ],
    "banarasi-weaving-suravali": [
        "File:Crafting Tradition The Art of Weaving at Mirpur Banarasi Palli.jpg",
        "File:Banarasi Silk Saree.jpg",
        "File:Alkama Ansari - A Banarasi Saree Weaver.jpg",
        "File:Crape silk fabric Banarasi work bandhani saree.jpg",
        "File:Banaras weavers from handloom Bharatsthali looms.jpg",
    ],
    "visakhapatrayaniya-saree": [
        "File:Banda Tribae of odisha ( saree making ).jpg",
        "File:Saree Weaving by Handloom.jpg",
        "File:Saree Weaving by Handloom 2.jpg",
        "File:Santal woman in a traditional saree.jpg",
        "File:Tribal Festive Attire of Indian Folk Dancers.jpg",
    ],
    "vinukonda-yerpadu-turi-dhandiki": [
        "File:Wooden mortar and pestle.jpg",
        "File:Kundi-danda (mortar and pestle) 2.jpg",
        "File:Wooden Pestle Karnataka 01.jpg",
        "File:Wooden Pestle Karnataka 02.jpg",
        "File:Wooden Pestle Karnataka 03.jpg",
    ],
    "simhachalam-namasavali": [
        "File:BAMBOO CRAFT PURULIA WEST BENGAL IMG 0256.jpg",
        "File:Bamboo Craft 4.jpg",
        "File:Bamboo crafting man.jpg",
        "File:Chhabda or tokri (bamboo basket).jpg",
        "File:Traditional Himalayan bamboo basket ((छर्ड)),2.jpg",
    ],
    "pedana-woodwork-vadrang": [
        "File:Channapatna toys artists.jpg",
        "File:Channapatna-toys.jpg",
        "File:Channapatna artist coloring toy.jpg",
        "File:Finished Channapatna toys.jpg",
        "File:Channapatna artists making toys 2.jpg",
    ],
    "rajahmundry-wood-carving": [
        "File:Floral Carving in wood atSanganateswara Temple.jpg",
        "File:Wood carving detail2 - Vishnu Mohini.jpg",
        "File:Door of Carved Sandal Wood From Travancore.jpg",
        "File:Wooden Panel at Zainul Folk and Craft Museum (3).jpg",
        "File:Craft in wooden door.jpg",
    ],
}

# Substrings that mark an off-topic match regardless of search score.
BANNED = [
    "railway", "station", " fort", "mosque", "church", "bird", "sunbird",
    "biryani", "map", "montage", "bridge", "standbeeld", "karikatuur",
    "portret", "revenue division", "constituenc", "press conference",
    "schaepman", "japigia", "rally basilicata", "budynok", "crocifissione",
    "megalithic", "geograph.org", "myojin", "eden", "pagoda", "chainsaw",
    "confessional", "sunset over", "lighthouse", "baldachin", "basilica",
    "hungary", "esztergom", "wellcome", "concert", "poster advertisement",
    "logo", "album cover", "slipknot", "barnstar", "mineral wool",
    "rock wool", "girardinia", "urtica", "caterpillar", "crab spider",
    "nettle tree", "stinging nettle", "hemp field", "tripleurospermum",
    "imperial valley", "plastic vs hemp", "tuba container", "cotton field",
    "picking cotton", "cotton market", "bishop cotton boys", "ganesh mess",
    "sheep rearing", "old age home", "panchayat office", "folk dance",
    "signature bridge", "cheruvu", "marketyard", "cureus", "korbflechter",
    "doha", "luang", "heuan chan", "sonargaon", "zainul", "bodysuit",
    "sewing-trim", "mirror-white", "dress, wedding", "drawstring reticule",
    "nepali bride", "inde bondo", "safavid", "umatilla", "lee moorhouse",
    "olertis", "\uacbd0\ub09c", "hindu bride", "t\u2019nalak", "sudaw",
    "kosmogram", "playing cards", "navagunjara", "lakshmi narasimha temple",
    "gajam anjaiah", "lac du bourget", "hanf-banderole", "dauphinois",
    "touring club italiano", "cretaceous", "cypro-archaic", "corinth",
    "kremlin", "novgorod", "museum of moscow", "met dp", "dp-1372",
    "philippines", "west africa", "granville island", "banavasi", "bekhli",
    "vazhappally", "mahadeva", "rameshwaram", "lion ride", "lion carving",
    "goddess lion", "doorcarvingskalaseswara", "faculty of arts",
    "mount koya", "ippen shonin", "madonna", "painting of saint",
    "portrait of mrs", "parchment", "purse", "sticks for bobbin",
    "ipswich", "smithsonian", "on display at dilli haat", "munshi ghat",
    "scindia ghat", "ahilyabai ghat", "town.jpg", "waterfall", "airport",
    "locomotive", "bus stand", "hill station", "sugar", "factory",
    "green peas", "varanasi green", "swamy temple", "veeranjaneya",
    "vegetables", "ganesh wholesale", "night market", "judenboykott",
    "boycott", "nazi", "anti-semitic", "ivory jewellery box",
    "rajmahal hemp - unknown", "book scan", "engraving of",
    "history of lace", "14761945621", "being sold at",
]



def api_get(params: dict) -> dict:
    params = dict(params, format="json", action="query")
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.load(r)


def search_images(query: str, limit: int = 12) -> list[dict]:
    """Return [{title, url, thumb, width, height, mime}] for bitmap files.

    Commons full-text search is strict: over-specified queries return zero
    results, so we retry with progressively relaxed variants of the query.
    """
    variants = [f"filetype:bitmap {query}"]
    words = query.split()
    if len(words) > 2:
        variants.append("filetype:bitmap " + " ".join(words[:2]))
    if len(words) > 1:
        variants.append("filetype:bitmap " + words[0])
    out = []
    data = {}
    for v in variants:
        try:
            data = api_get({
                "generator": "search",
                "gsrsearch": v,
                "gsrlimit": limit,
                "gsrnamespace": 6,
                "prop": "imageinfo",
                "iiprop": "url|size|mime|extmetadata",
            })
        except Exception as e:  # network hiccup — try next variant
            print(f"    ! search failed ({e})", file=sys.stderr)
            continue
        if (data.get("query") or {}).get("pages"):
            break
    pages = (data.get("query") or {}).get("pages") or {}
    for p in sorted(pages.values(), key=lambda x: x.get("index", 99)):
        ii = (p.get("imageinfo") or [{}])[0]
        if not ii:
            continue
        out.append({
            "title": p.get("title", ""),
            "url": ii.get("url", ""),
            "width": ii.get("width", 0),
            "height": ii.get("height", 0),
            "mime": ii.get("mime", ""),
            "license": (ii.get("extmetadata") or {}).get("LicenseShortName", {}).get("value", ""),
            "artist": (ii.get("extmetadata") or {}).get("Artist", {}).get("value", ""),
        })
    return out


def score(item: dict, slug_words: set[str]) -> float:
    """Prefer photos (not diagrams/maps/stamps), decent size, topical match."""
    t = item["title"].lower()
    s = 0.0
    if any(bad in t for bad in ("map", "diagram", "logo", "chart", "icon", "flag",
                               "locator", "stamp", "postcard", "cover")):
        s -= 8
    if any(good in t for good in ("sari", "fabric", "textile", "toy", "painting", "jewel",
                                  "craft", "weave", "pottery", "carving", "close", "texture")):
        s += 1
    toks = set(t.replace(".", " ").replace("_", " ").split())
    if slug_words & toks:
        s += 3
    # reward tokens from the craft's own search queries (e.g. "kalamkari")
    qwords = {w for w in t.split() if len(w) > 4}
    s += min(2, len(qwords & toks))
    long_side = max(item["width"], item["height"])
    if long_side < MIN_PX:
        return -999  # hard reject: below quality floor
    if long_side >= 1200:
        s += 2
    return s


def download(res: dict, dest_dir: str, idx: int) -> dict | None:
    """Download original, validate it is a real JPG/PNG photo, save ref_N.ext."""
    url = res["url"]
    mime_ok = res["mime"] in ("image/jpeg", "image/png")
    ext_ok = url.lower().endswith((".jpg", ".jpeg", ".png")) or "?" in url
    if not (mime_ok and ext_ok):
        return None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            blob = r.read()
        probe = Image.open(io.BytesIO(blob))
        probe.verify()
        fmt = Image.open(io.BytesIO(blob)).format
    except Exception:
        return None
    if fmt not in EXT_ALLOWED:
        return None
    img = Image.open(io.BytesIO(blob))
    if max(img.size) < MIN_PX:
        return None
    # re-encode to striputm params / exotic PNG variants; keep true bitmap photos
    fname = f"ref_{idx}.{EXT_ALLOWED[fmt]}"
    out_path = os.path.join(dest_dir, fname)
    conv = img.convert("RGB") if fmt == "JPEG" else img.convert("RGBA")
    conv.save(out_path, quality=90)
    return {
        "file": fname,
        "source_title": res["title"],
        "source_url": url,
        "width": img.width,
        "height": img.height,
        "license": res.get("license", ""),
    }


def title_to_res(title: str) -> dict | None:
    """Resolve an exact Commons File: title to its imageinfo record."""
    try:
        data = api_get({
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata",
        })
    except Exception as e:
        print(f"    ! resolve failed ({e})", file=sys.stderr)
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        if ii and "missing" not in p:
            em = ii.get("extmetadata") or {}
            return {
                "title": p.get("title", title),
                "url": ii.get("url", ""),
                "width": ii.get("width", 0),
                "height": ii.get("height", 0),
                "mime": ii.get("mime", ""),
                "license": em.get("LicenseShortName", {}).get("value", ""),
                "artist": em.get("Artist", {}).get("value", ""),
            }
    return None


def banned(t: str) -> bool:
    t = " " + t.lower() + " "
    return any(b in t for b in BANNED)


def fetch_craft(slug: str, name: str, state: str, queries: list[str], force: bool) -> dict:
    dest = os.path.join(ROOT, slug)
    os.makedirs(dest, exist_ok=True)
    existing = [f for f in os.listdir(dest) if f.startswith("ref_")]
    entry = {"name": name, "state": state, "queries": queries, "images": []}
    if existing and not force:
        entry["images"] = sorted(existing)
        print(f"  = {slug}: already has {len(existing)} refs, skipping")
        return entry

    candidates: list[dict] = []
    seen_titles: set[str] = set()

    # 1) curated pins first (exact files approved in the QA pass)
    for t in PINNED.get(slug, []):
        res = title_to_res(t)
        if res and res["title"] not in seen_titles:
            seen_titles.add(res["title"])
            candidates.append(res)
        time.sleep(0.15)

    # 2) then keyword-search results, minus banned off-topic matches
    slug_words = {w for w in slug.replace("-", " ").split() if len(w) > 3}
    pool: list[dict] = []
    for q in queries:
        for item in search_images(q, limit=20):
            if item["title"] not in seen_titles and not banned(item["title"]):
                seen_titles.add(item["title"])
                pool.append(item)
        time.sleep(0.3)
    pool.sort(key=lambda x: score(x, slug_words), reverse=True)
    candidates.extend(p for p in pool if score(p, slug_words) > 0)

    idx = 1
    for res in candidates:
        if idx > TARGET_MAX:
            break
        meta = download(res, dest, idx)
        if meta:
            entry["images"].append(meta)
            print(f"  + {slug}/{meta['file']}  <- {res['title'][:70]}")
            idx += 1
        time.sleep(0.2)
    if idx - 1 < TARGET_MIN:
        print(f"  ~ {slug}: only {idx-1} qualifying images found")
    return entry


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", help="fetch a single craft by slug")
    ap.add_argument("--force", action="store_true", help="re-download even if refs exist")
    args = ap.parse_args()

    os.makedirs(ROOT, exist_ok=True)
    manifest_path = os.path.join(ROOT, "manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        manifest = json.load(open(manifest_path))

    todo = [g for g in GI_ARTS if (not args.slug) or g[0] == args.slug]
    for slug, name, state, queries in todo:
        print(f"[{slug}] {name} ({state})")
        manifest[slug] = fetch_craft(slug, name, state, queries, args.force)
        json.dump(manifest, open(manifest_path, "w"), indent=2, ensure_ascii=False)

    total = sum(len(v["images"]) for v in manifest.values())
    ok = sum(1 for v in manifest.values() if len(v["images"]) >= TARGET_MIN)
    print(f"\nDone. {ok}/{len(GI_ARTS)} crafts have >= {TARGET_MIN} refs; {total} images total.")
    print("Manifest:", manifest_path)


if __name__ == "__main__":
    main()
