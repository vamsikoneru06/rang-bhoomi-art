import { useMemo, useState, useCallback } from "react";
import MapView from "./components/MapView/MapView.jsx";
import SearchFilterBar from "./components/SearchFilterBar/SearchFilterBar.jsx";
import Timeline from "./components/Timeline/Timeline.jsx";
import InfoPanel from "./components/InfoPanel/InfoPanel.jsx";
import Header from "./components/Header/Header.jsx";
import { LandingPage } from "./components/LandingPage/LandingPage.jsx";
import MapTransition from "./components/MapTransition/MapTransition.jsx";
import { useFilteredLocations } from "./hooks/useFilteredLocations.js";
import locationsData from "./data/locations.json";

function toggleInSet(set, value) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/**
 * App phases:
 *  "landing"       — Full-screen landing page, map hidden
 *  "transitioning" — Glass ripple transition playing
 *  "map"           — Map visible with all UI elements
 */

function App() {
  const [appPhase,          setAppPhase]          = useState("landing");
  const [selectedId,        setSelectedId]        = useState(null);
  const [searchText,        setSearchText]        = useState("");
  const [activeCategoryIds, setActiveCategoryIds] = useState(() => new Set());
  const [activePeriodIds,   setActivePeriodIds]   = useState(() => new Set());

  const filteredLocations = useFilteredLocations(locationsData, {
    searchText,
    categoryIds: activeCategoryIds,
    periodIds: activePeriodIds,
  });

  const selectedLocation = useMemo(
    () => locationsData.find((l) => l.id === selectedId) ?? null,
    [selectedId]
  );

  const visibleSelectedId = useMemo(
    () => filteredLocations.some((l) => l.id === selectedId) ? selectedId : null,
    [filteredLocations, selectedId]
  );

  /* ── Landing → Transition ──────────────────────────────── */
  const handleEnterMap = useCallback(() => {
    setAppPhase("transitioning");
  }, []);

  /* ── Transition → Map ──────────────────────────────────── */
  const handleTransitionComplete = useCallback(() => {
    setAppPhase("map");
  }, []);

  const isMapPhase = appPhase === "map";
  const isTransitioning = appPhase === "transitioning";

  return (
    <div className="app">
      {/* ── Full-screen map (always mounted for preloading, hidden during landing) ── */}
      <MapView
        locations={filteredLocations}
        selectedId={visibleSelectedId}
        onSelectLocation={(id) => setSelectedId((prev) => prev === id ? null : id)}
        visible={isMapPhase}
      />

      {/* ── Glass search + category filter ─────────────────────────── */}
      <SearchFilterBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        activeCategoryIds={activeCategoryIds}
        onToggleCategory={(id) => setActiveCategoryIds((prev) => toggleInSet(prev, id))}
        visible={isMapPhase}
      />

      {/* ── Brand card ──────────────────────────────────────────────── */}
      <Header
        locationCount={filteredLocations.length}
        visible={isMapPhase}
      />

      {/* ── Period timeline dock ─────────────────────────────────────── */}
      <div
        className="timeline-dock"
        style={{
          opacity: isMapPhase ? 1 : 0,
          transform: isMapPhase ? "translateY(0)" : "translateY(80px)",
          transition: "opacity 0.6s ease 0.2s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          pointerEvents: isMapPhase ? "auto" : "none",
        }}
      >
        <Timeline
          activePeriodIds={activePeriodIds}
          onTogglePeriod={(id) => setActivePeriodIds((prev) => toggleInSet(prev, id))}
          visible={isMapPhase}
        />
      </div>

      {/* ── Maximalist detail panel ──────────────────────────────────── */}
      <InfoPanel
        location={visibleSelectedId ? selectedLocation : null}
        onClose={() => setSelectedId(null)}
      />

      {/* ── Liquid glass transition overlay ───────────────────────── */}
      <MapTransition
        active={isTransitioning}
        onComplete={handleTransitionComplete}
      />

      {/* ── Landing page (topmost layer) ─────────────────────────── */}
      {(appPhase === "landing" || appPhase === "transitioning") && (
        <div
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "scale(1.05)" : "scale(1)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            position: "fixed",
            inset: 0,
            zIndex: 100,
          }}
        >
          <LandingPage
            onEnterMap={handleEnterMap}
            locationCount={filteredLocations.length}
          />
        </div>
      )}
    </div>
  );
}

export default App;
