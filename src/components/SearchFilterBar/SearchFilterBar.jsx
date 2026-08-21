import { CATEGORIES } from "../../data/categories.js";
import "./SearchFilterBar.css";

/* Convert a CSS color var string to a hex for --btn-rgb:
   We skip that complexity and just pass the CSS var directly */
function hexToRgb(cssColor) {
  /* Strip "var(--color-xxx)" → return the known hex strings */
  const map = {
    "var(--color-classical-art)": "166,67,44",
    "var(--color-folk-art)": "199,124,31",
    "var(--color-miniature-painting)": "91,58,142",
    "var(--color-temple-art)": "138,109,27",
    "var(--color-modern-art)": "31,111,111",
    "var(--color-tribal-art)": "122,139,60",
  };
  return map[cssColor] ?? "181,67,44";
}

export default function SearchFilterBar({
  searchText,
  onSearchTextChange,
  activeCategoryIds,
  onToggleCategory,
}) {
  return (
    <div className="search-filter-bar glass glass-card">
      {/* Search input */}
      <div className="search-input-wrap">
        <input
          type="search"
          placeholder="Search places, artists, styles…"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          aria-label="Search art locations"
        />
      </div>

      {/* Category chips */}
      <div className="chips-row">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategoryIds.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-chip glass glass-pill glass-btn${isActive ? " is-active" : ""}`}
              style={{
                "--chip-color": cat.color,
                "--btn-rgb": hexToRgb(cat.color),
              }}
              aria-pressed={isActive}
              onClick={() => onToggleCategory(cat.id)}
            >
              <span className="chip-dot" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
