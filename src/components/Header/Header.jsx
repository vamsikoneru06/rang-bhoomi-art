import { useEffect, useRef } from "react";
import { gsap, TextPlugin } from "../../lib/gsap.js";
import "./Header.css";

export default function Header({ locationCount, visible = true }) {
  const headerRef = useRef(null);
  const countRef = useRef(null);
  const prevCount = useRef(locationCount);

  /* ── Slide-in entry animation when visible becomes true ─── */
  useEffect(() => {
    if (!headerRef.current) return;
    if (visible) {
      gsap.fromTo(
        headerRef.current,
        { x: -120, opacity: 0, scale: 0.92 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.4)",
          delay: 0.3,
          clearProps: "transform,opacity",
        }
      );
    }
  }, [visible]);

  /* ── Animate location count number changes ─────────────── */
  useEffect(() => {
    if (!countRef.current || prevCount.current === locationCount) return;
    const from = prevCount.current;
    prevCount.current = locationCount;

    const proxy = { val: from };
    gsap.to(proxy, {
      val: locationCount,
      duration: 0.6,
      ease: "power2.out",
      snap: { val: 1 },
      onUpdate() {
        if (countRef.current) {
          countRef.current.textContent = `${Math.round(proxy.val)} locations on the map`;
        }
      },
    });

    /* Bounce the counter on change */
    gsap.fromTo(
      countRef.current,
      { scale: 1.2, color: "#b5432c" },
      { scale: 1, color: "", duration: 0.4, ease: "back.out(2)" }
    );
  }, [locationCount]);

  /* ── Hover micro-interaction ───────────────────────────── */
  function handleMouseEnter() {
    gsap.to(headerRef.current, {
      y: -2,
      boxShadow: "0 12px 40px rgba(43, 33, 24, 0.18), 0 4px 12px rgba(43, 33, 24, 0.1)",
      duration: 0.25,
      ease: "power2.out",
    });
  }

  function handleMouseLeave() {
    gsap.to(headerRef.current, {
      y: 0,
      boxShadow: "",
      duration: 0.25,
      ease: "power2.out",
      clearProps: "boxShadow",
    });
  }

  return (
    <div
      ref={headerRef}
      className="app-header glass glass-card"
      style={{ opacity: visible ? undefined : 0, pointerEvents: visible ? "auto" : "none" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h1>Rang Bhoomi</h1>
      <p className="app-header-sub">An interactive map of Indian art history</p>
      <span ref={countRef} className="app-header-count">
        {locationCount} locations on the map
      </span>
    </div>
  );
}
