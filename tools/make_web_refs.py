#!/usr/bin/env python3
"""Compress /references master images into web-optimized public/references.

Master files (references/{slug}/ref_N.jpg) stay untouched for the AI pipeline.
Web copies are max 1200px wide, JPEG q78 progressive -> public/references/.
Also writes public/references/index.json for the gallery page.
"""
import json
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "references")
DST = os.path.join(ROOT, "public", "references")
MAX_W = 1200

manifest_path = os.path.join(SRC, "manifest.json")
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}

index = {}
total_bytes = 0
for slug in sorted(os.listdir(SRC)):
    d = os.path.join(SRC, slug)
    if not os.path.isdir(d):
        continue
    outdir = os.path.join(DST, slug)
    os.makedirs(outdir, exist_ok=True)
    imgs = []
    for f in sorted(os.listdir(d)):
        if not f.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        src_p = os.path.join(d, f)
        dst_name = os.path.splitext(f)[0] + ".jpg"
        dst_p = os.path.join(outdir, dst_name)
        with Image.open(src_p) as im:
            im = im.convert("RGB")
            if im.width > MAX_W:
                im = im.resize((MAX_W, round(im.height * MAX_W / im.width)),
                               Image.LANCZOS)
            im.save(dst_p, "JPEG", quality=78, optimize=True, progressive=True)
        total_bytes += os.path.getsize(dst_p)
        entry = {"file": f"/references/{slug}/{dst_name}"}
        m = manifest.get(slug) if isinstance(manifest, dict) else None
        if isinstance(m, dict):
            entry["name"] = m.get("name", slug.replace("-", " ").title())
            entry["state"] = m.get("state", "")
            for s in m.get("images", []):
                if isinstance(s, dict) and s.get("file") == f:
                    u = (s.get("source_url") or "").split("?")[0]
                    if "/commons/" in u:
                        fname = u.rsplit("/", 1)[-1]
                        entry["source"] = ("https://commons.wikimedia.org/wiki/File:"
                                           + fname.replace("_", " "))
                    entry["license"] = s.get("license", "")
                    break
        imgs.append(entry)
    if imgs:
        index[slug] = imgs

os.makedirs(DST, exist_ok=True)
with open(os.path.join(DST, "index.json"), "w") as fh:
    json.dump(index, fh, indent=2)
print(f"Wrote {len(index)} slugs, {sum(len(v) for v in index.values())} web images, "
      f"{total_bytes/1e6:.1f} MB total -> public/references/")
