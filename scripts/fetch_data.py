"""
fetch_data.py
Pulls anime + character data from the Jikan API (unofficial MyAnimeList API, no key needed).
Docs: https://docs.api.jikan.moe/

Run: python scripts/fetch_data.py
"""
import requests
import time
import json
import os

BASE = "https://api.jikan.moe/v4"
OUT_DIR = "data/raw"
os.makedirs(OUT_DIR, exist_ok=True)

# Curated MAL anime IDs - varied genres, eras, popularity
# Naruto, AoT, Death Note, FMA:Brotherhood, One Piece, HxH, Demon Slayer,
# Jujutsu Kaisen, Cowboy Bebop, Steins;Gate, Bleach, My Hero Academia,
# Berserk, Monster, Re:Zero, Sword Art Online, Neon Genesis Evangelion,
# Vinland Saga, Code Geass, Chainsaw Man
ANIME_IDS = [
    20, 16498, 1535, 5114, 21, 11061, 38000, 40748,
    1, 9253, 269, 31964, 33, 19, 30276, 11757, 30,
    37521, 1575, 44511
]

SESSION = requests.Session()
SESSION.headers["User-Agent"] = "os-anime-project/1.0"


def get(url, retries=3):
    for attempt in range(retries):
        try:
            r = SESSION.get(url, timeout=15)
            if r.status_code == 429:
                print("  Rate limited, waiting 3s...")
                time.sleep(3)
                continue
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"  Error fetching {url}: {e}")
            time.sleep(2)
    return None


def fetch_anime(anime_id):
    data = get(f"{BASE}/anime/{anime_id}/full")
    return data["data"] if data else None


def fetch_characters(anime_id):
    data = get(f"{BASE}/anime/{anime_id}/characters")
    return data["data"] if data else []


def fetch_character_detail(char_id):
    data = get(f"{BASE}/characters/{char_id}/full")
    return data["data"] if data else None


def main():
    all_anime = []
    all_chars = {}  # keyed by MAL character ID to avoid duplicates

    for aid in ANIME_IDS:
        print(f"\nFetching anime ID {aid}...")
        anime = fetch_anime(aid)
        if not anime:
            continue
        all_anime.append({
            "mal_id": anime["mal_id"],
            "title": anime["title"],
            "title_english": anime.get("title_english"),
            "synopsis": (anime.get("synopsis") or "")[:500],
            "genres": [g["name"] for g in anime.get("genres", [])],
            "themes": [t["name"] for t in anime.get("themes", [])],
            "year": anime.get("year"),
            "score": anime.get("score"),
            "image": anime.get("images", {}).get("jpg", {}).get("image_url"),
        })
        time.sleep(0.8)

        chars = fetch_characters(aid)
        time.sleep(0.8)

        for c in chars[:15]:  # top 15 per show
            cid = c["character"]["mal_id"]
            if cid in all_chars:
                all_chars[cid]["appears_in"].append(anime["title"])
                continue

            print(f"  Fetching character {cid} ({c['character']['name']})...")
            detail = fetch_character_detail(cid)
            time.sleep(0.8)

            if detail:
                all_chars[cid] = {
                    "id": cid,
                    "name": detail.get("name", "Unknown"),
                    "bio": (detail.get("about") or "").replace("\\n", " ")[:1500].strip(),
                    "image": detail.get("images", {}).get("jpg", {}).get("image_url"),
                    "appears_in": [anime["title"]],
                    "role": c.get("role", "Supporting"),
                    "favorites": detail.get("favorites", 0),
                }

    with open(f"{OUT_DIR}/anime.json", "w", encoding="utf-8") as f:
        json.dump(all_anime, f, indent=2, ensure_ascii=False)
    with open(f"{OUT_DIR}/characters.json", "w", encoding="utf-8") as f:
        json.dump(list(all_chars.values()), f, indent=2, ensure_ascii=False)

    print(f"\n✅ Saved {len(all_anime)} anime and {len(all_chars)} characters to {OUT_DIR}/")


if __name__ == "__main__":
    main()
