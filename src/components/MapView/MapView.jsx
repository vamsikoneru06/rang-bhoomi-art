import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMarkerHtml } from "./markerIcons.js";
import { getCategory } from "../../data/categories.js";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const INDIA_CENTER = [22.5, 80.5];
const INDIA_BOUNDS = [
  [6.0, 62.0],
  [38.5, 100.0],
];

function buildIcon(location, selectedId) {
  const isSelected = location.id === selectedId;
  const isDimmed = selectedId !== null && !isSelected;
  return L.divIcon({
    html: getMarkerHtml(location.category, {
      isSelected,
      isDimmed,
      name: location.name,
    }),
    className: "leaflet-marker-clean",
    iconSize: isSelected ? [52, 60] : [42, 50],
    iconAnchor: isSelected ? [26, 56] : [21, 46],
    popupAnchor: [0, -50],
  });
}

/* Syncs map instance to a ref so parent can read it */
function MapController({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

/* Flies to selected location */
function FlyToSelection({ locations, selectedId }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    map.flyTo(loc.coordinates, Math.max(map.getZoom(), 7), {
      duration: 0.7,
      easeLinearity: 0.25,
    });
  }, [selectedId, locations, map]);
  return null;
}

/* Individual ripple circle */
function Ripple({ x, y, color, onDone }) {
  return (
    <motion.div
      className="map-ripple-origin"
      style={{ left: x, top: y }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
      onAnimationComplete={onDone}
    >
      {/* Wave 1 */}
      <motion.div
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: `2.5px solid ${color ?? "#b5432c"}`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ width: 0, height: 0, opacity: 0.9 }}
        animate={{ width: 120, height: 120, opacity: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      />
      {/* Wave 2 – delayed */}
      <motion.div
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: `1.5px solid ${color ?? "#b5432c"}`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ width: 0, height: 0, opacity: 0.6 }}
        animate={{ width: 180, height: 180, opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.12 }}
      />
      {/* Fill pulse */}
      <motion.div
        style={{
          position: "absolute",
          borderRadius: "50%",
          background: color ?? "#b5432c",
          transform: "translate(-50%, -50%)",
        }}
        initial={{ width: 18, height: 18, opacity: 0.55 }}
        animate={{ width: 60, height: 60, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
    </motion.div>
  );
}

export default function MapView({ locations, selectedId, onSelectLocation }) {
  const mapRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  const removeRipple = useCallback((id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleMarkerClick = useCallback(
    (location) => {
      /* Compute ripple origin from map pixel coordinates */
      if (mapRef.current) {
        const pt = mapRef.current.latLngToContainerPoint(location.coordinates);
        const category = getCategory(location.category);
        const rippleId = Date.now() + Math.random();
        setRipples((prev) => [
          ...prev,
          {
            id: rippleId,
            x: pt.x,
            y: pt.y,
            color: category?.color ?? "#b5432c",
          },
        ]);
      }
      onSelectLocation(location.id);
    },
    [onSelectLocation]
  );

  /* Rebuild icons whenever selection changes */
  const icons = useMemo(() => {
    const m = new Map();
    for (const loc of locations) {
      m.set(loc.id, buildIcon(loc, selectedId));
    }
    return m;
  }, [locations, selectedId]);

  return (
    <div className="map-view" style={{ position: "absolute", inset: 0 }}>
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={12}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.85}
        scrollWheelZoom
        zoomControl={false}
      >
        <MapController mapRef={mapRef} />
        <FlyToSelection locations={locations} selectedId={selectedId} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={loc.coordinates}
            icon={icons.get(loc.id)}
            eventHandlers={{
              click: () => handleMarkerClick(loc),
            }}
          />
        ))}
      </MapContainer>

      {/* Ripple overlay layer — sits above Leaflet, below UI */}
      <div className="map-ripple-layer">
        <AnimatePresence>
          {ripples.map((r) => (
            <Ripple
              key={r.id}
              x={r.x}
              y={r.y}
              color={r.color}
              onDone={() => removeRipple(r.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
