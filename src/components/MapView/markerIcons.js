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
