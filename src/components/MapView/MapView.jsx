import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap, DrawSVGPlugin } from "../lib/gsap.js";
import { getMarkerHtml } from "./markerIcons.js";
import { getCategory } from "../../data/categories.js";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const INDIA_CENTER = [22.5, 80.5];
const INDIA_BOUNDS = [[6.0, 62.0], [38.5, 100.0]];

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
    map.flyTo(loc.coordinates, Math.max(map.getZoom(), 7), { duration: 0.7, easeLinearity: 0.25 });
  }, [selectedId, locations, map]);
  return null;
}

/* ── Framer Motion + GSAP DrawSVG circle per ripple ── */
function Ripple({ x, y, color, onDone }) {
  const circleRef = useRef(null);

  useEffect(() => {
    if (!circleRef.current) return;
    /* DrawSVGPlugin: stroke draws from 0% to 100% then vanishes */
    gsap.set(circleRef.current, { drawSVG: "0%" });
    gsap.to(circleRef.current, {
      drawSVG: "100%",
      duration: 0.65,
      ease: "power2.out",
    });
    gsap.to(circleRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.8,
    });
  }, []);

  return (
    <div
      className="map-ripple-origin"
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}
    >
      {/* GSAP DrawSVG circle */}
      <svg
        style={{ position: "absolute", transform: "translate(-50%,-50%)", overflow: "visible" }}
        width="0" height="0" viewBox="0 0 0 0"
      >
        <circle
          ref={circleRef}
          cx="0" cy="0" r="36"
          fill="none"
          stroke={color ?? "#b5432c"}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Framer Motion concentric waves */}
      {[0, 0.12, 0.24].map((delay, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            border: `${2 - i * 0.5}px solid ${color ?? "#b5432c"}`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 - i * 0.15 }}
          animate={{ width: 140 + i * 50, height: 140 + i * 50, opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeOut", delay }}
        />
      ))}

      {/* Fill pulse */}
      <motion.div
        style={{
          position: "absolute",
          borderRadius: "50%",
          background: color ?? "#b5432c",
          transform: "translate(-50%,-50%)",
        }}
        initial={{ width: 20, height: 20, opacity: 0.6 }}
        animate={{ width: 70, height: 70, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        onAnimationComplete={onDone}
      />
    </div>
  );
}

export default function MapView({ locations, selectedId, onSelectLocation, burstRef }) {
  const mapRef   = useRef(null);
  const [ripples, setRipples] = useState([]);

  const removeRipple = useCallback((id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleMarkerClick = useCallback((location) => {
    if (mapRef.current) {
      const pt  = mapRef.current.latLngToContainerPoint(location.coordinates);
      const cat = getCategory(location.category);
      const id  = Date.now() + Math.random();

      setRipples((prev) => [...prev, { id, x: pt.x, y: pt.y, color: cat?.color ?? "#b5432c" }]);

      /* Trigger Three.js particle burst */
      if (burstRef?.current) {
        burstRef.current(pt.x, pt.y, cat?.color ?? "#b5432c");
      }
    }
    onSelectLocation(location.id);
  }, [onSelectLocation, burstRef]);

  const icons = useMemo(() => {
    const m = new Map();
    for (const loc of locations) m.set(loc.id, buildIcon(loc, selectedId));
    return m;
  }, [locations, selectedId]);

  return (
    <div className="map-view" style={{ position: "absolute", inset: 0 }}>
      <MapContainer
        center={INDIA_CENTER} zoom={5} minZoom={4} maxZoom={12}
        maxBounds={INDIA_BOUNDS} maxBoundsViscosity={0.85}
        scrollWheelZoom zoomControl={false}
      >
        <MapController mapRef={mapRef} />
        <FlyToSelection locations={locations} selectedId={selectedId} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={loc.coordinates}
            icon={icons.get(loc.id)}
            eventHandlers={{ click: () => handleMarkerClick(loc) }}
          />
        ))}
      </MapContainer>

      {/* Ripple + DrawSVG overlay */}
      <div className="map-ripple-layer">
        <AnimatePresence>
          {ripples.map((r) => (
            <Ripple key={r.id} x={r.x} y={r.y} color={r.color} onDone={() => removeRipple(r.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
