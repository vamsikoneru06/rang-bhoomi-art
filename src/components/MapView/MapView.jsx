import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap, Flip } from "../../lib/gsap.js";
import { animate, stagger } from "animejs";
import { getMarkerHtml } from "./markerIcons.js";
import { getCategory } from "../../data/categories.js";
import PinPreviewCard from "../PinPreviewCard/PinPreviewCard.jsx";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const INDIA_CENTER = [22.5, 80.5];
const INDIA_BOUNDS = [[6.0, 62.0], [38.5, 100.0]];

const MAP_STYLES = {
  paper: {
    label: "Paper",
    hint: "Museum map",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  terrain: {
    label: "Terrain",
    hint: "Relief & roads",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  satellite: {
    label: "Satellite",
    hint: "Aerial view",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
  },
};

function buildIcon(location, selectedId) {
  const isSelected = location.id === selectedId;
  const isDimmed   = selectedId !== null && !isSelected;
  return L.divIcon({
    html: getMarkerHtml(location.category, { isSelected, isDimmed, name: location.name }),
    className: "leaflet-marker-clean",
    iconSize:   isSelected ? [52, 60] : [42, 50],
    iconAnchor: isSelected ? [26, 56] : [21, 46],
  });
}

function MapController({ mapRef }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

function FlyToSelection({ locations, selectedId }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    map.flyTo(loc.coordinates, Math.max(map.getZoom(), 7), { duration: 0.7 });
  }, [selectedId, locations, map]);
  return null;
}

/* ── Engineered click burst — GSAP DrawSVG + anime.js v4 starburst ── */
function ClickEffect({ x, y, color, onDone }) {
  const wrapRef   = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    /* GSAP: DrawSVGPlugin traces a circle stroke around the click point */
    gsap.set(circleRef.current, { drawSVG: "0%" });
    gsap.to(circleRef.current, { drawSVG: "100%", duration: 0.62, ease: "power2.out" });
    gsap.to(circleRef.current, { opacity: 0, duration: 0.28, delay: 0.78 });

    /* anime.js v4: 8 dots burst radially outward */
    const dots = wrap.querySelectorAll(".burst-dot");
    animate(dots, {
      translateX: (el, i) => Math.cos(i * Math.PI / 4) * 54,
      translateY: (el, i) => Math.sin(i * Math.PI / 4) * 54,
      scale: [2.4, 0],
      opacity: [1, 0],
      duration: 580,
      delay: stagger(20),
      ease: "outExpo",
    });

    /* anime.js v4: outer ring expands and fades */
    animate(wrap.querySelector(".anime-ring"), {
      scale: [0.3, 3.4],
      opacity: [0.65, 0],
      duration: 720,
      ease: "outCirc",
    });

    /* anime.js v4: inner fill flash, calls onDone when complete */
    animate(wrap.querySelector(".anime-fill"), {
      scale: [0, 2.6],
      opacity: [0.6, 0],
      duration: 430,
      ease: "outQuart",
      onComplete: onDone,
    });
  }, []);

  const DOT_COUNT = 8;
  const DOT_R = 4; // radius in px for centering

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 500,
      }}
    >
      {/* anime.js starburst dots — centered with negative margins */}
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <div
          key={i}
          className="burst-dot"
          style={{
            position: "absolute",
            width: DOT_R * 2,
            height: DOT_R * 2,
            borderRadius: "50%",
            background: color ?? "#b5432c",
            left: "50%",
            top: "50%",
            marginLeft: -DOT_R,
            marginTop: -DOT_R,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* anime.js outer ring — 44×44, centered */}
      <div
        className="anime-ring"
        style={{
          position: "absolute",
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `2px solid ${color ?? "#b5432c"}`,
          left: "50%",
          top: "50%",
          marginLeft: -22,
          marginTop: -22,
          opacity: 0.65,
        }}
      />

      {/* anime.js inner fill flash — 22×22, centered */}
      <div
        className="anime-fill"
        style={{
          position: "absolute",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: color ?? "#b5432c",
          left: "50%",
          top: "50%",
          marginLeft: -11,
          marginTop: -11,
          opacity: 0.6,
        }}
      />

      {/* GSAP DrawSVG circle stroke — SVG centered at origin */}
      <svg
        style={{ position: "absolute", left: "50%", top: "50%", overflow: "visible" }}
        width="0"
        height="0"
      >
        <circle
          ref={circleRef}
          cx="0"
          cy="0"
          r="40"
          fill="none"
          stroke={color ?? "#b5432c"}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ── Main MapView ─────────────────────────────────────────────── */
export default function MapView({ locations, selectedId, onSelectLocation, visible = true }) {
  const mapRef       = useRef(null);
  const [effects,    setEffects]    = useState([]);
  const [hoveredLoc, setHoveredLoc] = useState(null);
  const [hoverPos,   setHoverPos]   = useState({ x: 0, y: 0 });
  const [mapStyle,   setMapStyle]   = useState("paper");
  const [pinsReady,  setPinsReady]  = useState(false);
  const styleControlRef = useRef(null);

  const removeEffect = useCallback((id) => {
    setEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /* Dismiss hover card when a panel opens */
  useEffect(() => {
    if (selectedId) setHoveredLoc(null);
  }, [selectedId]);

  /* ── Pin drop-in animation when map becomes visible ──── */
  useEffect(() => {
    if (!visible || pinsReady) return;
    // Give the map a moment to render markers
    const timer = setTimeout(() => {
      const container = document.querySelector(".leaflet-marker-pane");
      if (container) {
        const pins = container.querySelectorAll(".leaflet-marker-icon");
        gsap.fromTo(
          pins,
          { y: -40, opacity: 0, scale: 0.5 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.8)",
            stagger: { each: 0.04, from: "random" },
            clearProps: "transform,opacity",
          }
        );
      }
      setPinsReady(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [visible, pinsReady]);

  const handleMarkerHover = useCallback((location) => {
    if (!mapRef.current || selectedId) return;
    if (!location) { setHoveredLoc(null); return; }
    const pt = mapRef.current.latLngToContainerPoint(location.coordinates);
    setHoverPos({ x: pt.x, y: pt.y });
    setHoveredLoc(location);
  }, [selectedId]);

  const handleMarkerClick = useCallback((location) => {
    setHoveredLoc(null);
    if (mapRef.current) {
      const pt  = mapRef.current.latLngToContainerPoint(location.coordinates);
      const cat = getCategory(location.category);
      setEffects((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), x: pt.x, y: pt.y, color: cat?.color ?? "#b5432c" },
      ]);
    }
    onSelectLocation(location.id);
  }, [onSelectLocation]);

  /* ── Basemap switcher click with GSAP Flip ─────────────── */
  function handleMapStyleChange(id) {
    if (!styleControlRef.current || id === mapStyle) return;

    /* Capture state before change */
    const state = Flip.getState(
      styleControlRef.current.querySelectorAll(".map-style-option"),
      { props: "background,border-color,color" }
    );

    setMapStyle(id);

    /* Animate the FLIP */
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.35,
        ease: "power2.inOut",
        scale: true,
      });

      /* Bounce the selected option */
      const active = styleControlRef.current.querySelector(`[data-style-id="${id}"]`);
      if (active) {
        gsap.from(active, { scale: 0.9, duration: 0.35, ease: "back.out(2)" });
      }
    });
  }

  /* ── Basemap option hover ──────────────────────────────── */
  function handleStyleHover(e) {
    gsap.to(e.currentTarget, {
      y: -2,
      scale: 1.04,
      boxShadow: "0 6px 16px rgba(43, 33, 24, 0.15)",
      duration: 0.22,
      ease: "power2.out",
    });
  }

  function handleStyleLeave(e) {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      boxShadow: "",
      duration: 0.22,
      ease: "power2.out",
      clearProps: "boxShadow",
    });
  }

  const icons = useMemo(() => {
    const m = new Map();
    for (const loc of locations) m.set(loc.id, buildIcon(loc, selectedId));
    return m;
  }, [locations, selectedId]);

  return (
    <div className={`map-view map-view--${mapStyle}`} style={{ position: "absolute", inset: 0 }}>
      <MapContainer
        center={INDIA_CENTER} zoom={5} minZoom={4} maxZoom={12}
        maxBounds={INDIA_BOUNDS} maxBoundsViscosity={0.85}
        scrollWheelZoom zoomControl={false}
      >
        <MapController mapRef={mapRef} />
        <FlyToSelection locations={locations} selectedId={selectedId} />
        <TileLayer
          key={mapStyle}
          attribution={MAP_STYLES[mapStyle].attribution}
          url={MAP_STYLES[mapStyle].url}
        />
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={loc.coordinates}
            icon={icons.get(loc.id)}
            eventHandlers={{
              click:     () => handleMarkerClick(loc),
              mouseover: () => handleMarkerHover(loc),
              mouseout:  () => handleMarkerHover(null),
            }}
          />
        ))}
      </MapContainer>

      <div
        ref={styleControlRef}
        className="map-style-control glass glass-card"
        aria-label="Choose a map view"
      >
        <div className="map-style-heading">
          <span className="map-style-kicker">Basemap</span>
          <span className="map-style-scope">Every period</span>
        </div>
        <div className="map-style-options" role="group" aria-label="Map view options">
          {Object.entries(MAP_STYLES).map(([id, style]) => {
            const isActive = mapStyle === id;
            return (
              <button
                key={id}
                type="button"
                data-style-id={id}
                className={`map-style-option${isActive ? " is-active" : ""}`}
                aria-pressed={isActive}
                aria-label={`${style.label}: ${style.hint}`}
                title={style.hint}
                onClick={() => handleMapStyleChange(id)}
                onMouseEnter={handleStyleHover}
                onMouseLeave={handleStyleLeave}
              >
                <span className={`map-style-swatch map-style-swatch--${id}`} aria-hidden="true" />
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Overlay: click burst effects + hover preview card ── */}
      <div className="map-ripple-layer">
        {effects.map((e) => (
          <ClickEffect
            key={e.id}
            x={e.x}
            y={e.y}
            color={e.color}
            onDone={() => removeEffect(e.id)}
          />
        ))}

        {hoveredLoc && !selectedId && (
          <PinPreviewCard
            key={hoveredLoc.id}
            location={hoveredLoc}
            x={hoverPos.x}
            y={hoverPos.y}
            onSelect={() => handleMarkerClick(hoveredLoc)}
          />
        )}
      </div>
    </div>
  );
}
