import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap.js";
import { CATEGORIES } from "../../data/categories.js";
import "./SearchFilterBar.css";

function hexToRgb(cssColor) {
  const map = {
    "var(--color-classical-art)":      "166,67,44",
    "var(--color-folk-art)":           "199,124,31",
    "var(--color-miniature-painting)": "91,58,142",
    "var(--color-temple-art)":         "138,109,27",
    "var(--color-modern-art)":         "31,111,111",
    "var(--color-tribal-art)":         "122,139,60",
  };
  return map[cssColor] ?? "181,67,44";
}

export default function SearchFilterBar({
  searchText, onSearchTextChange,
  activeCategoryIds, onToggleCategory,
}) {
  const barRef = useRef(null);

  /* Slide down from above on first mount */
  useEffect(() => {
    if (!barRef.current) return;
    gsap.from(barRef.current, {
      y: -90,
      opacity: 0,
      duration: 0.9,
      ease: "expo.out",
      delay: 0.4,
      clearProps: "transform,opacity",
    });
  }, []);

  return (
    <div ref={barRef} className="search-filter-bar glass glass-card">
      <div className="search-input-wrap">
        <input
          type="search"
          placeholder="Search places, artists, styles…"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          aria-label="Search art locations"
        />
      </div>
      <div className="chips-row">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategoryIds.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-chip glass glass-pill glass-btn${isActive ? " is-active" : ""}`}
              style={{ "--chip-color": cat.color, "--btn-rgb": hexToRgb(cat.color) }}
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
