# Interactive Digital Map of Indian Art History — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Vite single-page app showing an interactive Leaflet map of India where clicking one of 14 category-colored markers opens a museum-style detail panel about that location's art history, with search, category filters, and a period timeline.

**Architecture:** Fully static, client-only React app. One JSON file is the content source of truth; small JS modules define the fixed category/period taxonomies; a single `useFilteredLocations` hook combines search/category/period state; presentational components (MapView, InfoPanel, Timeline, SearchFilterBar) read from that hook via props/context. No backend, no build-time data fetching.

**Tech Stack:** React 18, Vite, react-leaflet + leaflet, Framer Motion (panel/marker transitions only), plain CSS with a design-token file (no CSS framework).

**Spec:** [docs/superpowers/specs/2026-08-21-india-art-map-design.md](../specs/2026-08-21-india-art-map-design.md)

## Global Constraints

- No Tailwind — plain CSS with `src/styles/tokens.css` custom properties.
- No real photography in v1 — `images[]` entries carry `caption`/`alt` only; gallery renders a CSS placeholder per entry.
- Exactly the 14 locations named in the spec — no more, no fewer, for v1.
- No automated test framework (per spec: static content, no business logic worth testing). Every task's verification step is a manual dev-server/browser check instead of a unit test — run `npm run dev` and confirm the described behavior, per this project's UI-verification norm.
- Map base layer: CartoDB Positron tiles (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`), no API key required, attribution required (CARTO + OpenStreetMap contributors).
- Category ids: `classical-art`, `folk-art`, `miniature-painting`, `temple-art`, `modern-art`, `tribal-art`.
- Period ids (ordered): `ancient`, `medieval`, `mughal`, `regional`, `colonial`, `bengal-school`, `modern`, `contemporary`.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`
- Create: `src/main.jsx`, `src/App.jsx`
- Create: `.gitignore`

**Interfaces:**
- Produces: a running Vite dev server on `npm run dev`; `<div id="root">` in `index.html` that `main.jsx` mounts into; `App` component (currently a stub) that later tasks extend.

- [ ] **Step 1: Scaffold the Vite React app into a temp directory, then copy it into place**

The project directory already contains `docs/` and `.git/`, and `npm create vite` prompts interactively when the target directory isn't empty — that prompt would hang a non-interactive shell. Avoid it by scaffolding into a fresh, empty subdirectory, then copying the generated files (including dotfiles) into the project root without touching `docs/` or `.git/`:

```bash
npm create vite@latest .vite-scaffold-tmp -- --template react
cp -r .vite-scaffold-tmp/. .
rm -rf .vite-scaffold-tmp
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install react-leaflet leaflet framer-motion
```

- [ ] **Step 3: Add `.gitignore` entries**

Vite's scaffold creates a `.gitignore` already covering `node_modules` and `dist`. Open it and confirm those two lines exist; if not, add them. Also add a `.superpowers/` line (a scratch directory used by the development tooling that drives this build — it must never be committed):

```
node_modules
dist
.superpowers/
```

- [ ] **Step 4: Replace the default `index.html` head with project title + Google Fonts**

Edit `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rang Bhoomi — A Digital Map of Indian Art History</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Strip the default `App.jsx` to a stub**

Edit `src/App.jsx`:

```jsx
function App() {
  return (
    <div className="app">
      <h1>Rang Bhoomi</h1>
    </div>
  );
}

export default App;
```

Delete `src/App.css` and `src/assets/react.svg` (default Vite starter assets, unused).

- [ ] **Step 6: Verify the dev server runs**

Run: `npm run dev`

Expected: terminal prints a local URL (e.g. `http://localhost:5173`); loading it in a browser shows an "Rang Bhoomi" heading with no console errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Scaffold Vite React app with map/animation dependencies"
```

---

## Task 2: Design Tokens & Global Styles

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Modify: `src/main.jsx` (import the two new stylesheets)

**Interfaces:**
- Produces: CSS custom properties (`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`) that every later component's CSS relies on by name.

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  /* Colors — warm parchment + terracotta palette */
  --color-bg: #faf3e8;
  --color-surface: #ffffff;
  --color-surface-alt: #f3e8d6;
  --color-ink: #2b2118;
  --color-ink-soft: #5a4a3a;
  --color-ink-faint: #8a7862;
  --color-border: #e4d5bf;
  --color-accent: #b5432c;
  --color-accent-soft: #d97a5f;
  --color-gold: #a6791f;
  --color-overlay: rgba(43, 33, 24, 0.55);

  /* Category colors */
  --color-classical-art: #a6432c;
  --color-folk-art: #c77c1f;
  --color-miniature-painting: #5b3a8e;
  --color-temple-art: #8a6d1b;
  --color-modern-art: #1f6f6f;
  --color-tribal-art: #7a8b3c;

  /* Typography */
  --font-display: "Playfair Display", Georgia, serif;
  --font-body: "Work Sans", "Segoe UI", sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;
  --text-3xl: 2.75rem;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Radius & shadow */
  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 20px;
  --shadow-panel: 0 12px 40px rgba(43, 33, 24, 0.18);
  --shadow-card: 0 4px 16px rgba(43, 33, 24, 0.12);
}
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  font-family: var(--font-body);
  color: var(--color-ink);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-display);
  margin: 0;
  line-height: 1.2;
}

p {
  margin: 0 0 var(--space-3) 0;
  line-height: 1.6;
}

button {
  font-family: inherit;
  cursor: pointer;
}

.app {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 3: Import both stylesheets in `src/main.jsx`**

Edit `src/main.jsx` so the imports read:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/global.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: Verify**

Run: `npm run dev` (if not already running, restart it)

Expected: page background is warm parchment (`#faf3e8`), the "Rang Bhoomi" heading renders in a serif display font (Playfair Display), no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles src/main.jsx
git commit -m "Add design token system and global styles"
```

---

## Task 3: Category & Period Data Modules

**Files:**
- Create: `src/data/categories.js`
- Create: `src/data/periods.js`

**Interfaces:**
- Produces: `CATEGORIES` (array of `{id, label, color, iconId}`) and `getCategory(id)` from `categories.js`; `PERIODS` (array of `{id, label, yearRange}`) and `getPeriod(id)` from `periods.js`. Later tasks (markers, filters, timeline, info panel) import these by name.

- [ ] **Step 1: Write `src/data/categories.js`**

```js
export const CATEGORIES = [
  {
    id: "classical-art",
    label: "Classical Art",
    color: "var(--color-classical-art)",
    iconId: "lotus",
  },
  {
    id: "folk-art",
    label: "Folk Art",
    color: "var(--color-folk-art)",
    iconId: "sunburst",
  },
  {
    id: "miniature-painting",
    label: "Miniature Painting",
    color: "var(--color-miniature-painting)",
    iconId: "frame",
  },
  {
    id: "temple-art",
    label: "Temple Art",
    color: "var(--color-temple-art)",
    iconId: "shikhara",
  },
  {
    id: "modern-art",
    label: "Modern Indian Art",
    color: "var(--color-modern-art)",
    iconId: "brushstroke",
  },
  {
    id: "tribal-art",
    label: "Tribal Art",
    color: "var(--color-tribal-art)",
    iconId: "triangle-motif",
  },
];

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id);
}
```

- [ ] **Step 2: Write `src/data/periods.js`**

```js
export const PERIODS = [
  { id: "ancient", label: "Ancient India", yearRange: "c. 2500 BCE – 600 CE" },
  { id: "medieval", label: "Medieval India", yearRange: "c. 600 – 1200 CE" },
  { id: "mughal", label: "Mughal Period", yearRange: "1526 – 1857 CE" },
  {
    id: "regional",
    label: "Regional Art Traditions",
    yearRange: "c. 1600 – 1850 CE",
  },
  { id: "colonial", label: "Colonial Period", yearRange: "1757 – 1947 CE" },
  {
    id: "bengal-school",
    label: "Bengal School",
    yearRange: "c. 1900 – 1940s",
  },
  { id: "modern", label: "Modern Indian Art", yearRange: "1940s – 1980s" },
  {
    id: "contemporary",
    label: "Contemporary Art",
    yearRange: "1980s – Present",
  },
];

