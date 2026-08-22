import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap.js";
import { animate, stagger } from "animejs";
import { getCategory } from "../../data/categories.js";
import { getPreviewUrl, getSrcSet } from "../../lib/imageUrls.js";
import "./PinPreviewCard.css";

export default function PinPreviewCard({ location, x, y, onSelect }) {
  const cardRef    = useRef(null);
  const innerRef   = useRef(null);
  const imgRef     = useRef(null);
  const shimmerRef = useRef(null);
  const category   = getCategory(location.category);
  const catColor   = category?.color ?? "#b5432c";

  /* ── Optimized image URLs ──────────────────────────────── */
  const previewSrc = location.heroImage ? getPreviewUrl(location.heroImage) : null;
  const srcSet     = location.heroImage ? getSrcSet(location.heroImage) : "";

  /* ── Entry: GSAP scale-pop + anime.js shimmer + staggered text ── */
  useEffect(() => {
    const card  = cardRef.current;
    const inner = innerRef.current;
    if (!card || !inner) return;

    // GSAP: card pops up from the pin below
    gsap.fromTo(
      card,
      { scaleX: 0.55, scaleY: 0.35, opacity: 0, transformOrigin: "50% 108%" },
      { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.46, ease: "back.out(2.4)" }
    );

    // GSAP: hero image wipes in from the bottom (clip-path)
    if (imgRef.current) {
      gsap.fromTo(
        imgRef.current,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, delay: 0.1, ease: "power3.out" }
      );
    }

    // anime.js v4: shimmer light sweep left → right
    if (shimmerRef.current) {
      animate(shimmerRef.current, {
        translateX: ["-110%", "210%"],
        duration: 680,
        delay: 220,
        ease: "inOutSine",
      });
    }

    // anime.js v4: staggered text lines reveal
    const textEls = card.querySelectorAll(".pin-card-name, .pin-card-meta, .pin-card-cta");
    if (textEls.length) {
      animate(textEls, {
        opacity: [0, 1],
        translateY: [10, 0],
        delay: stagger(60, { start: 240 }),
        duration: 320,
        ease: "outCubic",
      });
    }
  }, [location.id]);

  /* ── Click exit: anime.js punch → shrink → gone ── */
  function handleClick() {
    const card = cardRef.current;
    if (!card) { onSelect(); return; }

    // anime.js v4 keyframes
    animate(card, {
      keyframes: [
        { scale: 1.08, duration: 80 },
        { scale: 0.85, opacity: 0.7, duration: 100 },
        { scale: 0, opacity: 0, translateY: 18, duration: 200 },
      ],
      ease: "inCubic",
      onComplete() { onSelect(); },
    });
  }

  /* ── Hover lift ── */
  function handleMouseEnter() {
    gsap.to(innerRef.current, { y: -3, scale: 1.015, duration: 0.22, ease: "power2.out" });
    /* Image subtle zoom */
    if (imgRef.current) {
      gsap.to(imgRef.current, { scale: 1.06, duration: 0.4, ease: "power2.out" });
    }
  }
  function handleMouseLeave() {
    gsap.to(innerRef.current, { y: 0, scale: 1, duration: 0.22, ease: "power2.out" });
    if (imgRef.current) {
      gsap.to(imgRef.current, { scale: 1, duration: 0.4, ease: "power2.out" });
    }
  }

  return (
    <div
      ref={cardRef}
      className="pin-card"
      style={{
        position: "absolute",
        left: x,
        top: y - 56,
        transform: "translate(-50%, -100%)",
        "--cat-color": catColor,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={innerRef} className="pin-card-inner">
        {/* ── Hero image ── */}
        <div className="pin-card-img-wrap">
          {previewSrc ? (
            <img
              ref={imgRef}
              className="pin-card-img"
              src={previewSrc}
              srcSet={srcSet}
              sizes="224px"
              alt={location.name}
              loading="lazy"
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: catColor, opacity: 0.4 }} />
          )}
          <div ref={shimmerRef} className="pin-card-shimmer" />
          <div className="pin-card-img-overlay" />
          <div className="pin-card-badge">
            <span className="pin-card-dot" />
            {category?.label}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="pin-card-body">
          <p className="pin-card-name">{location.name}</p>
          <p className="pin-card-meta">{location.state} · {location.tradition}</p>
          <div className="pin-card-cta">
            Explore <span className="pin-card-cta-arrow">→</span>
          </div>
        </div>
      </div>

      {/* Arrow tip pointing down to the pin */}
      <div className="pin-card-arrow" />
    </div>
  );
}
