import { getCategory } from "../../data/categories.js";

const ICON_PATHS = {
  lotus: '<path d="M12 2c1.5 2 1.5 5 0 7-1.5-2-1.5-5 0-7zM6 6c2 1 3.5 3.5 3.5 6-2.5-.5-4.5-2.5-5-5 .5-.5 1-1 1.5-1zM18 6c-2 1-3.5 3.5-3.5 6 2.5-.5 4.5-2.5 5-5-.5-.5-1-1-1.5-1zM12 9c2.5 0 4.5 2.5 4.5 5.5S14.5 20 12 20s-4.5-2-4.5-5.5S9.5 9 12 9z" fill="white"/>',
  sunburst: '<circle cx="12" cy="12" r="3.5" fill="white"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1" stroke="white" stroke-width="2" stroke-linecap="round"/>',
  frame: '<rect x="4" y="3" width="16" height="18" rx="2" stroke="white" stroke-width="1.8" fill="none"/><circle cx="12" cy="11" r="3.5" fill="white" opacity="0.9"/><path d="M6 17.5l3.5-3.5 2.5 2.5 3.5-4.5 2.5 3.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  shikhara: '<path d="M12 2l4 8h-2.5l2 4.5h-2.5l2 4H9l2-4H8.5l2-4.5H8z" fill="white"/><rect x="7" y="18.5" width="10" height="3" rx="1" fill="white" opacity="0.85"/>',
  brushstroke: '<path d="M5 18c3-7 5-10 7-12 1-1 3-1.2 3.5.5.5 1.5-1 3-2.5 4-2.5 2.5-4.5 5.5-5.5 8.5-.4 1.2-1.8 1.2-2.5-.5z" fill="white"/><circle cx="18" cy="5.5" r="2" fill="white" opacity="0.8"/>',
  "triangle-motif": '<path d="M12 3l5 8H7z" fill="white"/><path d="M5.5 13l3.5 6H2z" fill="white" opacity="0.8"/><path d="M18.5 13l3.5 6h-7z" fill="white" opacity="0.8"/><circle cx="12" cy="17.5" r="1.5" fill="white" opacity="0.9"/>',
};

export function getMarkerHtml(categoryId, { isSelected = false, isDimmed = false, name = "" } = {}) {
  const category = getCategory(categoryId);
  const path = ICON_PATHS[category?.iconId] ?? ICON_PATHS.lotus;
  const color = category?.color ?? "var(--color-accent)";

  const wrapperClass = [
    "pin-wrapper",
    isSelected ? "is-selected" : "",
    isDimmed ? "is-dimmed" : "",
  ].filter(Boolean).join(" ");

  return `
    <div class="${wrapperClass}" style="--pin-color: ${color}" data-name="${name}">
      <div class="pin-body">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          ${path}
        </svg>
      </div>
      <div class="pin-glow"></div>
      <div class="pin-tip"></div>
    </div>
  `;
}
