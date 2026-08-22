import { useRef } from 'react';
import { gsap, useGSAP, SplitText, ScrambleTextPlugin, DrawSVGPlugin } from '../../lib/gsap.js';
import { animate } from 'animejs';
import './LandingPage.css';

const HERO_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Ajanta-maharashtra.jpg/1280px-Ajanta-maharashtra.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tanjore_big_temple_overview_2.jpg/1280px-Tanjore_big_temple_overview_2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/City_Palace%2C_Udaipur_2013.jpg/1280px-City_Palace%2C_Udaipur_2013.jpg'
];

export const LandingPage = ({ onEnterMap, locationCount = 25 }) => {
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const badgeRef = useRef(null);
  const statsRef = useRef([]);
  const statNumbersRef = useRef([]);
  const dividerRef = useRef(null);
  const buttonRef = useRef(null);
  const shimmerRef = useRef(null);
  const scrollHintRef = useRef(null);
  const arrowRef = useRef(null);

  useGSAP(() => {
    gsap.registerPlugin(SplitText, ScrambleTextPlugin, DrawSVGPlugin);

    // Initial state setup
    gsap.set(imagesRef.current, { opacity: 0, scale: 1.05 });
    gsap.set(imagesRef.current[0], { opacity: 1, scale: 1 });
    gsap.set(badgeRef.current, { y: -20, opacity: 0 });
    gsap.set(statsRef.current, { opacity: 0, y: 20 });
    gsap.set(dividerRef.current, { drawSVG: '0%' });
    gsap.set(buttonRef.current, { opacity: 0, scale: 0.8 });
    gsap.set(scrollHintRef.current, { opacity: 0 });

    const tl = gsap.timeline();

    // t=0.0 Hero images start fading in (already set first one to 1)
    
    // t=0.3 Brand badge fades in
    tl.to(badgeRef.current, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0.3);

    // t=0.5 Title SplitText
    const splitTitle = new SplitText(titleRef.current, { type: 'chars' });
    gsap.set(splitTitle.chars, { opacity: 0, y: 40, rotationX: -90 });
    tl.to(splitTitle.chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      stagger: 0.04,
      ease: 'back.out(1.7)',
      duration: 0.8
    }, 0.5);

    // t=1.2 Subtitle ScrambleText
    tl.to(subtitleRef.current, {
      scrambleText: {
        text: 'Discover the living heritage of Indian art — from ancient cave murals to contemporary galleries',
        chars: 'अआइईउऊकखगघचछजझटठडढतथदधनपफबभमयरलवशषसह',
        speed: 0.4,
        revealDelay: 0.4
      },
      duration: 2
    }, 1.2);

    // t=1.5 Stats numbers start counting
    tl.to(statsRef.current, {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out'
    }, 1.5);

    statNumbersRef.current.forEach((el, index) => {
      if (!el) return;
      let target = index === 0 ? locationCount : index === 1 ? 6 : 8;
      let obj = { val: 0 };
      tl.to(obj, {
        val: target,
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: () => {
          el.innerText = index === 0 ? Math.floor(obj.val) + '+' : Math.floor(obj.val);
        }
      }, 1.5);
    });

    // t=1.8 Divider line draws in
    tl.to(dividerRef.current, {
      drawSVG: '100%',
      duration: 1.5,
      ease: 'power3.inOut'
    }, 1.8);

    // t=2.0 CTA button scales up
    tl.to(buttonRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.5)'
    }, 2.0);

    // t=2.4 Scroll hint appears and bounces
    tl.to(scrollHintRef.current, {
      opacity: 1,
      duration: 0.5
    }, 2.4);
    
    gsap.to(scrollHintRef.current, {
      y: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      duration: 0.8,
      delay: 2.9
    });

    // Image Cross-fade Carousel
    let imageTl = gsap.timeline({ repeat: -1 });
    HERO_IMAGES.forEach((_, i) => {
      let nextI = (i + 1) % HERO_IMAGES.length;
      imageTl
        .to(imagesRef.current[i], { scale: 1.05, duration: 5, ease: 'none' }) // stay and zoom slightly
        .to(imagesRef.current[nextI], { opacity: 1, duration: 1, ease: 'power2.inOut' }, "-=1") // crossfade to next
        .set(imagesRef.current[i], { opacity: 0, scale: 1 }); // reset old
    });

    // Mouse Parallax
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const yPos = (clientY / window.innerHeight - 0.5) * 2; 

      gsap.to(imagesRef.current, {
        x: -xPos * 30,
        y: -yPos * 30,
        duration: 1,
        ease: 'power2.out'
      });

      gsap.to('.landing-content-inner', {
        x: xPos * 10,
        y: yPos * 10,
        duration: 1,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, { scope: containerRef });

  const handleButtonHover = () => {
    gsap.to(buttonRef.current, { scale: 1.05, ease: 'back.out(2)', duration: 0.4 });
    gsap.to(arrowRef.current, { x: 4, duration: 0.3 });
    if (shimmerRef.current) {
      animate(shimmerRef.current, {
        translateX: ['-110%', '210%'],
        duration: 600,
        ease: 'inOutSine',
      });
    }
  };

  const handleButtonLeave = () => {
    gsap.to(buttonRef.current, { scale: 1, ease: 'power2.out', duration: 0.3 });
    gsap.to(arrowRef.current, { x: 0, duration: 0.3 });
  };

  return (
    <div className="landing-page" ref={containerRef}>
      <div className="landing-hero-images">
        {HERO_IMAGES.map((src, i) => (
          <img 
            key={i} 
            src={src} 
            alt={`Hero Background ${i + 1}`} 
            className="landing-hero-img" 
            ref={el => imagesRef.current[i] = el}
          />
        ))}
      </div>
      
      <div className="landing-overlay"></div>

      <div className="landing-content">
        <div className="landing-content-inner">
          <div className="landing-badge glass-pill" ref={badgeRef}>
            A DIGITAL MAP OF
          </div>
          
          <h1 className="landing-title" ref={titleRef}>
            Rang Bhoomi
          </h1>
          
          <p className="landing-subtitle" ref={subtitleRef}></p>
          
          <div className="landing-stats">
            {[
              { label: 'Locations' },
              { label: 'Art Traditions' },
              { label: 'Time Periods' }
            ].map((stat, i) => (
              <div key={i} className="landing-stat-item" ref={el => statsRef.current[i] = el}>
                <div className="landing-stat-number" ref={el => statNumbersRef.current[i] = el}>0</div>
                <div className="landing-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <svg className="landing-divider" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <path ref={dividerRef} d="M0,10 L90,10 L100,5 L110,10 L200,10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="100" cy="10" r="3" fill="var(--color-accent)" opacity="0.8" />
          </svg>
          
          <button 
            className="landing-cta" 
            ref={buttonRef}
            onClick={onEnterMap}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <div className="landing-cta-shimmer" ref={shimmerRef}></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Explore the Map</span>
            <span ref={arrowRef} style={{ display: 'inline-block' }}>→</span>
          </button>
        </div>
      </div>
      
      <div className="landing-scroll-hint" ref={scrollHintRef}>
        ↓
      </div>
    </div>
  );
};
