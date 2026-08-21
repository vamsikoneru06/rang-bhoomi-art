import { getCategory } from "../../data/categories.js";

export default function Gallery({ images, categoryId }) {
  const category = getCategory(categoryId);

  return (
    <div className="gallery">
      {images.map((image, index) => (
        <figure
          key={index}
          className="gallery-placeholder"
          style={{ "--chip-color": category?.color }}
        >
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
