import "./Header.css";

export default function Header({ locationCount }) {
  return (
    <div className="app-header glass glass-card">
      <h1>Rang Bhoomi</h1>
      <p className="app-header-sub">An interactive map of Indian art history</p>
      <span className="app-header-count">{locationCount} locations on the map</span>
    </div>
  );
}