export function getPeriod(id) {
  return PERIODS.find((period) => period.id === id);
}
```

- [ ] **Step 3: Verify with a temporary console check**

Run: `node -e "import('./src/data/categories.js').then(m => console.log(m.CATEGORIES.length, m.getCategory('folk-art')))"`

Expected: prints `6 { id: 'folk-art', ... }` with no errors. (This uses Node's native ESM loader; the project's `"type": "module"` setting from the Vite scaffold makes this work without extra config.)

- [ ] **Step 4: Commit**

```bash
git add src/data/categories.js src/data/periods.js
git commit -m "Add category and period taxonomy data"
```

---

## Task 4: Locations Data

**Files:**
- Create: `src/data/locations.json`

**Interfaces:**
- Produces: `locations.json`, an array of 14 objects matching the schema below. Every field is consumed by name in later tasks (MapView reads `coordinates`/`category`; InfoPanel reads every other field).

Schema per record:
```
{
  id: string (kebab-case, unique)
  name: string
  state: string
  coordinates: [lat, lng]
  category: one of the 6 category ids from Task 3
  tradition: string (short subtitle)
  periodIds: string[] (period ids from Task 3)
  periodLabel: string (human-readable period range for this location)
  historicalContext: string (2-4 sentences)
  artForms: string[]
  artists: [{ name: string, note: string }]   // name may be a community/collective, not always a person
  artworks: [{ title: string, note: string }]
  significance: string (1-2 sentences)
  images: [{ caption: string, alt: string }]  // no `src` yet — placeholders render from category color
}
```

- [ ] **Step 1: Write `src/data/locations.json`**

```json
[
  {
    "id": "ajanta-ellora",
    "name": "Ajanta & Ellora Caves",
    "state": "Maharashtra",
    "coordinates": [20.5522, 75.7033],
    "category": "temple-art",
    "tradition": "Ancient Buddhist & Rock-Cut Art",
    "periodIds": ["ancient", "medieval"],
    "periodLabel": "2nd century BCE – 10th century CE",
    "historicalContext": "Carved into a horseshoe-shaped cliff above the Waghora river, the Ajanta caves were excavated in two main phases (2nd century BCE and 5th–6th century CE) as Buddhist monastic retreats. Nearby Ellora, cut between the 6th and 10th centuries CE, houses Buddhist, Hindu, and Jain shrines side by side — a rare record of religious coexistence. Both sites were abandoned and reclaimed by jungle for centuries before British officers rediscovered them in 1819.",
    "artForms": ["Buddhist cave murals", "Rock-cut monastic architecture", "Narrative relief sculpture"],
    "artists": [{ "name": "Anonymous monastic and guild artisans", "note": "No individual painters or sculptors are named in surviving records; work was produced collectively over centuries." }],
    "artworks": [
      { "title": "The Bodhisattva Padmapani, Cave 1", "note": "Ajanta's most reproduced mural, prized for its serene expression and fluid line." },
      { "title": "Kailasa Temple, Ellora (Cave 16)", "note": "A full temple carved downward from a single rock face — the largest monolithic structure in the world." },
      { "title": "Jataka tale murals, Cave 17", "note": "Painted narrative cycles depicting the Buddha's past lives, used to teach as much as to decorate." }
    ],
    "significance": "Ajanta and Ellora anchor the entire timeline of Indian art before the medieval period — nearly every later painting and temple-carving tradition on this map traces some lineage back to techniques first perfected here.",
    "images": [
      { "caption": "Padmapani mural, Cave 1, Ajanta", "alt": "Placeholder for the Bodhisattva Padmapani mural" },
      { "caption": "Kailasa Temple, Ellora", "alt": "Placeholder for the rock-cut Kailasa Temple" }
    ]
  },
  {
    "id": "shantiniketan",
    "name": "Shantiniketan",
    "state": "West Bengal",
    "coordinates": [23.6833, 87.6833],
    "category": "modern-art",
    "tradition": "Contextual Modernism",
    "periodIds": ["bengal-school", "modern"],
    "periodLabel": "1901 – 1950s",
    "historicalContext": "Founded by Rabindranath Tagore in 1901 as an experimental school and later Visva-Bharati University, Shantiniketan rejected the academic, European-style training taught in colonial art schools. Tagore and his nephew Abanindranath Tagore encouraged students to draw on rural Bengali life, nature, and pan-Asian aesthetics instead. Nandalal Bose built its Kala Bhavana art faculty into the most influential art school of early 20th-century India.",
    "artForms": ["Contextual Modernism", "Mural and fresco painting", "Sculpture in terracotta and cement"],
    "artists": [
      { "name": "Nandalal Bose", "note": "Kala Bhavana's principal; blended Indian folk idioms with modernist composition." },
      { "name": "Benode Behari Mukherjee", "note": "Muralist known for the Hindi Bhavan frescoes, made largely after losing his sight." },
      { "name": "Ramkinkar Baij", "note": "Pioneered public outdoor sculpture in India using local laterite and cement." }
    ],
    "artworks": [
      { "title": "Santal Family (Ramkinkar Baij)", "note": "A landmark cement sculpture treating tribal subjects with modernist monumentality." },
      { "title": "Lives of the Medieval Saints (Benode Behari Mukherjee)", "note": "Fresco cycle at Hindi Bhavan, Shantiniketan." }
    ],
    "significance": "Shantiniketan trained the generation of artists who defined what 'modern Indian art' could look like without simply copying European modernism.",
    "images": [
      { "caption": "Santal Family, Ramkinkar Baij", "alt": "Placeholder for the Santal Family sculpture" }
    ]
  },
  {
    "id": "kolkata-bengal-school",
    "name": "Kolkata — Bengal School of Art",
    "state": "West Bengal",
    "coordinates": [22.5726, 88.3639],
    "category": "modern-art",
    "tradition": "Bengal School (Nationalist Revivalism)",
    "periodIds": ["bengal-school"],
    "periodLabel": "c. 1905 – 1940s",
    "historicalContext": "In reaction to the Company School and academic realism taught at the Government College of Art, Abanindranath Tagore founded the Bengal School around 1905, drawing on Mughal and Rajput miniatures, Ajanta murals, and wash techniques introduced by visiting Japanese artists. Backed by the Swadeshi movement, it was framed as a nationalist alternative to British art education. The Indian Society of Oriental Art, founded in Kolkata in 1907, became its institutional home.",
    "artForms": ["Wash painting (tempera/watercolor)", "Nationalist historical & mythological painting", "Book and journal illustration"],
    "artists": [
      { "name": "Abanindranath Tagore", "note": "Founder of the movement; taught at the Government College of Art, Calcutta." },
      { "name": "Nandalal Bose", "note": "His student, who later carried the school's ideas to Shantiniketan." },
      { "name": "Gaganendranath Tagore", "note": "Experimented with Cubist-influenced satire alongside the school's wash style." }
    ],
    "artworks": [
      { "title": "Bharat Mata (Abanindranath Tagore, 1905)", "note": "An allegorical portrait of India as a goddess, widely adopted as a nationalist icon." },
      { "title": "The Passing of Shah Jahan", "note": "Wash painting exemplifying the school's Mughal-revival technique." }
    ],
    "significance": "The Bengal School was the first organized modern art movement in India and the direct ancestor of the Shantiniketan style — together they bridge colonial academic painting and post-independence modernism.",
    "images": [
      { "caption": "Bharat Mata, Abanindranath Tagore", "alt": "Placeholder for the Bharat Mata painting" }
    ]
  },
  {
    "id": "madhubani",
    "name": "Madhubani",
    "state": "Bihar",
    "coordinates": [26.3667, 86.0667],
    "category": "folk-art",
    "tradition": "Madhubani (Mithila) Painting",
    "periodIds": ["regional", "contemporary"],
    "periodLabel": "Centuries-old tradition; global recognition from the 1960s",
    "historicalContext": "Madhubani (or Mithila) painting has been made by women in the villages around Madhubani district for generations, traditionally on freshly plastered mud walls and floors for festivals and weddings. It stayed a domestic, undocumented practice until a 1966–67 drought relief effort encouraged artists to transfer it to paper for sale, bringing it to national and international markets almost overnight.",
    "artForms": ["Wall and floor mural painting", "Paper and canvas Mithila painting", "Natural pigment line and pattern work"],
    "artists": [
      { "name": "Sita Devi", "note": "Padma Shri recipient credited with popularizing the bold Bharni fill style." },
      { "name": "Ganga Devi", "note": "Known for the fine-line Kachni style and for depicting personal and historical events." },
      { "name": "Baua Devi", "note": "Leading exponent of the Godna (tattoo-pattern) style." }
    ],
    "artworks": [
      { "title": "Kohbar Ghar murals", "note": "Ritual nuptial-chamber paintings of fertility and union symbols, the tradition's original context." },
      { "title": "My Life with Cancer (Ganga Devi)", "note": "A rare Madhubani work depicting personal autobiography rather than myth." }
    ],
    "significance": "Madhubani is the clearest example of a folk tradition graduating into the fine-art mainstream while staying almost entirely in the hands of the rural women who originated it.",
    "images": [
      { "caption": "Kohbar Ghar ritual mural motif", "alt": "Placeholder for a Kohbar Ghar wedding mural" }
    ]
  },
  {
    "id": "jaipur-udaipur",
    "name": "Jaipur & Udaipur",
    "state": "Rajasthan",
    "coordinates": [26.9124, 75.7873],
    "category": "miniature-painting",
    "tradition": "Rajasthani Miniature Painting",
    "periodIds": ["mughal", "regional"],
    "periodLabel": "16th – 19th century",
    "historicalContext": "As Mughal painting fragmented after the 17th century, Rajput courts across Rajasthan — Mewar (Udaipur), Amber/Jaipur, Bundi, Kishangarh — developed their own miniature schools, trading Mughal naturalism for flatter color, bolder outline, and devotional subject matter drawn from Krishna bhakti poetry and court life.",
    "artForms": ["Miniature painting on paper", "Devotional Krishna-lila illustration", "Court and hunting scene painting"],
    "artists": [
      { "name": "Nihal Chand", "note": "Kishangarh court painter credited with the iconic 'Bani Thani' portrait style." },
      { "name": "Sahibdin", "note": "Leading 17th-century Mewar (Udaipur) court painter of illustrated manuscripts." }
    ],
    "artworks": [
      { "title": "Bani Thani (Nihal Chand, c. 1750)", "note": "An elongated-eyed portrait often called 'India's Mona Lisa'." },
      { "title": "Ragamala paintings", "note": "Series pairing musical modes (ragas) with painted mood and scene, produced across most Rajput courts." }
    ],
    "significance": "The Rajasthani schools kept indigenous painting traditions alive and evolving after Mughal patronage declined, and their color and pattern vocabulary still shapes contemporary Indian textile and graphic design.",
    "images": [
      { "caption": "Bani Thani portrait style", "alt": "Placeholder for a Bani Thani style portrait" }
    ]
  },
  {
    "id": "khajuraho",
    "name": "Khajuraho",
    "state": "Madhya Pradesh",
    "coordinates": [24.8318, 79.9199],
    "category": "temple-art",
    "tradition": "Chandela Temple Sculpture",
    "periodIds": ["medieval"],
    "periodLabel": "950 – 1050 CE",
    "historicalContext": "Built between roughly 950 and 1050 CE by the Chandela dynasty, the Khajuraho temple group originally numbered over 80 sandstone and granite temples, of which 25 survive. They are best known for dense exterior sculpture programs — deities, celestial dancers, and famously explicit erotic friezes — read by scholars as depictions of tantric philosophy and the full range of human experience as a path to the divine.",
    "artForms": ["Nagara-style temple architecture", "High-relief stone sculpture", "Erotic and devotional friezes"],
    "artists": [{ "name": "Anonymous Chandela-era guild sculptors", "note": "No individual sculptors are named in surviving inscriptions." }],
    "artworks": [
      { "title": "Kandariya Mahadeva Temple", "note": "The largest and most refined of the surviving temples, dedicated to Shiva." },
      { "title": "Lakshmana Temple friezes", "note": "Sculptural bands depicting court life, battle, and mithuna (erotic) couples." }
    ],
    "significance": "Khajuraho represents the peak of North Indian temple sculpture, and its frank treatment of the erotic alongside the sacred remains one of the most-discussed statements in Indian art history.",
    "images": [
      { "caption": "Kandariya Mahadeva Temple exterior", "alt": "Placeholder for the Kandariya Mahadeva Temple" }
    ]
  },
  {
    "id": "hampi",
    "name": "Hampi",
    "state": "Karnataka",
    "coordinates": [15.335, 76.46],
    "category": "classical-art",
    "tradition": "Vijayanagara Classical Art",
    "periodIds": ["medieval"],
    "periodLabel": "14th – 16th century CE",
    "historicalContext": "Hampi was the capital of the Vijayanagara Empire, one of medieval South India's largest Hindu kingdoms, at its height in the 15th–16th centuries. Its ruins spread across a boulder-strewn landscape and combine temple complexes, royal enclosures, and market streets, giving an unusually complete picture of a classical South Indian capital before it was sacked in 1565.",
    "artForms": ["Dravidian temple architecture", "Monolithic and relief stone sculpture", "Courtly urban planning"],
    "artists": [{ "name": "Anonymous Vijayanagara court sculptors and architects", "note": "Work was produced under royal and temple patronage rather than individual authorship." }],
    "artworks": [
      { "title": "Vittala Temple's stone chariot and musical pillars", "note": "A shrine built as a stone chariot, with pillars said to ring with musical notes when struck." },
      { "title": "Ugra Narasimha monolith", "note": "A colossal single-block sculpture of Vishnu's lion-man avatar." }
    ],
    "significance": "Hampi shows classical Hindu temple art at imperial scale, and its patronage model — a wealthy trading empire funding monumental religious art — parallels how Mughal and Rajput courts would later fund painting.",
    "images": [
      { "caption": "Vittala Temple stone chariot", "alt": "Placeholder for the Vittala Temple stone chariot" }
    ]
  },
  {
    "id": "thanjavur",
    "name": "Thanjavur",
    "state": "Tamil Nadu",
    "coordinates": [10.787, 79.1378],
    "category": "classical-art",
    "tradition": "Chola Bronzes & Thanjavur Painting",
    "periodIds": ["medieval", "regional"],
    "periodLabel": "9th century CE (Chola bronzes) – 18th–19th century (Thanjavur painting)",
    "historicalContext": "Thanjavur (Tanjore) was the Chola dynasty's capital and, centuries later, a Maratha-ruled court that gave its name to Thanjavur painting — a distinctive 18th–19th century style using gold leaf, gesso relief, and inset gems on wood panels, mostly of Hindu deities. The city's Brihadeeswarar Temple (1010 CE) is also the source of the era's celebrated bronze-casting tradition.",
    "artForms": ["Thanjavur (Tanjore) gold-leaf panel painting", "Chola bronze casting (lost-wax/cire perdue)", "Temple mural painting"],
    "artists": [{ "name": "Chola-era bronze casters and Thanjavur painting workshops", "note": "Bronzes and paintings were overwhelmingly produced by unnamed hereditary guild workshops." }],
    "artworks": [
      { "title": "Nataraja bronzes", "note": "Chola-era lost-wax bronze images of Shiva as the cosmic dancer, among the most copied sculptures in Indian art." },
      { "title": "Krishna as Butter Thief (Tanjore style)", "note": "A stock Thanjavur painting subject rendered in gold relief and glass-inlay." }
    ],
    "significance": "Thanjavur uniquely bridges two eras of Indian classical art: the Chola bronzes that define South Indian sculpture, and the later gem-and-gold painting style that became a template for temple-town devotional art.",
    "images": [
      { "caption": "Nataraja bronze, Chola period", "alt": "Placeholder for a Chola Nataraja bronze" }
    ]
  },
  {
    "id": "mahabalipuram",
    "name": "Mahabalipuram",
    "state": "Tamil Nadu",
    "coordinates": [12.6208, 80.1982],
    "category": "temple-art",
    "tradition": "Pallava Rock-Cut Architecture",
    "periodIds": ["ancient"],
    "periodLabel": "7th – 8th century CE",
    "historicalContext": "A 7th–8th century port town under the Pallava dynasty, Mahabalipuram (Mamallapuram) is an open-air laboratory of early Dravidian architecture: temples carved from single boulders (rathas), relief-carved cave shrines, and the shore-facing Shore Temple built from cut stone rather than excavated rock — an early step toward freestanding temple construction.",
    "artForms": ["Monolithic rock-cut temples (rathas)", "Bas-relief narrative carving", "Early structural (built, not carved) temple architecture"],
    "artists": [{ "name": "Anonymous Pallava court sculptors", "note": "No individual sculptors are named in surviving inscriptions." }],
    "artworks": [
      { "title": "Descent of the Ganges (Arjuna's Penance)", "note": "One of the largest open-air bas-reliefs in the world, carved across two boulders." },
      { "title": "Pancha Rathas", "note": "Five monolithic temples, each carved to imitate a different architectural style, from a single rock outcrop." }
    ],
    "significance": "Mahabalipuram marks the transition from rock-cut to freestanding temple building, a shift that shaped every later South Indian temple, including Thanjavur's Brihadeeswarar Temple.",
    "images": [
      { "caption": "Descent of the Ganges relief", "alt": "Placeholder for the Arjuna's Penance bas-relief" }
    ]
  },
  {
    "id": "kerala-mural-art",
    "name": "Kerala",
    "state": "Kerala",
    "coordinates": [10.5941, 76.0417],
    "category": "temple-art",
    "tradition": "Kerala Mural Painting",
    "periodIds": ["medieval", "regional"],
    "periodLabel": "9th – 18th century CE",
    "historicalContext": "From roughly the 9th to the 18th century, temple and palace walls across Kerala were painted with a distinct mural tradition: natural mineral pigments, thick sculptural outlines, and densely packed compositions of Hindu deities and epic scenes, often in a distinctive palette of ochre, green, and black. Surviving examples cluster around temple towns such as Guruvayur, Ettumanoor, and Padmanabhapuram Palace.",
    "artForms": ["Fresco-secco temple wall painting", "Palace mural painting", "Natural pigment preparation (ochre, indigo, lamp-black)"],
    "artists": [{ "name": "Hereditary Chitrakar temple-guild painters", "note": "Mural painting passed down within specific families attached to individual temples." }],
    "artworks": [
      { "title": "Ettumanoor Mahadeva Temple murals", "note": "Among the best-preserved large-scale Kerala mural cycles." },
      { "title": "Padmanabhapuram Palace murals", "note": "A rare surviving example of the tradition applied to a royal residence rather than a temple." }
    ],
    "significance": "Kerala's murals preserve a painting tradition that runs parallel to, rather than descending from, North Indian miniature painting — a distinct regional visual language for the same Hindu epic subject matter seen elsewhere on this map.",
    "images": [
      { "caption": "Ettumanoor temple mural detail", "alt": "Placeholder for an Ettumanoor mural" }
    ]
  },
  {
    "id": "odisha-pattachitra",
    "name": "Odisha",
    "state": "Odisha",
    "coordinates": [19.877, 85.801],
    "category": "folk-art",
    "tradition": "Pattachitra Scroll Painting",
    "periodIds": ["medieval", "regional"],
    "periodLabel": "12th century CE onward",
    "historicalContext": "Pattachitra ('cloth picture') is a cloth-based scroll painting tradition centered on Puri and the village of Raghurajpur, tied closely to the Jagannath Temple cult. Artists prepare canvas with tamarind-seed paste and chalk, then paint with natural pigments and a fine brush, most often depicting Jagannath, Krishna, and Radha.",
    "artForms": ["Cloth scroll painting (Pattachitra)", "Palm-leaf manuscript illustration (Tala Patra Chitra)", "Natural pigment preparation"],
    "artists": [{ "name": "Raghurajpur village artist families", "note": "Most Pattachitra painters work within hereditary family workshops rather than as individual named masters." }],
    "artworks": [
      { "title": "Jagannath, Balabhadra and Subhadra Patti", "note": "The tradition's central devotional subject, echoing the temple's own icons." },
      { "title": "Dasavatara Patti", "note": "Scroll depicting the ten avatars of Vishnu in sequence." }
    ],
    "significance": "Pattachitra directly supplies the visual vocabulary of the annual Jagannath Rath Yatra festival, making it one of the few art traditions on this map still central to a living, large-scale religious ritual.",
    "images": [
      { "caption": "Jagannath Patti scroll painting", "alt": "Placeholder for a Jagannath Pattachitra scroll" }
    ]
  },
  {
    "id": "gujarat-folk-art",
    "name": "Gujarat (Kutch)",
    "state": "Gujarat",
    "coordinates": [23.242, 69.6669],
    "category": "folk-art",
    "tradition": "Kutch Embroidery, Bandhani & Mata ni Pachedi",
    "periodIds": ["regional", "contemporary"],
    "periodLabel": "Centuries-old textile traditions, still practiced",
    "historicalContext": "Gujarat, especially the Kutch region, sustains one of India's richest folk-art ecosystems: mirror-work and thread embroidery (Kutch/Rabari embroidery), tie-dye textiles (Bandhani), and Mata ni Pachedi — painted temple cloths made by the Vaghari community as portable shrines for a goddess-worshipping caste historically barred from temple entry.",
    "artForms": ["Kutch and Rabari embroidery", "Bandhani tie-dye textile art", "Mata ni Pachedi painted temple cloth"],
    "artists": [
      { "name": "Vaghari community painters", "note": "Hereditary practitioners of Mata ni Pachedi, historically painting cloth shrines rather than using temples." },
      { "name": "Rabari and Kutchi embroidery artisans", "note": "Predominantly women, working in community- and family-specific stitch vocabularies." }
    ],
    "artworks": [
      { "title": "Mata ni Pachedi cloth shrines", "note": "Large hand-painted or block-printed cloths depicting the mother goddess, used as portable temples." },
      { "title": "Kutch Rabari embroidery panels", "note": "Dense mirror-and-thread work traditionally made for a bride's dowry textiles." }
    ],
    "significance": "Gujarat's folk traditions show how textile and cloth-based art carried religious and social function for communities with limited access to formal temple or court patronage.",
    "images": [
      { "caption": "Mata ni Pachedi cloth shrine", "alt": "Placeholder for a Mata ni Pachedi painted cloth" }
    ]
  },
  {
    "id": "warli",
    "name": "Warli Region",
    "state": "Maharashtra",
    "coordinates": [19.97, 72.75],
    "category": "tribal-art",
    "tradition": "Warli Tribal Painting",
    "periodIds": ["ancient", "contemporary"],
    "periodLabel": "Ancient origins (est. 2,500+ years); documented as fine art since the 1970s",
    "historicalContext": "The Warli (Varli) tribal community of the hills north of Mumbai paint with rice-paste on mud walls in a spare, geometric style — circles, triangles, and lines built into human and animal figures — traditionally made for weddings and harvest rituals rather than as standalone artworks. The style was brought to national attention mainly through the artist Jivya Soma Mashe from the 1970s onward.",
    "artForms": ["Wall mural painting (rice-paste on mud)", "Geometric figurative pattern work", "Paper and canvas Warli painting (post-1970s market adaptation)"],
    "artists": [
      { "name": "Jivya Soma Mashe", "note": "Padma Shri recipient largely credited with adapting Warli ritual painting into an individually authored fine-art practice." },
      { "name": "Balu Mashe", "note": "Continued and extended his father Jivya Soma Mashe's work into narrative, exhibition-scale compositions." }
    ],
    "artworks": [
      { "title": "Lagna Chowk (wedding mural)", "note": "The tradition's original ritual context: a painted square marking a wedding altar." },
      { "title": "Tarpa dance compositions", "note": "Circular figure compositions depicting the community's harvest dance around a tarpa horn player." }
    ],
    "significance": "Warli is the clearest tribal (Adivasi) art tradition on this map, and its journey from ritual wall painting to gallery and textile design shows how indigenous visual language can reach global audiences without a court or colonial institution driving it.",
    "images": [
      { "caption": "Tarpa dance composition", "alt": "Placeholder for a Warli tarpa dance painting" }
    ]
  },
  {
    "id": "hyderabad-deccani",
    "name": "Hyderabad",
    "state": "Telangana",
    "coordinates": [17.385, 78.4867],
    "category": "miniature-painting",
    "tradition": "Deccani Miniature Painting",
    "periodIds": ["mughal", "regional"],
    "periodLabel": "16th – 18th century CE",
    "historicalContext": "Painting at the Deccan sultanates — Ahmadnagar, Bijapur, Golconda, and later Hyderabad under the Qutb Shahis and Nizams — developed independently of the Mughal court from the 16th–18th centuries, absorbing Persian, Turkish, and later European influence through the Deccan's Indian Ocean trade contacts. Its palette is typically richer and more saturated than contemporary Mughal painting, with a taste for elongated figures and lush, almost surreal backgrounds.",
    "artForms": ["Deccani miniature painting", "Golconda/Hyderabad court portraiture", "Qutb Shahi and Nizam-era manuscript illustration"],
    "artists": [
      { "name": "Farrukh Beg", "note": "Persian-trained painter who worked at the Bijapur Deccan court, prized for jewel-like color." },
      { "name": "Deccan court ateliers under the Qutb Shahis", "note": "Produced most surviving Golconda-period work collectively rather than under single named masters." }
    ],
    "artworks": [
      { "title": "Ibrahim Adil Shah II with a hawk", "note": "Typical Deccani royal portrait combining Persian elegance with Indian setting." },
      { "title": "Ragamala paintings of the Deccan", "note": "A Deccani counterpart to the Rajasthani raga-mood painting tradition, with a notably more lyrical, dreamlike style." }
    ],
    "significance": "Deccani painting proves that Mughal patronage wasn't the only engine of Indian miniature art — the Deccan sultanates ran a parallel, equally sophisticated painting culture shaped by different trade and religious contacts.",
    "images": [
      { "caption": "Deccani court portrait style", "alt": "Placeholder for a Deccani miniature portrait" }
    ]
  }
]
```

- [ ] **Step 2: Verify the JSON is well-formed and has exactly 14 entries**

Run: `node -e "const d = require('./src/data/locations.json'); console.log(d.length, d.every(l => l.coordinates.length === 2))"`

Expected: prints `14 true` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/locations.json
git commit -m "Add content data for all 14 art-history locations"
```

