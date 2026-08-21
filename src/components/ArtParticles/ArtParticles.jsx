import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "../lib/gsap.js";

/* Category palette colours (match tokens.css) */
const PALETTE = [
  0xa6432c, // classical-art — terracotta
  0xc77c1f, // folk-art — ochre
  0x5b3a8e, // miniature-painting — indigo
  0x8a6d1b, // temple-art — gold
  0x1f6f6f, // modern-art — teal
  0x7a8b3c, // tribal-art — forest
];

const COUNT = 700;

/**
 * ArtParticles
 * ─────────────
 * Full-screen Three.js ambient particle canvas.
 * Sits at z-index 1, pointer-events:none, behind the Leaflet map.
 *
 * Props:
 *  burstRef — { current: fn(screenX, screenY, cssColor) }
 *              call to trigger a particle burst at map coordinates.
 */
export default function ArtParticles({ burstRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    /* ── Renderer ───────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    /* ── Scene & camera ─────────────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 120);
    camera.position.z = 45;

    /* ── Particle buffers ───────────────────────────────── */
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3); // drift speed per particle
    const origPos   = new Float32Array(COUNT * 3);  // home positions for burst-return
    const c3 = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const px = (Math.random() - 0.5) * 90;
      const py = (Math.random() - 0.5) * 70;
      const pz = (Math.random() - 0.5) * 24;
      positions[i * 3]     = origPos[i * 3]     = px;
      positions[i * 3 + 1] = origPos[i * 3 + 1] = py;
      positions[i * 3 + 2] = origPos[i * 3 + 2] = pz;

      velocities[i * 3]     = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = 0;

      c3.set(PALETTE[i % PALETTE.length]);
      colors[i * 3]     = c3.r;
      colors[i * 3 + 1] = c3.g;
      colors[i * 3 + 2] = c3.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    /* ── Burst function exposed via ref ─────────────────── */
    if (burstRef) {
      burstRef.current = (screenX, screenY, cssHex) => {
        /* Convert screen → world position */
        const ndc = new THREE.Vector3(
          (screenX / window.innerWidth) * 2 - 1,
          -(screenY / window.innerHeight) * 2 + 1,
          0.5,
        );
        ndc.unproject(camera);
        const dir = ndc.sub(camera.position).normalize();
        const t = -camera.position.z / dir.z;
        const world = camera.position.clone().add(dir.multiplyScalar(t));

        /* Parse colour */
        const burstColor = new THREE.Color(cssHex || "#b5432c");

        /* Animate 35 random particles as burst */
        const posArr = points.geometry.attributes.position.array;
        const colArr = points.geometry.attributes.color.array;
        const burstCount = 35;
        const picked = new Set();
        while (picked.size < burstCount) {
          picked.add(Math.floor(Math.random() * COUNT));
        }

        picked.forEach((idx) => {
          /* Stash home */
          const homeX = origPos[idx * 3];
          const homeY = origPos[idx * 3 + 1];

          /* Paint burst colour */
          colArr[idx * 3]     = burstColor.r;
          colArr[idx * 3 + 1] = burstColor.g;
          colArr[idx * 3 + 2] = burstColor.b;
          points.geometry.attributes.color.needsUpdate = true;

          /* Move to world origin */
          posArr[idx * 3]     = world.x;
          posArr[idx * 3 + 1] = world.y;

          /* Shoot outward */
          const angle = Math.random() * Math.PI * 2;
          const dist  = 8 + Math.random() * 18;
          const proxy = { x: world.x, y: world.y };
          const targetX = world.x + Math.cos(angle) * dist;
          const targetY = world.y + Math.sin(angle) * dist;

          gsap.to(proxy, {
            x: targetX,
            y: targetY,
            duration: 1.0 + Math.random() * 0.5,
            ease: "power3.out",
            onUpdate() {
              posArr[idx * 3]     = proxy.x;
              posArr[idx * 3 + 1] = proxy.y;
              points.geometry.attributes.position.needsUpdate = true;
            },
            onComplete() {
              /* Return home */
              gsap.to(proxy, {
                x: homeX,
                y: homeY,
                duration: 1.2,
                ease: "power2.in",
                onUpdate() {
                  posArr[idx * 3]     = proxy.x;
                  posArr[idx * 3 + 1] = proxy.y;
                  points.geometry.attributes.position.needsUpdate = true;
                },
                onComplete() {
                  /* Restore original colour */
                  c3.set(PALETTE[idx % PALETTE.length]);
                  colArr[idx * 3]     = c3.r;
                  colArr[idx * 3 + 1] = c3.g;
                  colArr[idx * 3 + 2] = c3.b;
                  points.geometry.attributes.color.needsUpdate = true;
                },
              });
            },
          });
        });
      };
    }

    /* ── Mouse parallax ─────────────────────────────────── */
    let mx = 0, my = 0;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    /* ── Render loop via GSAP ticker ────────────────────── */
    let elapsed = 0;
    const tick = (time, deltaTime) => {
      elapsed += deltaTime * 0.001; // seconds
      const posArr = points.geometry.attributes.position.array;

      for (let i = 0; i < COUNT; i++) {
        posArr[i * 3]     += velocities[i * 3]     + Math.sin(elapsed + i * 0.13) * 0.0012;
        posArr[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(elapsed + i * 0.11) * 0.0012;

        /* Wrap-around boundaries */
        if (posArr[i * 3]     >  48) posArr[i * 3]     = -48;
        if (posArr[i * 3]     < -48) posArr[i * 3]     =  48;
        if (posArr[i * 3 + 1] >  36) posArr[i * 3 + 1] = -36;
        if (posArr[i * 3 + 1] < -36) posArr[i * 3 + 1] =  36;
      }
      points.geometry.attributes.position.needsUpdate = true;

      /* Gentle camera parallax */
      camera.position.x += (mx * 4 - camera.position.x) * 0.018;
      camera.position.y += (my * 3 - camera.position.y) * 0.018;

      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

    /* ── Resize ─────────────────────────────────────────── */
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* ── Cleanup ────────────────────────────────────────── */
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.72,
      }}
    />
  );
}
