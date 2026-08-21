import { getCategory } from "../../data/categories.js";

export default function Gallery({ images, categoryId }) {
  const category = getCategory(categoryId);
  const fallbackColor = category?.color ?? "#b5432c";

  return (
    <div className="gallery">
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
