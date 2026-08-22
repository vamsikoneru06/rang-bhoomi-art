import { useEffect, useRef } from 'react';
import { gsap, DrawSVGPlugin } from '../../lib/gsap.js';
import { animate, stagger } from 'animejs';
import './MapTransition.css';

export default function MapTransition({ active, onComplete }) {
  const overlayRef = useRef(null);
  const rippleRef = useRef(null);
  const ringRef = useRef(null);
  const particlesRef = useRef([]);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;
    
    const overlay = overlayRef.current;
    const ripple = rippleRef.current;
    if (!overlay || !ripple) return;
    
    // Anime.js particles burst
    const validParticles = particlesRef.current.filter(Boolean);
    if (validParticles.length > 0) {
      animate(validParticles, {
        translateX: () => (Math.random() - 0.5) * 600,
        translateY: () => (Math.random() - 0.5) * 600,
        scale: [0, () => Math.random() * 1.5 + 0.5],
        opacity: [1, 0],
        duration: 1200,
        ease: 'outExpo',
        delay: stagger(15)
      });
    }

    // GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // t=0.0: Glass ripple circle starts expanding from center
    tl.to(ripple, {
      scale: 50, // Expand enough to cover any viewport
      duration: 0.8,
      ease: "power3.inOut"
    }, 0);

    // SVG Ring draw effect
    if (ringRef.current) {
      gsap.set(ringRef.current, { drawSVG: "0% 0%", opacity: 1 });
      tl.to(ringRef.current, {
        drawSVG: "0% 100%",
        duration: 0.6,
        ease: "power2.out"
      }, 0).to(ringRef.current, {
        opacity: 0,
        scale: 1.5,
        transformOrigin: "center",
        duration: 0.4,
        ease: "power2.inOut"
      }, 0.2);
    }

    // t=0.3: Overlay background opacity increases
    tl.to(overlay, {
      backgroundColor: "rgba(255, 251, 245, 0.95)",
      duration: 0.5,
      ease: "power2.inOut"
    }, 0.3);

    // t=1.0: Frosted overlay begins to clear
    tl.to(ripple, {
      backdropFilter: "blur(0px) saturate(100%) brightness(1)",
      webkitBackdropFilter: "blur(0px) saturate(100%) brightness(1)",
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    }, 1.0);

    tl.to(overlay, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    }, 1.0);

  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div ref={overlayRef} className="map-transition-overlay">
      <div ref={rippleRef} className="map-transition-ripple" />
      
      {/* Burst particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i} 
          ref={el => particlesRef.current[i] = el}
          className="map-transition-particle" 
        />
      ))}
      
      {/* SVG ring */}
      <svg className="map-transition-ring" width="200" height="200" viewBox="0 0 200 200">
        <circle 
          ref={ringRef}
          cx="100" 
          cy="100" 
          r="80" 
          fill="none" 
          stroke="var(--color-accent, #b5432c)" 
          strokeWidth="2" 
          opacity="0"
        />
      </svg>
    </div>
  );
}
