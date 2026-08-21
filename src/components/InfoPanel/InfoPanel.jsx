import { AnimatePresence, motion } from "framer-motion";
import { getCategory } from "../../data/categories.js";
import Gallery from "./Gallery.jsx";
import "./InfoPanel.css";

const panelVariants = {
  hidden: (isMobile) => ({
    x: isMobile ? 0 : "100%",
    y: isMobile ? "100%" : 0,
    opacity: 0,
  }),
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  exit: (isMobile) => ({
    x: isMobile ? 0 : "100%",
    y: isMobile ? "100%" : 0,
    opacity: 0,
    transition: { type: "tween", duration: 0.28, ease: "easeIn" },
  }),
};

const childVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function SectionHeader({ label }) {
  return (
    <div className="info-section-header">
      <h3>{label}</h3>
      <div className="info-section-line" />
    </div>
  );
}

export default function InfoPanel({ location, onClose }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
  const category = location ? getCategory(location.category) : null;
  const catColor = category?.color ?? "var(--color-accent)";

  return (
    <AnimatePresence>
      {location && (
        <motion.div
          key={location.id}
          className="info-panel"
          style={{ "--cat-color": catColor }}
          custom={isMobile}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-label={`${location.name} details`}
        >
          {/* ── Close button ──────────────────────────────── */}
          <button
            type="button"
            className="info-close"
            onClick={onClose}
            aria-label="Close panel"
          >
            ✕
          </button>

          {/* ── Hero image ────────────────────────────────── */}
          <div
            className="info-hero"
            style={{
              "--hero-gradient": `linear-gradient(160deg, ${catColor}cc, ${catColor}44)`,
            }}
          >
            {location.heroImage && (
              <img
                className="info-hero-img"
                src={location.heroImage}
                alt={location.name}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <div className="info-hero-text">
              <div className="info-category-badge">
                <span className="info-category-dot" />
                {category?.label}
              </div>
              <h2 className="info-hero-title">{location.name}</h2>
              <p className="info-hero-meta">
                {location.state} &nbsp;·&nbsp; {location.tradition}
              </p>
            </div>
          </div>

          {/* ── Scrollable body ───────────────────────────── */}
          <div className="info-body">

            <motion.div variants={childVariants}>
              <div className="info-period">{location.periodLabel}</div>
            </motion.div>

            {/* Historical context */}
            <motion.div variants={childVariants} className="info-section">
              <SectionHeader label="Historical Context" />
              <p className="info-context">{location.historicalContext}</p>
            </motion.div>

            {/* Art forms */}
            <motion.div variants={childVariants} className="info-section">
              <SectionHeader label="Art Forms" />
              <ul className="artforms-list">
                {location.artForms.map((form) => (
                  <li key={form}>{form}</li>
                ))}
              </ul>
            </motion.div>

            {/* Artists */}
            <motion.div variants={childVariants} className="info-section">
              <SectionHeader label="Artists" />
              <ul className="info-list">
                {location.artists.map((artist) => (
                  <li key={artist.name}>
                    <strong>{artist.name}</strong>
                    {artist.note}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Featured artworks */}
            <motion.div variants={childVariants} className="info-section">
              <SectionHeader label="Featured Artworks" />
              <ul className="info-list">
                {location.artworks.map((artwork) => (
                  <li key={artwork.title}>
                    <strong>{artwork.title}</strong>
                    {artwork.note}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Significance */}
            <motion.div variants={childVariants} className="info-section">
              <SectionHeader label="Why It Matters" />
              <blockquote className="info-significance">
                {location.significance}
              </blockquote>
            </motion.div>

            {/* Gallery */}
            {location.images?.length > 0 && (
              <motion.div variants={childVariants} className="info-section">
                <SectionHeader label="Gallery" />
                <Gallery images={location.images} categoryId={location.category} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
