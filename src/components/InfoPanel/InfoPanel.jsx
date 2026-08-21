import { AnimatePresence, motion } from "framer-motion";
import { getCategory } from "../../data/categories.js";
import Gallery from "./Gallery.jsx";
import "./InfoPanel.css";

export default function InfoPanel({ location, onClose }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

  return (
    <AnimatePresence>
      {location && (
        <motion.aside
          className="info-panel"
          style={{ "--chip-color": getCategory(location.category)?.color }}
          initial={isMobile ? { y: "100%" } : { x: "100%" }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: "100%" } : { x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          aria-label={`${location.name} details`}
        >
          <button type="button" className="info-panel-close" onClick={onClose} aria-label="Close panel">
            ×
          </button>

          <p className="info-panel-eyebrow">{getCategory(location.category)?.label}</p>
          <h2>{location.name}</h2>
          <p className="info-panel-meta">
            {location.state} · {location.tradition}
            <br />
            {location.periodLabel}
          </p>

          <section>
            <h3>Historical Context</h3>
            <p>{location.historicalContext}</p>
          </section>

          <section>
            <h3>Art Forms</h3>
            <ul>
              {location.artForms.map((form) => (
                <li key={form}>{form}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Artists</h3>
            <ul>
              {location.artists.map((artist) => (
                <li key={artist.name}>
                  <strong>{artist.name}</strong> — {artist.note}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Featured Artworks</h3>
            <ul>
              {location.artworks.map((artwork) => (
                <li key={artwork.title}>
                  <strong>{artwork.title}</strong> — {artwork.note}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Why It Matters</h3>
            <p>{location.significance}</p>
          </section>

          <section>
            <h3>Gallery</h3>
            <Gallery images={location.images} categoryId={location.category} />
          </section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
