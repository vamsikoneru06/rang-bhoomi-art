import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap.js";
import { getCategory } from "../../data/categories.js";

export default function Gallery({ images, categoryId }) {
  const galleryRef = useRef(null);
  const category   = getCategory(categoryId);
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

  return (
    <div className="gallery" ref={galleryRef}>
      {images.map((image, index) => (
        <figure
          key={index}
          className="gallery-item"
          style={{ "--cat-color": fallbackColor }}
        >
          {image.src ? (
            <img
              src={image.src}
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
  );
}
