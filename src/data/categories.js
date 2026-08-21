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
