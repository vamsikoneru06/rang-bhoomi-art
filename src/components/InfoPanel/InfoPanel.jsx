import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap, SplitText, ScrambleTextPlugin } from "../lib/gsap.js";
import { getCategory } from "../../data/categories.js";
import Gallery from "./Gallery.jsx";
import "./InfoPanel.css";

const panelVariants = {
  hidden:  (m) => ({ x: m ? 0 : "100%", y: m ? "100%" : 0, opacity: 0 }),
  visible: {
    x: 0, y: 0, opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 30, mass: 0.8 },
  },
  exit: (m) => ({
    x: m ? 0 : "100%", y: m ? "100%" : 0, opacity: 0,
    transition: { type: "tween", duration: 0.26, ease: "easeIn" },
  }),
};

function SectionHeader({ label }) {
  return (
    <div className="info-section-header">
      <h3>{label}</h3>
      <div className="info-section-line" />
    </div>
  );
}

function PanelContent({ location, category, catColor }) {
  const titleRef   = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    if (!location || !titleRef.current || !historyRef.current) return;

    /* ── SplitText: title chars stagger in ─────────────── */
    const split = new SplitText(titleRef.current, { type: "chars,words" });
    const tl = gsap.timeline({ delay: 0.28 });
    tl.from(split.chars, {
      opacity: 0,
      y: 28,
      rotationX: -80,
      transformOrigin: "50% 50% -12px",
      stagger: { each: 0.038, ease: "power2.inOut" },
      duration: 0.5,
      ease: "back.out(1.6)",
    });

    /* ── ScrambleText: history paragraph ────────────────── */
    const scrambleTl = gsap.timeline({ delay: 0.55 });
    scrambleTl.to(historyRef.current, {
      duration: 2.0,
      scrambleText: {
        text: location.historicalContext,
        chars: "अआइईउऊकखगघचछजझटठडढतथदधनपफबभमयरलवशषसह",
        revealDelay: 0.35,
        speed: 0.38,
        newClass: "scramble-char",
      },
    });

    return () => {
      tl.kill();
      scrambleTl.kill();
      split.revert();
    };
  }, [location?.id]);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <div
        className="info-hero"
        style={{ "--hero-gradient": `linear-gradient(160deg, ${catColor}cc, ${catColor}33)` }}
      >
        {location.heroImage && (
          <img
            className="info-hero-img"
            src={location.heroImage.replace("1280px-", "1920px-")}
            srcSet={`${location.heroImage.replace("1280px-","1280px-")} 1280w, ${location.heroImage.replace("1280px-","1920px-")} 1920w`}
            sizes="(max-width: 640px) 100vw, 460px"
            alt={location.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="info-hero-text">
          <div className="info-category-badge">
            <span className="info-category-dot" />
            {category?.label}
          </div>
          {/* SplitText target — rendered with location name so revert() restores it */}
          <h2 className="info-hero-title" ref={titleRef}>{location.name}</h2>
          <p className="info-hero-meta">
            {location.state} &nbsp;·&nbsp; {location.tradition}
          </p>
        </div>
      </div>

      {/* ── Scrollable body ────────────────────────────── */}
      <div className="info-body">
        <div className="info-period">{location.periodLabel}</div>

        <div className="info-section">
          <SectionHeader label="Historical Context" />
          {/* ScrambleText target — must have initial text present for GSAP */}
          <p className="info-context" ref={historyRef}>{location.historicalContext}</p>
        </div>

        <div className="info-section">
          <SectionHeader label="Art Forms" />
          <ul className="artforms-list">
            {location.artForms.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>

        <div className="info-section">
          <SectionHeader label="Artists" />
          <ul className="info-list">
            {location.artists.map((a) => (
              <li key={a.name}><strong>{a.name}</strong>{a.note}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <SectionHeader label="Featured Artworks" />
          <ul className="info-list">
            {location.artworks.map((a) => (
              <li key={a.title}><strong>{a.title}</strong>{a.note}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <SectionHeader label="Why It Matters" />
          <blockquote className="info-significance">{location.significance}</blockquote>
        </div>

        {location.images?.length > 0 && (
          <div className="info-section">
            <SectionHeader label="Gallery" />
            <Gallery images={location.images} categoryId={location.category} />
          </div>
        )}
      </div>
    </>
  );
}

export default function InfoPanel({ location, onClose }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
  const category = location ? getCategory(location.category) : null;
  const catColor  = category?.color ?? "var(--color-accent)";

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
          <button
            type="button"
            className="info-close"
            onClick={onClose}
            aria-label="Close panel"
          >✕</button>

          <PanelContent location={location} category={category} catColor={catColor} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
