# os-anime

An interactive 3D constellation of anime/manga characters, connected by AI-computed
semantic similarity. Graph edges are discovered from character bios via embeddings,
not hand-authored — so unexpected cross-series parallels surface automatically.

## Live Site
https://likhith083.github.io/os-anime

## How It Works

1. `scripts/fetch_data.py` pulls 300+ characters from 20 anime via the Jikan API (no API key required)
2. `scripts/generate_embeddings.py` embeds bios with MiniLM, computes cosine similarity, projects to 3D with UMAP, and exports `web/public/graph.json`
3. `web/` is a React + react-force-graph-3d (Three.js/WebGL) frontend with live search, genre filter pills, and camera fly-to on click
4. `.github/workflows/deploy.yml` auto-deploys to GitHub Pages on every push to `main`

## Quick Start

```bash
# Install Python dependencies
pip install requests sentence-transformers scikit-learn umap-learn numpy

# Fetch anime and character data from Jikan API (~20 min, rate limited)
python scripts/fetch_data.py

# Generate embeddings, similarity edges, and 3D layout
python scripts/generate_embeddings.py

# Run the frontend locally
cd web && npm install && npm run dev
```

## Deploy

Push to `main` and GitHub Actions builds and publishes `web/dist` to the `gh-pages` branch automatically.
Enable Pages under: **Settings > Pages > Source: gh-pages branch**.

## Project Structure

```
os-anime/
├── scripts/
│   ├── fetch_data.py           # Jikan API scraper
│   └── generate_embeddings.py  # Embeddings + graph builder
├── data/
│   └── sample_graph.json       # Placeholder graph for frontend development
├── web/
│   ├── public/graph.json       # Generated after running scripts
│   ├── src/
│   │   ├── App.jsx             # Main 3D graph component
│   │   ├── Sidebar.jsx         # Character detail panel
│   │   ├── SearchBar.jsx       # Live search with autocomplete
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── .github/workflows/deploy.yml
```

## Roadmap

- [ ] In-browser semantic search via transformers.js
- [ ] Arc-level sub-clustering
- [ ] Bloom/glow post-processing via Three.js EffectComposer
- [ ] Filter panel by genre, era, and studio
- [ ] Character image previews on node hover
