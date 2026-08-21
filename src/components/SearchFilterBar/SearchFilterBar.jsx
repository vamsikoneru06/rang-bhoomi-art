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
