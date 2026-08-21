import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { getMarkerHtml } from "./markerIcons.js";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const INDIA_CENTER = [22.5, 80];
const INDIA_BOUNDS = [
  [6.5, 65.0],
  [37.5, 99.0],
];

function buildIcon(categoryId, isSelected) {
  return L.divIcon({
    html: getMarkerHtml(categoryId),
    className: isSelected ? "category-marker-wrapper is-selected" : "category-marker-wrapper",
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32],
  });
}

function FlyToSelection({ locations, selectedId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const location = locations.find((item) => item.id === selectedId);
    if (!location) return;
    map.flyTo(location.coordinates, Math.max(map.getZoom(), 6), { duration: 0.6 });
  }, [selectedId, locations, map]);

  return null;
}

export default function MapView({ locations, selectedId, onSelectLocation }) {
  const icons = useMemo(() => {
    const map = new Map();
    for (const location of locations) {
      map.set(location.id, buildIcon(location.category, location.id === selectedId));
    }
    return map;
  }, [locations, selectedId]);

  return (
    <div className="map-view">
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={4}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={0.8}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToSelection locations={locations} selectedId={selectedId} />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.coordinates}
            icon={icons.get(location.id)}
            eventHandlers={{ click: () => onSelectLocation(location.id) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
