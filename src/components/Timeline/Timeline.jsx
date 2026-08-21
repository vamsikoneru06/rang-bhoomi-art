import { useRef } from "react";
import { flushSync } from "react-dom";
import { gsap, Flip } from "../lib/gsap.js";
import { PERIODS } from "../../data/periods.js";
import "./Timeline.css";

export default function Timeline({ activePeriodIds, onTogglePeriod }) {
  const navRef = useRef(null);

  function handleToggle(id) {
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
    }
  }

  return (
    <nav ref={navRef} className="timeline" aria-label="Filter by historical period">
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
            onClick={() => handleToggle(period.id)}
          >
            <strong>{period.label}</strong>
            <span>{period.yearRange}</span>
          </button>
        );
      })}
    </nav>
  );
}