---

## Task 5: Category Marker Icons (SVG)

**Files:**
- Create: `src/components/MapView/markerIcons.js`

**Interfaces:**
- Consumes: `CATEGORIES` from `src/data/categories.js` (Task 3) — specifically each category's `iconId` and `color`.
- Produces: `getMarkerHtml(categoryId)` returning an HTML string (SVG pin), used by Task 6's `CategoryMarker` to build a Leaflet `divIcon`.

- [ ] **Step 1: Write `src/components/MapView/markerIcons.js`**

```js
import { getCategory } from "../../data/categories.js";

const ICON_PATHS = {
  lotus: '<path d="M12 2c1.5 2 1.5 5 0 7-1.5-2-1.5-5 0-7zM6 6c2 1 3.5 3.5 3.5 6-2.5-.5-4.5-2.5-5-5 .5-.5 1-1 1.5-1zM18 6c-2 1-3.5 3.5-3.5 6 2.5-.5 4.5-2.5 5-5-.5-.5-1-1-1.5-1zM12 9c2.5 0 4.5 2.5 4.5 5.5S14.5 20 12 20s-4.5-2-4.5-5.5S9.5 9 12 9z" />',
  sunburst: '<circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />',
  frame: '<rect x="5" y="4" width="14" height="16" rx="1" /><circle cx="12" cy="11" r="3" /><path d="M7 18l3-3 2 2 3-4 2 3" />',
  shikhara: '<path d="M12 3l3 6h-2l2 4h-2l2 4H9l2-4H9l2-4H9z" /><rect x="7" y="17" width="10" height="3" />',
  brushstroke: '<path d="M4 18c3-6 5-9 7-11 1-1 2.5-1 3 .5.5 1.5-1 2.5-2 3-2 2-4 5-5 8-.3 1-1.5 1-2-.5z" /><circle cx="17" cy="6" r="1.5" />',
  "triangle-motif": '<path d="M12 4l4 7H8z" /><path d="M6 13l3 5H3z" /><path d="M18 13l3 5h-6z" /><circle cx="12" cy="17" r="1.2" />',
};

export function getMarkerHtml(categoryId) {
  const category = getCategory(categoryId);
  const path = ICON_PATHS[category?.iconId] ?? ICON_PATHS.lotus;
  const color = category?.color ?? "var(--color-accent)";

  return `
    <span class="category-marker" style="--marker-color: ${color}">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        ${path}
      </svg>
    </span>
  `;
}
```

