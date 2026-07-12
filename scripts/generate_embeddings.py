"""
generate_embeddings.py
Embeds character bios with MiniLM, computes cosine similarity,
projects to 3D with UMAP, and outputs web/public/graph.json.

Run: python scripts/generate_embeddings.py
Requires: pip install sentence-transformers scikit-learn umap-learn numpy
"""
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import umap
import os

TOP_K = 6
SIM_THRESHOLD = 0.35

SERIES_COLORS = {
    "Naruto": "#ff6b35",
    "Attack on Titan": "#c0392b",
    "Death Note": "#8e44ad",
    "Fullmetal Alchemist: Brotherhood": "#e67e22",
    "One Piece": "#1e90ff",
    "Hunter x Hunter (2011)": "#2ecc71",
    "Kimetsu no Yaiba": "#e74c3c",
    "Jujutsu Kaisen": "#9b59b6",
    "Cowboy Bebop": "#f39c12",
    "Steins;Gate": "#00bcd4",
    "Bleach": "#95a5a6",
    "Boku no Hero Academia": "#3498db",
    "Berserk": "#2c3e50",
    "Monster": "#27ae60",
    "Re:Zero kara Hajimeru Isekai Seikatsu": "#1abc9c",
    "Sword Art Online": "#16a085",
    "Neon Genesis Evangelion": "#d35400",
    "Vinland Saga": "#795548",
    "Code Geass: Hangyaku no Lelouch": "#e91e63",
    "Chainsaw Man": "#ff1744",
}


def main():
    with open("data/raw/characters.json", encoding="utf-8") as f:
        chars = json.load(f)

    chars = [c for c in chars if c.get("bio") and len(c["bio"]) > 40]
    print(f"Embedding {len(chars)} characters...")

    texts = [
        f"{c['name']}. From: {', '.join(c['appears_in'])}. Role: {c.get('role', '')}. {c['bio']}"
        for c in chars
    ]

    print("Loading all-MiniLM-L6-v2...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)

    print("Projecting to 3D with UMAP...")
    reducer = umap.UMAP(n_components=3, random_state=42, metric="cosine", n_neighbors=15, min_dist=0.1)
    coords = reducer.fit_transform(embeddings) * 80

    print("Computing similarity edges...")
    sim_matrix = cosine_similarity(embeddings)

    nodes, edges, seen = [], [], set()

    for i, c in enumerate(chars):
        series = c["appears_in"][0]
        nodes.append({
            "id": c["id"],
            "name": c["name"],
            "group": series,
            "color": SERIES_COLORS.get(series, "#ffffff"),
            "img": c.get("image"),
            "bio": c["bio"][:300],
            "role": c.get("role"),
            "favorites": c.get("favorites", 0),
            "x": float(coords[i][0]),
            "y": float(coords[i][1]),
            "z": float(coords[i][2]),
        })
        for j in np.argsort(-sim_matrix[i])[1:TOP_K + 1]:
            val = float(sim_matrix[i][j])
            if val < SIM_THRESHOLD:
                continue
            key = tuple(sorted([c["id"], chars[j]["id"]]))
            if key in seen:
                continue
            seen.add(key)
            edges.append({"source": c["id"], "target": chars[j]["id"], "value": round(val, 4)})

    os.makedirs("web/public", exist_ok=True)
    with open("web/public/graph.json", "w", encoding="utf-8") as f:
        json.dump({"nodes": nodes, "links": edges}, f, ensure_ascii=False)

    print(f"\n✅ graph.json: {len(nodes)} nodes, {len(edges)} edges")


if __name__ == "__main__":
    main()
