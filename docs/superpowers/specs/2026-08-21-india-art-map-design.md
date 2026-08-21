# Interactive Digital Map of Indian Art History — Design Spec

Date: 2026-08-21
Status: Approved for implementation

## Purpose

A digital-museum web app: users explore a map of India, click regional
markers, and learn the art movement, artists, artworks, and historical
context tied to that place. Geography is the narrative device — it should
feel like walking through a museum organized by region, not like a generic
map mashup.

## Scope (v1)

14 locations, exactly as specified by the user:

Ajanta & Ellora (Maharashtra), Shantiniketan (West Bengal), Kolkata — Bengal
School (West Bengal), Madhubani (Bihar), Jaipur/Udaipur — Rajasthani
Miniature (Rajasthan), Khajuraho (Madhya Pradesh), Hampi (Karnataka),
Thanjavur (Tamil Nadu), Mahabalipuram (Tamil Nadu), Kerala Mural Art
(Kerala), Odisha — Pattachitra (Odisha), Gujarat folk art (Gujarat), Warli
region (Maharashtra), Hyderabad — Deccani Art (Telangana).

Categories (6, fixed set): Classical Art, Folk Art, Miniature Painting,
Temple Art, Modern Indian Art, Tribal Art.

Periods (8, fixed set, used by the timeline): Ancient, Medieval, Mughal,
Regional Traditions, Colonial, Bengal School, Modern, Contemporary. Each
location tags one or more periods it belongs to (e.g. Jaipur spans Mughal +
Regional Traditions).

Out of scope for v1: user accounts, backend/API, CMS, real photography
(placeholders now, see below), non-Indian content.

## Approach

**Stack:** React + Vite, react-leaflet/Leaflet for the map, plain CSS with
a design-token system (no Tailwind — utility-default styling reads
"generic," and the spec explicitly warns against that). Framer Motion for
panel/marker transitions (small, well-justified dependency for the
"museum" feel — no heavier animation lib needed).

**State:** local React state/context only. ~14 static records, no backend,
no need for Redux/Zustand — would be overkill (Simplicity First).

**Data:** one JSON file (`src/data/locations.json`) is the source of truth;
adding a location later means appending one object, no code changes. Small
JS modules for the fixed category and period definitions
(`src/data/categories.js`, `src/data/periods.js`).

**Map base layer:** CartoDB Positron (light, muted, no API key) rather
than default OSM tiles — a loud default basemap fights the custom markers
and panel for attention. Map bounds constrained to India so it doesn't
feel like "Google Maps you can pan away from."

**Markers:** one simple monoline SVG icon per category, colored by
category, rendered as Leaflet divIcons (not the default blue pin) —
this is the main lever for "doesn't look like a generic map project."

**Images:** per your answer, no real photos in v1. Each location gets a
tasteful generated placeholder (CSS gradient + a category motif icon) in
the gallery grid, and the data model carries an `images: []` field
(caption + alt text now, `src` left for later) so real images can be
dropped in later with no component changes.

**Content:** historical context, artists, artworks, and significance text
for all 14 locations, written from general art-history knowledge, kept to
a museum-label length (roughly 2–4 short paragraphs of context + 3–5
bullet artists/artworks per location) rather than exhaustive scholarship.

## Components

```
src/
  main.jsx, App.jsx
  data/
    locations.json       14 location records (see schema below)
    categories.js         6 category defs: {id, label, color, icon}
    periods.js             8 period defs: {id, label, yearRange}
  components/
    MapView/               React-Leaflet map, CategoryMarker, bounds/tiles
    InfoPanel/              slide-in detail panel + Gallery (placeholder grid)
    Timeline/               horizontal period strip, drives period filter
    SearchFilterBar/        text search + category chips (period reuses Timeline)
    Header/                 title, tagline, museum branding
  hooks/
    useFilteredLocations.js  combines search text + category + period state
  styles/
    tokens.css              color/type/spacing custom properties
    global.css
```

### Location record schema

```json
{
  "id": "ajanta-ellora",
  "name": "Ajanta & Ellora Caves",
  "state": "Maharashtra",
  "coordinates": [20.5522, 75.7033],
  "category": "temple-art",
  "tradition": "Ancient Buddhist & Rock-Cut Art",
  "periodIds": ["ancient"],
  "periodLabel": "2nd century BCE – 6th century CE",
  "historicalContext": "…",
  "artForms": ["Buddhist murals", "Cave architecture", "Sculptures"],
  "artists": [{ "name": "…", "note": "…" }],
  "artworks": [{ "title": "…", "note": "…" }],
  "significance": "…",
  "images": [{ "caption": "…", "alt": "…" }]
}
```

## Interaction flow

1. App loads a full-bleed map of India (Header overlays top, Timeline
   strip + SearchFilterBar overlay bottom/top depending on viewport) with
   14 category-colored markers.
2. Click a marker → InfoPanel slides in (side panel on desktop, bottom
   sheet on mobile) with the sections from the spec: name/state/tradition
   header, Historical Context, Art Forms, Period, Artists, Artworks,
   Significance, image-placeholder gallery. Map keeps the clicked marker
   highlighted; clicking elsewhere or a close button dismisses the panel.
3. Timeline: clicking a period pill filters markers to locations whose
   `periodIds` includes it (multi-select toggle, "All" resets).
4. SearchFilterBar: free-text search matches name/state/tradition/artist
   name; category chips filter by category. Search, category, and period
   filters combine with AND logic. No results → empty state message, not
   a blank map.
5. Responsive: <768px collapses filters into a drawer, InfoPanel becomes a
   bottom sheet, Timeline becomes horizontally scrollable.

## Error handling

All data is static/bundled — no network calls, so no loading/error states
for data fetching. The only runtime edge cases: no-search-results (empty
state in the filter bar) and marker click on a filtered-out location
(not reachable, since filtered markers aren't rendered).

## Testing

No backend/business logic heavy enough to warrant a test framework for a
static content site. Verification is manual: run the Vite dev server,
click every marker, exercise search/filter/timeline combinations, and
check the mobile breakpoint — per this project's UI-verification norm.

## Explicit decisions from clarification

- Images: placeholders now, `images[]` field ready for real photos later.
- Styling: custom CSS with design tokens, not Tailwind.
- Scope: exactly the 14 listed locations for v1.
- Content: written from general knowledge, museum-label depth.