- [ ] **Step 2: Verify with a Node import check**

Run: `node -e "import('./src/components/MapView/markerIcons.js').then(m => console.log(m.getMarkerHtml('folk-art').includes('svg')))"`

Expected: prints `true`.

- [ ] **Step 3: Commit**

```bash
git add src/components/MapView/markerIcons.js
git commit -m "Add per-category SVG marker icon generator"
```

---

## Task 6: MapView Component

**Files:**
- Create: `src/components/MapView/MapView.jsx`
- Create: `src/components/MapView/MapView.css`
- Modify: `src/App.jsx` (render `MapView` with the full location list, temporarily)

**Interfaces:**
- Consumes: `getMarkerHtml(categoryId)` from Task 5; `leaflet`/`react-leaflet`'s `MapContainer`, `TileLayer`, `Marker` (from Task 1's install).
- Produces: `<MapView locations={Location[]} selectedId={string|null} onSelectLocation={(id) => void} />`. `Location` is the shape from Task 4's schema. Later tasks (App, InfoPanel, filters) rely on this exact prop contract.

- [ ] **Step 1: Write `src/components/MapView/MapView.css`**

```css
.map-view {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.map-view .leaflet-container {
  width: 100%;
  height: 100%;
  background: var(--color-bg);
  font-family: var(--font-body);
}

.category-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: var(--marker-color, var(--color-accent));
  box-shadow: 0 3px 8px rgba(43, 33, 24, 0.35);
  border: 2px solid var(--color-surface);
}

.category-marker svg {
  width: 16px;
  height: 16px;
  transform: rotate(45deg);
}

.category-marker.is-selected {
  width: 40px;
  height: 40px;
  box-shadow: 0 4px 14px rgba(43, 33, 24, 0.5);
}
```

