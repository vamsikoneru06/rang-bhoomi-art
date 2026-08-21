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
