import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap.js";
import { animate } from "animejs";
import { CATEGORIES } from "../../data/categories.js";
import "./SearchFilterBar.css";

function hexToRgb(cssColor) {
  const map = {
    "var(--color-classical-art)":      "166,67,44",
    "var(--color-folk-art)":           "199,124,31",
    "var(--color-miniature-painting)": "91,58,142",
    "var(--color-temple-art)":         "138,109,27",
    "var(--color-modern-art)":         "31,111,111",
    "var(--color-tribal-art)":         "122,139,60",
  };
  return map[cssColor] ?? "181,67,44";
}

export default function SearchFilterBar({
  searchText, onSearchTextChange,
  activeCategoryIds, onToggleCategory,
  visible = true,
}) {
  const barRef = useRef(null);
  const inputRef = useRef(null);
  const chipsRef = useRef(null);

  /* ── Slide-in entry when visible becomes true ──────────── */
  useEffect(() => {
    if (!barRef.current) return;
    if (visible) {
      gsap.fromTo(
        barRef.current,
        { y: -100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          delay: 0.1,
          clearProps: "transform,opacity",
        }
      );

      /* Stagger chips in */
      if (chipsRef.current) {
        const chips = chipsRef.current.querySelectorAll(".category-chip");
        gsap.fromTo(
          chips,
          { y: 15, opacity: 0, scale: 0.85 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.8)",
            stagger: 0.06,
            delay: 0.5,
            clearProps: "transform,opacity",
          }
        );
      }
    }
  }, [visible]);

  /* ── Search input focus glow animation ─────────────────── */
  function handleInputFocus() {
    if (!inputRef.current) return;
    gsap.to(inputRef.current, {
      boxShadow:
        "0 6px 24px rgba(43, 33, 24, 0.14), 0 0 0 2.5px rgba(181, 67, 44, 0.3), inset 0 1.5px 0 rgba(255, 255, 255, 0.6)",
      scale: 1.01,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  function handleInputBlur() {
    if (!inputRef.current) return;
    gsap.to(inputRef.current, {
      boxShadow:
        "0 4px 16px rgba(43, 33, 24, 0.1), inset 0 1.5px 0 rgba(255, 255, 255, 0.55), inset 0 -1px 0 rgba(43, 33, 24, 0.04)",
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
      clearProps: "boxShadow,scale",
    });
  }

  /* ── Category chip click animation ─────────────────────── */
  function handleChipClick(chipEl, catId) {
    if (!chipEl) return;
    const isCurrentlyActive = activeCategoryIds.has(catId);

    /* Bounce animation */
    gsap.fromTo(
      chipEl,
      { scale: 0.88 },
      { scale: 1, duration: 0.4, ease: "back.out(3)" }
    );

    /* Dot glow burst on toggle on */
    const dot = chipEl.querySelector(".chip-dot");
    if (dot && !isCurrentlyActive) {
      gsap.fromTo(
        dot,
        { scale: 1.8, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
      );
    }

    /* Ripple effect using anime.js */
    const ripple = document.createElement("span");
    ripple.className = "chip-ripple";
    chipEl.appendChild(ripple);
    animate(ripple, {
      scale: [0, 2.5],
      opacity: [0.5, 0],
      duration: 500,
      ease: "outCubic",
      onComplete() { ripple.remove(); },
    });

    onToggleCategory(catId);
  }

  return (
    <div
      ref={barRef}
      className="search-filter-bar glass glass-card"
      style={{ opacity: visible ? undefined : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="search-input-wrap">
        <input
          ref={inputRef}
          type="search"
          placeholder="Search places, artists, styles…"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          aria-label="Search art locations"
        />
      </div>
      <div ref={chipsRef} className="chips-row">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategoryIds.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-chip glass glass-pill glass-btn${isActive ? " is-active" : ""}`}
              style={{ "--chip-color": cat.color, "--btn-rgb": hexToRgb(cat.color) }}
              aria-pressed={isActive}
              onClick={(e) => handleChipClick(e.currentTarget, cat.id)}
            >
              <span className="chip-dot" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