- [ ] **Step 2: Write `src/components/MapView/MapView.jsx`**

```jsx
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { getMarkerHtml } from "./markerIcons.js";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const INDIA_CENTER = [22.5, 80];
const INDIA_BOUNDS = [
  [6.5, 65.0],
  [37.5, 99.0],
];

function buildIcon(categoryId, isSelected) {
  return L.divIcon({
    html: getMarkerHtml(categoryId),
    className: isSelected ? "category-marker-wrapper is-selected" : "category-marker-wrapper",
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32],
  });
}

function FlyToSelection({ locations, selectedId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const location = locations.find((item) => item.id === selectedId);
    if (!location) return;
    map.flyTo(location.coordinates, Math.max(map.getZoom(), 6), { duration: 0.6 });
  }, [selectedId, locations, map]);

  return null;
}

export default function MapView({ locations, selectedId, onSelectLocation }) {
  const icons = useMemo(() => {
    const map = new Map();
    for (const location of locations) {
      map.set(location.id, buildIcon(location.category, location.id === selectedId));
    }
    return map;
  }, [locations, selectedId]);

  return (
    <div className="map-view">
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={4}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.8}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToSelection locations={locations} selectedId={selectedId} />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.coordinates}
            icon={icons.get(location.id)}
            eventHandlers={{ click: () => onSelectLocation(location.id) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 3: Temporarily wire `MapView` into `App.jsx` to verify it renders**

Edit `src/App.jsx`:

```jsx
import { useState } from "react";
import MapView from "./components/MapView/MapView.jsx";
import locations from "./data/locations.json";

