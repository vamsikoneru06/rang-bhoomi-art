import React, { useState, useRef, useEffect } from 'react';
import { gsap } from '../../lib/gsap.js';
import './ImageWithShimmer.css';

/**
 * ImageWithShimmer
 * ─────────────────
 * Progressive image loading with shimmer placeholder.
 * Shows a CSS shimmer animation until the image loads,
 * then crossfades to the loaded image.
 *
 * Props:
 *  src       — image URL
 *  alt       — alt text
 *  srcSet    — optional srcSet string
 *  sizes     — optional sizes string  
 *  className — optional extra class
 *  style     — optional inline styles
 *  fallbackColor — gradient color for error fallback (default: '#b5432c')
 *  aspectRatio — CSS aspect-ratio value (default: '16/9')
 *  onLoad    — optional callback when image loads
 */
export default function ImageWithShimmer({
  src,
  alt = '',
  srcSet,
  sizes,
  className = '',
  style = {},
  fallbackColor = '#b5432c',
  aspectRatio = '16/9',
  onLoad,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const imgRef = useRef(null);
  const shimmerRef = useRef(null);

  useEffect(() => {
    // Reset states if src changes
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleImageLoad = (e) => {
    setIsLoaded(true);
    
    // Crossfade using GSAP
    const tl = gsap.timeline();
    
    if (shimmerRef.current) {
      tl.to(shimmerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      }, 0);
    }
    
    if (imgRef.current) {
      tl.fromTo(imgRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.inOut' },
        0
      );
    }
    
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleImageError = () => {
    setHasError(true);
    if (shimmerRef.current) {
      gsap.to(shimmerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      });
    }
  };

  return (
    <div 
      className={`img-shimmer-wrap ${className}`} 
      style={{ aspectRatio, ...style }}
    >
      {/* Shimmer placeholder */}
      <div 
        ref={shimmerRef} 
        className="img-shimmer-placeholder"
      />
      
      {/* Fallback for error */}
      {hasError && (
        <div 
          className="img-shimmer-fallback"
          style={{
            background: `linear-gradient(135deg, var(--color-surface, #fffcf5) 0%, ${fallbackColor} 100%)`
          }}
        />
      )}
      
      {/* Actual image */}
      {!hasError && src && (
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ opacity: 0 }}
          {...props}
        />
      )}
    </div>
  );
}
