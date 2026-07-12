# os-anime

An interactive 3D "constellation" of anime/manga characters, connected by AI-computed
semantic similarity — inspired by [withmarble.com/curriculum](https://withmarble.com/curriculum),
but graph edges are *discovered* from character bios via embeddings, not hand-authored.

## Live Demo
https://likhith083.github.io/os-anime

## How It Works
1. `scripts/fetch_data.py` — pulls 300+ characters from 20 anime via the Jikan API (no key needed)
2. `scripts/generate_embeddings.py` — embeds bios with MiniLM, computes cosine similarity, projects to 3D with UMAP, exports `web/public/graph.json`
3. `web/` — React + react-force-graph-3d (Three.js/WebGL) frontend with live search, genre colors, camera fly-to
4. `.github/workflows/deploy.yml` — auto-deploys to GitHub Pages on every push to `main`

## Quick Start
```bash
pip install requests sentence-transformers scikit-learn umap-learn numpy
python scripts/fetch_data.py
python scripts/generate_embeddings.py
cd web && npm install && npm run dev
```

## Deploy
Push to `main` — GitHub Actions builds and publishes `web/dist` to the `gh-pages` branch automatically.
Then enable Pages in: **Settings → Pages → Source: gh-pages branch**.

## Project Structure
```
os-anime/
├── scripts/
│   ├── fetch_data.py           # Jikan API scraper
│   └── generate_embeddings.py  # Embeddings + graph builder
├── data/
│   └── sample_graph.json       # Placeholder for frontend dev
├── web/
│   ├── public/graph.json       # Generated (after running scripts)
│   ├── src/
│   │   ├── App.jsx             # Main 3D graph component
│   │   ├── Sidebar.jsx         # Character detail panel
│   │   ├── SearchBar.jsx       # Live search overlay
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── .github/workflows/deploy.yml
```

## Roadmap
- [ ] True in-browser semantic search via `transformers.js`
- [ ] Arc-level sub-clustering
- [ ] Bloom/glow post-processing via Three.js EffectComposer
- [ ] Filter panel by genre, era, show
- [ ] Character image previews on hover