function App() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="app">
      <MapView locations={locations} selectedId={selectedId} onSelectLocation={setSelectedId} />
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev` and open the printed local URL.

Expected: a full-screen light-toned map of India (roughly bounded to the subcontinent, can't pan away to the rest of the world), with 14 colored diamond-shaped markers visible across the country. Clicking a marker doesn't error in the console (there's no visible reaction yet — that's expected until Task 9 adds the InfoPanel).

- [ ] **Step 5: Commit**

```bash
git add src/components/MapView src/App.jsx
git commit -m "Add MapView with category-colored markers over an India-bounded basemap"
```

---

## Task 7: useFilteredLocations Hook

**Files:**
- Create: `src/hooks/useFilteredLocations.js`

**Interfaces:**
- Consumes: `Location[]` (Task 4 schema).
- Produces: `useFilteredLocations(locations, { searchText, categoryIds, periodIds })` returning a filtered `Location[]`. `categoryIds`/`periodIds` are `Set<string>` — empty set means "no filter on this dimension." Tasks 8 (Timeline) and 9 (SearchFilterBar) produce these filter values; App (Task 11) wires them together.

- [ ] **Step 1: Write `src/hooks/useFilteredLocations.js`**

```js
import { useMemo } from "react";

function matchesSearch(location, searchText) {
  if (!searchText) return true;
  const haystack = [
    location.name,
    location.state,
    location.tradition,
    ...location.artists.map((artist) => artist.name),
    ...location.artForms,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(searchText.trim().toLowerCase());
}

function matchesCategory(location, categoryIds) {
  if (categoryIds.size === 0) return true;
  return categoryIds.has(location.category);
}

function matchesPeriod(location, periodIds) {
  if (periodIds.size === 0) return true;
  return location.periodIds.some((id) => periodIds.has(id));
}

export function useFilteredLocations(locations, { searchText, categoryIds, periodIds }) {
  return useMemo(
    () =>
      locations.filter(
        (location) =>
          matchesSearch(location, searchText) &&
          matchesCategory(location, categoryIds) &&
          matchesPeriod(location, periodIds)
      ),
    [locations, searchText, categoryIds, periodIds]
  );
}
```

- [ ] **Step 2: Verify with a Node script exercising all three filter dimensions**

Run:

```bash
node --input-type=module -e "
import { useFilteredLocations } from './src/hooks/useFilteredLocations.js';
import locations from './src/data/locations.json' with { type: 'json' };

// useFilteredLocations calls useMemo, which needs a React render context.
// Call the filtering logic directly for this smoke test instead:
const filtered = locations.filter(l =>
  l.name.toLowerCase().includes('madhubani') &&
  new Set(['folk-art']).has(l.category) &&
  l.periodIds.some(id => new Set(['contemporary']).has(id))
);
console.log(filtered.length === 1 && filtered[0].id === 'madhubani');
"
```

Expected: prints `true`. (This checks the filtering *logic* the hook wraps; the hook itself is exercised live in the browser once Task 11 wires it into `App`.)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFilteredLocations.js
git commit -m "Add useFilteredLocations hook combining search/category/period filters"
```

---

## Task 8: Timeline Component

**Files:**
- Create: `src/components/Timeline/Timeline.jsx`
- Create: `src/components/Timeline/Timeline.css`

**Interfaces:**
- Consumes: `PERIODS` from `src/data/periods.js` (Task 3).
- Produces: `<Timeline activePeriodIds={Set<string>} onTogglePeriod={(periodId) => void} />`. Task 11 (App) owns the `Set` state and passes the toggle handler.

- [ ] **Step 1: Write `src/components/Timeline/Timeline.css`**

```css
.timeline {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.timeline::-webkit-scrollbar {
  height: 6px;
}

.timeline-pill {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-ink-soft);
  font-family: var(--font-body);
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.timeline-pill strong {
  font-size: var(--text-sm);
  font-weight: 600;
}

.timeline-pill span {
  font-size: var(--text-xs);
  opacity: 0.8;
}

.timeline-pill.is-active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-surface);
}
```

- [ ] **Step 2: Write `src/components/Timeline/Timeline.jsx`**

```jsx
import { PERIODS } from "../../data/periods.js";
import "./Timeline.css";

export default function Timeline({ activePeriodIds, onTogglePeriod }) {
  return (
    <nav className="timeline" aria-label="Filter by historical period">
      {PERIODS.map((period) => {
        const isActive = activePeriodIds.has(period.id);
        return (
          <button
            key={period.id}
            type="button"
            className={isActive ? "timeline-pill is-active" : "timeline-pill"}
            aria-pressed={isActive}
            onClick={() => onTogglePeriod(period.id)}
          >
            <strong>{period.label}</strong>
            <span>{period.yearRange}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Verify by temporarily rendering it standalone in `App.jsx`**

Add (temporarily, will be replaced in Task 11) below `<MapView .../>` in `App.jsx`:

```jsx
import Timeline from "./components/Timeline/Timeline.jsx";
// ...
<Timeline activePeriodIds={new Set()} onTogglePeriod={(id) => console.log("toggle", id)} />
```

Run: `npm run dev`. Expected: a horizontally scrollable strip of 8 period pills docked at the bottom of the screen; clicking one logs `toggle <id>` to the browser console (no visual state change yet — that's expected, since it's temporarily wired with a throwaway handler).

- [ ] **Step 4: Commit**

```bash
git add src/components/Timeline
git commit -m "Add Timeline period-filter component"
```

---

## Task 9: SearchFilterBar Component

**Files:**
- Create: `src/components/SearchFilterBar/SearchFilterBar.jsx`
- Create: `src/components/SearchFilterBar/SearchFilterBar.css`

**Interfaces:**
- Consumes: `CATEGORIES` from `src/data/categories.js` (Task 3).
- Produces: `<SearchFilterBar searchText={string} onSearchTextChange={(text) => void} activeCategoryIds={Set<string>} onToggleCategory={(categoryId) => void} />`.

- [ ] **Step 1: Write `src/components/SearchFilterBar/SearchFilterBar.css`**

```css
.search-filter-bar {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-3);
}

