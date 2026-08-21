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
