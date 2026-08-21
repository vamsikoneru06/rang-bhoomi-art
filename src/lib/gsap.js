/**
 * src/lib/gsap.js
 * Single import point for GSAP + all club plugins.
 * Import from here instead of "gsap" directly so plugins
 * are always registered before use.
 */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// ── Eases ────────────────────────────────────────────────────
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";

// ── Interaction ───────────────────────────────────────────────
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";

// ── SVG ───────────────────────────────────────────────────────
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MotionPathHelper } from "gsap/MotionPathHelper";

// ── Layout / Flip ─────────────────────────────────────────────
import { Flip } from "gsap/Flip";

// ── Scroll ────────────────────────────────────────────────────
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// ── Text ──────────────────────────────────────────────────────
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { TextPlugin } from "gsap/TextPlugin";

// ── Dev tools ────────────────────────────────────────────────
import { GSDevTools } from "gsap/GSDevTools";

// ── Register everything ──────────────────────────────────────
gsap.registerPlugin(
  useGSAP,
  // eases
  CustomEase, CustomBounce, CustomWiggle,
  RoughEase, ExpoScaleEase, SlowMo,
  // interaction
  Draggable, InertiaPlugin, Observer,
  // SVG
  DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, MotionPathHelper,
  // layout
  Flip,
  // scroll
  ScrollTrigger, ScrollToPlugin,
  // text
  SplitText, ScrambleTextPlugin, TextPlugin,
  // devtools
  GSDevTools,
);

export {
  gsap, useGSAP,
  CustomEase, CustomBounce, CustomWiggle,
  RoughEase, ExpoScaleEase, SlowMo,
  Draggable, InertiaPlugin, Observer,
  DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin,
  Flip,
  ScrollTrigger, ScrollToPlugin,
  SplitText, ScrambleTextPlugin, TextPlugin,
};