.search-filter-bar input[type="search"] {
  flex: 1 1 220px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-ink);
  background: var(--color-bg);
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  border: 1px solid var(--chip-color, var(--color-border));
  background: var(--color-surface);
  color: var(--color-ink-soft);
  font-size: var(--text-xs);
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
}

.category-chip .chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip-color);
}

.category-chip.is-active {
  background: var(--chip-color);
  color: var(--color-surface);
}
```

- [ ] **Step 2: Write `src/components/SearchFilterBar/SearchFilterBar.jsx`**

```jsx
import { CATEGORIES } from "../../data/categories.js";
import "./SearchFilterBar.css";

export default function SearchFilterBar({
  searchText,
  onSearchTextChange,
  activeCategoryIds,
  onToggleCategory,
}) {
  return (
    <div className="search-filter-bar">
      <input
        type="search"
        placeholder="Search a place, artist, or style…"
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        aria-label="Search locations, artists, or art styles"
      />
      {CATEGORIES.map((category) => {
        const isActive = activeCategoryIds.has(category.id);
        return (
          <button
            key={category.id}
            type="button"
            className={isActive ? "category-chip is-active" : "category-chip"}
            style={{ "--chip-color": category.color }}
            aria-pressed={isActive}
            onClick={() => onToggleCategory(category.id)}
          >
            <span className="chip-dot" />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Verify by temporarily rendering it standalone in `App.jsx`**

Add (temporarily) above `<MapView .../>` in `App.jsx`:

```jsx
import SearchFilterBar from "./components/SearchFilterBar/SearchFilterBar.jsx";
// ...
<SearchFilterBar
  searchText=""
  onSearchTextChange={(text) => console.log("search", text)}
  activeCategoryIds={new Set()}
  onToggleCategory={(id) => console.log("category", id)}
/>
```

Run: `npm run dev`. Expected: a rounded search bar with a text input and 6 category chips docked near the top of the screen, overlaying the map. Typing in the input logs to the console; clicking a chip logs to the console.

- [ ] **Step 4: Commit**

```bash
git add src/components/SearchFilterBar
git commit -m "Add SearchFilterBar with text search and category chips"
```

---

## Task 10: InfoPanel + Gallery Component

**Files:**
- Create: `src/components/InfoPanel/InfoPanel.jsx`
- Create: `src/components/InfoPanel/InfoPanel.css`
- Create: `src/components/InfoPanel/Gallery.jsx`

**Interfaces:**
- Consumes: `Location` (Task 4 schema), `getCategory` from `src/data/categories.js`, `getPeriod`/`PERIODS` are not needed here (location already carries `periodLabel`), `motion`/`AnimatePresence` from `framer-motion` (Task 1's install).
- Produces: `<InfoPanel location={Location|null} onClose={() => void} />`. `location === null` renders nothing (handles "no selection" without a separate loading/error branch, matching the spec's stated error-handling scope).

- [ ] **Step 1: Write `src/components/InfoPanel/Gallery.jsx`**

```jsx
import { getCategory } from "../../data/categories.js";

export default function Gallery({ images, categoryId }) {
  const category = getCategory(categoryId);

  return (
    <div className="gallery">
      {images.map((image, index) => (
        <figure
          key={index}
          className="gallery-placeholder"
          style={{ "--chip-color": category?.color }}
        >
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/InfoPanel/InfoPanel.css`**

```css
.info-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 100%);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
  z-index: 20;
  overflow-y: auto;
  padding: var(--space-6) var(--space-5) var(--space-8);
}

.info-panel-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  border: none;
  background: var(--color-bg);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: var(--text-lg);
  line-height: 1;
  color: var(--color-ink-soft);
}

.info-panel-eyebrow {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--chip-color, var(--color-accent));
}

.info-panel h2 {
  font-size: var(--text-2xl);
  margin: var(--space-1) 0 var(--space-2);
}

.info-panel-meta {
  color: var(--color-ink-soft);
  font-size: var(--text-sm);
  margin-bottom: var(--space-5);
}

.info-panel section {
  margin-bottom: var(--space-5);
}

.info-panel h3 {
  font-size: var(--text-base);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-ink-faint);
  margin-bottom: var(--space-2);
}

.info-panel ul {
  margin: 0;
  padding-left: var(--space-4);
}

.info-panel li {
  margin-bottom: var(--space-1);
}

.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

.gallery-placeholder {
  margin: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--chip-color, var(--color-accent)) 0%, var(--color-surface-alt) 100%);
  display: flex;
  align-items: flex-end;
  padding: var(--space-2);
}

.gallery-placeholder figcaption {
  font-size: var(--text-xs);
  color: var(--color-surface);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 3: Write `src/components/InfoPanel/InfoPanel.jsx`**

```jsx
import { AnimatePresence, motion } from "framer-motion";
import { getCategory } from "../../data/categories.js";
import Gallery from "./Gallery.jsx";
import "./InfoPanel.css";

export default function InfoPanel({ location, onClose }) {
  return (
    <AnimatePresence>
      {location && (
        <motion.aside
          className="info-panel"
          style={{ "--chip-color": getCategory(location.category)?.color }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          aria-label={`${location.name} details`}
        >
          <button type="button" className="info-panel-close" onClick={onClose} aria-label="Close panel">
            ×
          </button>

          <p className="info-panel-eyebrow">{getCategory(location.category)?.label}</p>
          <h2>{location.name}</h2>
          <p className="info-panel-meta">
            {location.state} · {location.tradition}
            <br />
            {location.periodLabel}
          </p>

          <section>
            <h3>Historical Context</h3>
            <p>{location.historicalContext}</p>
          </section>

          <section>
            <h3>Art Forms</h3>
            <ul>
              {location.artForms.map((form) => (
                <li key={form}>{form}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Artists</h3>
            <ul>
              {location.artists.map((artist) => (
                <li key={artist.name}>
                  <strong>{artist.name}</strong> — {artist.note}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Featured Artworks</h3>
            <ul>
              {location.artworks.map((artwork) => (
                <li key={artwork.title}>
                  <strong>{artwork.title}</strong> — {artwork.note}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Why It Matters</h3>
            <p>{location.significance}</p>
          </section>

          <section>
            <h3>Gallery</h3>
            <Gallery images={location.images} categoryId={location.category} />
          </section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Verify by temporarily rendering it standalone in `App.jsx`**

Add (temporarily) below `<MapView .../>` in `App.jsx`:

```jsx
import InfoPanel from "./components/InfoPanel/InfoPanel.jsx";
// ...
<InfoPanel location={locations[0]} onClose={() => console.log("close")} />
```

Run: `npm run dev`. Expected: a panel slides in from the right showing the Ajanta & Ellora entry with all sections (Historical Context, Art Forms, Artists, Featured Artworks, Why It Matters, Gallery with 2 gradient placeholder tiles) populated with real text, not `undefined`. Clicking the × logs `close` to the console.

- [ ] **Step 5: Commit**

```bash
git add src/components/InfoPanel
git commit -m "Add InfoPanel with museum-label sections and placeholder gallery"
```

---

## Task 11: App Integration (Header + full state wiring)

**Files:**
- Create: `src/components/Header/Header.jsx`
- Create: `src/components/Header/Header.css`
- Modify: `src/App.jsx` (replace the temporary wiring from Tasks 6/8/9/10 with the real, fully connected version)

**Interfaces:**
- Consumes: every component/hook produced in Tasks 3–10.
- Produces: the finished `App` component — no further tasks depend on its internals, only on the app working end-to-end.

- [ ] **Step 1: Write `src/components/Header/Header.css`**

```css
.app-header {
  position: absolute;
  bottom: var(--space-4);
  left: var(--space-4);
  z-index: 10;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-3) var(--space-4);
  max-width: 320px;
}

.app-header h1 {
  font-size: var(--text-xl);
  color: var(--color-accent);
}

.app-header p {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
  color: var(--color-ink-soft);
}
```

- [ ] **Step 2: Write `src/components/Header/Header.jsx`**

```jsx
import "./Header.css";

export default function Header() {
  return (
    <div className="app-header">
      <h1>Rang Bhoomi</h1>
      <p>An interactive map of Indian art history — click a marker to explore.</p>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/App.jsx` to wire every piece together**

```jsx
import { useMemo, useState } from "react";
import MapView from "./components/MapView/MapView.jsx";
import SearchFilterBar from "./components/SearchFilterBar/SearchFilterBar.jsx";
import Timeline from "./components/Timeline/Timeline.jsx";
import InfoPanel from "./components/InfoPanel/InfoPanel.jsx";
import Header from "./components/Header/Header.jsx";
import { useFilteredLocations } from "./hooks/useFilteredLocations.js";
import locationsData from "./data/locations.json";

function toggleInSet(set, value) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeCategoryIds, setActiveCategoryIds] = useState(() => new Set());
  const [activePeriodIds, setActivePeriodIds] = useState(() => new Set());

  const filteredLocations = useFilteredLocations(locationsData, {
    searchText,
    categoryIds: activeCategoryIds,
    periodIds: activePeriodIds,
  });

  const selectedLocation = useMemo(
    () => locationsData.find((location) => location.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    <div className="app">
      <MapView
        locations={filteredLocations}
        selectedId={selectedId}
        onSelectLocation={setSelectedId}
      />
      <Header />
      <SearchFilterBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        activeCategoryIds={activeCategoryIds}
        onToggleCategory={(id) => setActiveCategoryIds((prev) => toggleInSet(prev, id))}
      />
      <Timeline
        activePeriodIds={activePeriodIds}
        onTogglePeriod={(id) => setActivePeriodIds((prev) => toggleInSet(prev, id))}
      />
      <InfoPanel location={selectedLocation} onClose={() => setSelectedId(null)} />
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Position the Timeline at the bottom of the viewport in `App.css`-equivalent (global.css)**

The Timeline is a `<nav>`, not absolutely positioned by its own CSS (Task 8 gave it `border-top` styling assuming normal flow). Since `.app` is `position: relative; overflow: hidden` and MapView/Header/SearchFilterBar are absolutely positioned, add a wrapper so Timeline docks to the bottom without covering the map interaction area. Edit `src/App.jsx`'s return to wrap `Timeline` in a positioned div:

```jsx
      <div className="timeline-dock">
        <Timeline
          activePeriodIds={activePeriodIds}
          onTogglePeriod={(id) => setActivePeriodIds((prev) => toggleInSet(prev, id))}
        />
      </div>
```

Add to `src/styles/global.css`:

```css
.timeline-dock {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}
```

- [ ] **Step 5: Full manual verification pass**

Run: `npm run dev` and open the app.

Verify, in order:
1. Map loads centered on India with 14 markers, Header card bottom-left, SearchFilterBar top, Timeline strip docked bottom.
2. Click 3 different markers (e.g. Ajanta & Ellora, Madhubani, Hampi) — InfoPanel slides in from the right each time with correct, non-empty content for that location; × closes it.
3. Type "warli" into search — map narrows to 1 marker; clear the search — all 14 return.
4. Click the "Folk Art" chip — map narrows to Madhubani, Odisha, Gujarat (3 markers); click it again — all return.
5. Click the "Ancient India" timeline pill — map narrows to locations tagged `ancient` (Ajanta & Ellora, Mahabalipuram, Warli); click again — all return.
6. Combine a category chip + a period pill — result is the AND of both (e.g. Folk Art + Contemporary → Madhubani and Gujarat, not Odisha).
7. No console errors throughout.

- [ ] **Step 6: Commit**

```bash
git add src/components/Header src/App.jsx src/styles/global.css
git commit -m "Wire full app state: search, category, and period filtering with InfoPanel"
```

---

## Task 12: Responsive Layout Pass

**Files:**
- Modify: `src/components/InfoPanel/InfoPanel.css`
- Modify: `src/components/SearchFilterBar/SearchFilterBar.css`
- Modify: `src/components/Header/Header.css`
- Modify: `src/components/Timeline/Timeline.css`

**Interfaces:**
- Consumes: nothing new — pure CSS additions to existing components from Tasks 8–11.
- Produces: no new interfaces; visual behavior only.

- [ ] **Step 1: Add a mobile breakpoint to `InfoPanel.css` — bottom sheet instead of side panel**

Append to `src/components/InfoPanel/InfoPanel.css`:

```css
@media (max-width: 640px) {
  .info-panel {
    top: auto;
    left: 0;
    right: 0;
    width: 100%;
    height: min(75vh, 100%);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
```

- [ ] **Step 2: Update `InfoPanel.jsx`'s motion props to slide from the bottom on mobile**

Framer Motion doesn't read media queries directly, so detect width in JS. Edit `src/components/InfoPanel/InfoPanel.jsx`:

Replace the `initial`/`animate`/`exit` props with values computed from a small helper:

```jsx
const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
```

Add that line inside the component, above the `return`, and change the motion props to:

```jsx
          initial={isMobile ? { y: "100%" } : { x: "100%" }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: "100%" } : { x: "100%" }}
```

- [ ] **Step 3: Add a mobile breakpoint to `SearchFilterBar.css` — allow chips to wrap onto their own row**

Append to `src/components/SearchFilterBar/SearchFilterBar.css`:

```css
@media (max-width: 640px) {
  .search-filter-bar {
    top: var(--space-3);
    left: var(--space-3);
    right: var(--space-3);
    padding: var(--space-2);
  }

  .search-filter-bar input[type="search"] {
    flex-basis: 100%;
  }
}
```

- [ ] **Step 4: Add a mobile breakpoint to `Header.css` — shrink and reposition so it doesn't collide with the timeline**

Append to `src/components/Header/Header.css`:

```css
@media (max-width: 640px) {
  .app-header {
    max-width: calc(100% - var(--space-6));
    bottom: 96px;
    padding: var(--space-2) var(--space-3);
  }

  .app-header p {
    display: none;
  }
}
```

- [ ] **Step 5: Add a mobile breakpoint to `Timeline.css` — slightly smaller pills**

Append to `src/components/Timeline/Timeline.css`:

```css
@media (max-width: 640px) {
  .timeline-pill {
    padding: var(--space-1) var(--space-2);
  }

  .timeline-pill span {
    display: none;
  }
}
```

- [ ] **Step 6: Verify at a mobile viewport**

Run: `npm run dev`. Open browser devtools, switch to a mobile viewport (e.g. 375×812). Reload.

Expected: SearchFilterBar and Header fit within the width without horizontal overflow; Timeline pills shrink (year ranges hidden, labels remain); clicking a marker opens InfoPanel as a bottom sheet (slides up, not in from the right) covering about 75% of the screen height, with the map still visible above it.

- [ ] **Step 7: Commit**

```bash
git add src/components/InfoPanel src/components/SearchFilterBar src/components/Header src/components/Timeline
git commit -m "Add responsive mobile layout: bottom-sheet panel and compacted chrome"
```

---

## Task 13: README

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: none consumed by code — documentation only.

- [ ] **Step 1: Write `README.md`**

```markdown
# Rang Bhoomi — An Interactive Map of Indian Art History

A digital-museum web app: explore India on a map, click a region, and learn
its art movement, artists, artworks, and historical context.

## Run locally

npm install
npm run dev

Then open the printed local URL (usually http://localhost:5173).

## Project structure

- `src/data/` — content: `locations.json` (14 locations), `categories.js`,
  `periods.js`. Add a new location by appending one object to
  `locations.json` following the existing schema — no code changes needed.
- `src/components/MapView/` — the Leaflet map and category marker icons.
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
```

- [ ] **Step 2: Verify**

Read the file back and confirm it renders as valid Markdown (no unbalanced code fences).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Add README with run instructions and project structure"
```
