import { PERIODS } from "../../data/periods.js";
import "./Timeline.css";

export default function Timeline({ activePeriodIds, onTogglePeriod }) {
  return (
    <nav className="timeline" aria-label="Filter by historical period">
      {PERIODS.map((period) => {
        const isActive = activePeriodIds.has(period.id);
        return (
          <button
            key={period.id}
            type="button"
            className={`timeline-pill glass glass-btn${isActive ? " is-active" : ""}`}
            style={{ "--btn-rgb": "181,67,44" }}
            aria-pressed={isActive}
            onClick={() => onTogglePeriod(period.id)}
          >
            <strong>{period.label}</strong>
            <span>{period.yearRange}</span>
          </button>
        );
      })}
    </nav>
  );
}
