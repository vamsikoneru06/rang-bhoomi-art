import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, Flip } from "../../lib/gsap.js";
import { getCategory } from "../../data/categories.js";
import { getThumbUrl, getSrcSet } from "../../lib/imageUrls.js";

export default function Gallery({ images, categoryId }) {
  const galleryRef   = useRef(null);
  const [lightbox, setLightbox] = useState(null);  // index of expanded image
  const category     = getCategory(categoryId);
  const fallbackColor = category?.color ?? "#b5432c";

  /* ScrollTrigger: gallery items fade+scale in as they enter the
     scrollable .info-panel container's viewport */
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    /* The scroller is the nearest .info-panel ancestor */
    const scroller = el.closest(".info-panel");

    const items = el.querySelectorAll(".gallery-item");
    gsap.set(items, { opacity: 0, scale: 0.82, y: 22 });

    const triggers = [];
    items.forEach((item, i) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: item,
          scroller: scroller ?? window,
          start: "top 96%",
          once: true,
          onEnter: () => {
            gsap.to(item, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.65,
              ease: "expo.out",
              delay: i * 0.12,
            });
          },
        })
      );
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [images]);

  /* ── Lightbox open: GSAP Flip animation ────────────────── */
  function handleImageClick(index, e) {
    e.stopPropagation();
    setLightbox(index);

    /* Animate lightbox in */
    requestAnimationFrame(() => {
      const overlay = document.querySelector(".gallery-lightbox");
      if (overlay) {
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "power2.out" }
        );
        const img = overlay.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }
          );
        }
      }
    });
  }

  /* ── Lightbox close ────────────────────────────────────── */
  function closeLightbox() {
    const overlay = document.querySelector(".gallery-lightbox");
    if (overlay) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => setLightbox(null),
      });
    } else {
      setLightbox(null);
    }
  }

  return (
    <>
      <div className="gallery" ref={galleryRef}>
        {images.map((image, index) => (
          <figure
            key={index}
            className="gallery-item"
            style={{ "--cat-color": fallbackColor }}
            onClick={(e) => image.src && handleImageClick(index, e)}
          >
            {image.src ? (
              <img
                src={getThumbUrl(image.src, 800)}
                srcSet={getSrcSet(image.src)}
                sizes="(max-width: 640px) 50vw, 200px"
                alt={image.alt}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.classList.add("gallery-item--fallback");
                }}
              />
            ) : null}
            <figcaption>{image.caption}</figcaption>
          </figure>
        ))}
      </div>

      {/* ── Lightbox overlay ───────────────────────────────── */}
      {lightbox !== null && images[lightbox] && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <button
            className="gallery-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >✕</button>
          <img
            src={getThumbUrl(images[lightbox].src, 1920)}
            srcSet={getSrcSet(images[lightbox].src)}
            sizes="90vw"
            alt={images[lightbox].alt}
          />
          <p className="gallery-lightbox-caption">{images[lightbox].caption}</p>
        </div>
      )}
    </>
  );
}
