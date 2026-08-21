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
  if (next.has(value)) next.delete(value);
  else next.add(value);
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
    () => locationsData.find((loc) => loc.id === selectedId) ?? null,
    [selectedId]
  );

  /* If a selected pin gets filtered out, deselect it */
  const visibleSelectedId = useMemo(
    () =>
      filteredLocations.some((loc) => loc.id === selectedId) ? selectedId : null,
    [filteredLocations, selectedId]
  );

  return (
    <div className="app">
      {/* ── Full-screen map ─────────────────────────────── */}
      <MapView
        locations={filteredLocations}
        selectedId={visibleSelectedId}
        onSelectLocation={(id) =>
          setSelectedId((prev) => (prev === id ? null : id))
        }
      />

      {/* ── Floating search + category chips ────────────── */}
      <SearchFilterBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        activeCategoryIds={activeCategoryIds}
        onToggleCategory={(id) =>
          setActiveCategoryIds((prev) => toggleInSet(prev, id))
        }
      />

      {/* ── Floating brand card ──────────────────────────── */}
      <Header locationCount={filteredLocations.length} />

      {/* ── Period timeline dock (bottom) ────────────────── */}
      <div className="timeline-dock">
        <Timeline
          activePeriodIds={activePeriodIds}
          onTogglePeriod={(id) =>
            setActivePeriodIds((prev) => toggleInSet(prev, id))
          }
        />
      </div>

      {/* ── Detail panel ─────────────────────────────────── */}
      <InfoPanel
        location={visibleSelectedId ? selectedLocation : null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export default App;
