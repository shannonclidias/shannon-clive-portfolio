import os
from PIL import Image

OUT_DIR = os.path.join("assets", "images")
os.makedirs(OUT_DIR, exist_ok=True)

# Mapping of original source photos to clean descriptive names
PHOTO_MAP = {
    "photos/s.jpg": "about-shannon.jpg",
    "photos/MyC-1.jpg": "beach-1.jpg",
    "photos/MyC-2.jpg": "beach-2.jpg",
    "photos/MyC-3.jpg": "beach-3.jpg",
    "photos/MyC-4.jpg": "beach-4.jpg",
    "photos/MyC-5.jpg": "beach-5.jpg",
    "photos/MyC-6.jpg": "beach-6.jpg",
    "photos/zyair (1).JPG": "studio-zyair-1.jpg",
    "photos/zyair (2).JPG": "studio-zyair-2.jpg",
    "photos/zyair (3).JPG": "studio-zyair-3.jpg",
    "photos/zyair (4).JPG": "studio-zyair-4.jpg",
    "photos/DSC07171.JPG": "event-mom-son.jpg",
    "photos/DSC07116.JPG": "event-cake.jpg",
    "photos/clive-studios-11.jpg": "wedding-motorcycle.jpg",
    "photos/DSC06984.JPG": "wedding-flatlay.jpg",
}

MAX_DIM = 1800
QUALITY = 88

print("--- Optimizing master photos ---")
for src, dest_name in PHOTO_MAP.items():
    if os.path.exists(src):
        dest_path = os.path.join(OUT_DIR, dest_name)
        with Image.open(src) as img:
            img = img.convert("RGB")
            # calculate resize maintaining aspect ratio
            w, h = img.size
            if max(w, h) > MAX_DIM:
                scale = MAX_DIM / max(w, h)
                new_size = (int(w * scale), int(h * scale))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            img.save(dest_path, "JPEG", quality=QUALITY, optimize=True)
            orig_mb = os.path.getsize(src) / (1024 * 1024)
            new_kb = os.path.getsize(dest_path) / 1024
            print(f"[OK] {src} ({orig_mb:.1f} MB) -> {dest_name} ({new_kb:.0f} KB, {img.size})")

print("\n--- Extracting special slide assets ---")
# 1. Contact Portrait from reference sheet (9).png
if os.path.exists("reference sheet (9).png"):
    with Image.open("reference sheet (9).png") as im9:
        im9 = im9.convert("RGB")
        # bounds: (33, 26, 387, 455)
        portrait = im9.crop((33, 26, 387, 455))
        portrait_path = os.path.join(OUT_DIR, "contact-portrait.jpg")
        portrait.save(portrait_path, "JPEG", quality=92, optimize=True)
        print(f"[OK] Extracted contact-portrait.jpg: {portrait.size}")

# 2. Hero filmstrip graphic from reference sheet (1).png
if os.path.exists("reference sheet (1).png"):
    with Image.open("reference sheet (1).png") as im1:
        im1 = im1.convert("RGB")
        # Center photo region
        filmstrip = im1.crop((164, 80, 646, 368))
        film_path = os.path.join(OUT_DIR, "hero-filmstrip.jpg")
        filmstrip.save(film_path, "JPEG", quality=92, optimize=True)
        print(f"[OK] Extracted hero-filmstrip.jpg: {filmstrip.size}")

print("\nAll media optimization complete!")
