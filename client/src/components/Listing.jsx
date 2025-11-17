import React from "react";

const Listing = ({
  title,
  description,
  categories,
  initialVisibleCount = 20,
  className,
  onItemClick,
}) => {
  const [activeCatId, setActiveCatId] = React.useState(
    categories[0]?.id ?? null
  );

  const [visibleMap, setVisibleMap] = React.useState(() =>
    categories.reduce((acc, cat) => {
      acc[String(cat.id)] = Math.min(initialVisibleCount, cat.items.length);
      return acc;
    }, {})
  );

  if (!categories.length) return null;

  const activeCategory =
    categories.find((c) => c.id === activeCatId) ?? categories[0];

  const activeCatKey = String(activeCategory.id);
  const visibleCount = visibleMap[activeCatKey] ?? initialVisibleCount;
  const itemsToShow = activeCategory.items.slice(0, visibleCount);

  const hasMore = visibleCount < activeCategory.items.length;
  const isLongCategory = activeCategory.items.length > initialVisibleCount;

  const handleShowMore = () => {
    setVisibleMap((prev) => ({
      ...prev,
      [activeCatKey]: Math.min(
        (prev[activeCatKey] || initialVisibleCount) + initialVisibleCount,
        activeCategory.items.length
      ),
    }));
  };

  const pillClass = (id) =>
    `btn btn-sm rounded-pill me-2 mb-2 ${
      id === activeCategory.id
        ? "btn-primary"
        : "btn-outline-secondary bg-white"
    }`;

  return (
    <section className={className}>
      {/* Tiêu đề + mô tả */}
      <h4 className="fw-bold mb-1">{title}</h4>
      {description && <p className="text-muted small mb-3">{description}</p>}

      {/* Categories */}
      <div className="mb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={pillClass(cat.id)}
            onClick={() => setActiveCatId(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
        {itemsToShow.map((item) => (
          <div key={item.id} className="col">
            <button
              type="button"
              className="btn btn-link p-0 text-start w-100 text-reset"
              onClick={() => onItemClick && onItemClick(item, activeCategory)}
            >
              <div className="d-flex align-items-start">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="rounded me-2 flex-shrink-0"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                    }}
                  />
                )}
                <div>
                  <div className="small fw-semibold">{item.title}</div>
                  {item.description && (
                    <div className="small text-muted">{item.description}</div>
                  )}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Show more / loaded all */}
      <div className="mt-3">
        {hasMore && (
          <button
            type="button"
            className="btn btn-link p-0 small"
            onClick={handleShowMore}
          >
            Hiển thị thêm
          </button>
        )}
        {!hasMore && isLongCategory && (
          <span className="small text-muted">Đã tải tất cả các mục</span>
        )}
      </div>
    </section>
  );
};

export default Listing;
