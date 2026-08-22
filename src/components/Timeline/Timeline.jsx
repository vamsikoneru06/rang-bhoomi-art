import { useRef } from "react";
import { flushSync } from "react-dom";
import { gsap, Flip } from "../../lib/gsap.js";
import { animate } from "animejs";
import { PERIODS } from "../../data/periods.js";
import "./Timeline.css";

export default function Timeline({ activePeriodIds, onTogglePeriod, visible = true }) {
  const navRef = useRef(null);

  function handleToggle(id, event) {
    if (!navRef.current) { onTogglePeriod(id); return; }

    /* Capture layout state BEFORE React re-renders */
    const state = Flip.getState(navRef.current.querySelectorAll(".timeline-pill"), {
      props: "color,background,border-color",
    });

    /* Force synchronous React state update so DOM changes immediately */
    flushSync(() => onTogglePeriod(id));

    /* Animate FROM the old state TO the new (FLIP technique) */
    Flip.from(state, {
      duration: 0.42,
      ease: "power2.inOut",
      scale: true,
      stagger: 0.02,
    });

    /* Extra spring bounce on the toggled pill */
    const pill = navRef.current.querySelector(`[data-period-id="${id}"]`);
    if (pill) {
      gsap.from(pill, {
        scale: 0.88,
        duration: 0.4,
        ease: "back.out(2.5)",
      });

      /* Ink ripple from click point using anime.js */
      if (event) {
        const rect = pill.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "timeline-ripple";
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        pill.appendChild(ripple);

        animate(ripple, {
          scale: [0, 3],
          opacity: [0.5, 0],
          duration: 600,
          ease: "outCubic",
          onComplete() { ripple.remove(); },
        });
      }
    }
  }

  /* ── Hover micro-interactions ───────────────────────────── */
  function handleMouseEnter(e) {
    gsap.to(e.currentTarget, {
      y: -3,
      boxShadow: "0 8px 24px rgba(43, 33, 24, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      duration: 0.22,
      ease: "power2.out",
    });
  }

  function handleMouseLeave(e) {
    gsap.to(e.currentTarget, {
      y: 0,
      boxShadow: "",
      duration: 0.22,
      ease: "power2.out",
      clearProps: "boxShadow",
    });
  }

  return (
    <nav
      ref={navRef}
      className="timeline"
      aria-label="Filter by historical period"
      style={{ opacity: visible ? undefined : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      {PERIODS.map((period) => {
        const isActive = activePeriodIds.has(period.id);
        return (
          <button
            key={period.id}
            type="button"
            data-period-id={period.id}
            className={`timeline-pill glass glass-btn${isActive ? " is-active" : ""}`}
            style={{ "--btn-rgb": "181,67,44" }}
            aria-pressed={isActive}
            onClick={(e) => handleToggle(period.id, e)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <strong>{period.label}</strong>
            <span>{period.yearRange}</span>
          </button>
        );
      })}
    </nav>
  );
}
