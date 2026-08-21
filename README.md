# Rang Bhoomi — An Interactive Map of Indian Art History

A digital-museum web app: explore India on a map, click a region, and learn
its art movement, artists, artworks, and historical context.

## Run locally

```
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Project structure

- `src/data/` — content: `locations.json` (14 locations), `categories.js`,
  `periods.js`. Add a new location by appending one object to
  `locations.json` following the existing schema — no code changes needed.
- `src/components/MapView/` — the Leaflet map and category marker icons.
  The basemap switcher offers Paper, Terrain, and Satellite views; the
  selected view stays available while any historical period is filtered.
- `src/components/InfoPanel/` — the slide-in/bottom-sheet detail panel and
  image gallery (placeholder tiles until real photography is added — see
  `images[]` in the location schema).
- `src/components/SearchFilterBar/` — text search + category filter chips.
- `src/components/Timeline/` — historical period filter strip.
- `src/hooks/useFilteredLocations.js` — combines search/category/period
  filters into the list `MapView` renders.
- `src/styles/tokens.css` — the design-token palette/type/spacing scale
  every component's CSS draws from.

## Design spec

See `docs/superpowers/specs/2026-08-21-india-art-map-design.md` for the
full design rationale.
