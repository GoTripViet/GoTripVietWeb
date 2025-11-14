// src/components/Listing.tsx
import React from "react";

export type ListingItem = {
  id: string | number;
  title: string;
  description?: string;
  imageUrl?: string;
};

export type ListingCategory = {
  id: string | number;
  label: string;           // tên tab category
  items: ListingItem[];
};

type ListingProps = {
  /** Tiêu đề lớn */
  title: React.ReactNode;
  /** Mô tả nhỏ dưới tiêu đề */
  description?: React.ReactNode;
  /** Danh sách các category */
  categories: ListingCategory[];
  /** Số item hiển thị ban đầu cho 1 category (mặc định 8) */
  initialVisibleCount?: number;
  className?: string;
};

const Listing: React.FC<ListingProps> = ({
  title,
  description,
  categories,
  initialVisibleCount = 20,
  className,
}) => {
  const [activeCatId, setActiveCatId] = React.useState<
    ListingCategory["id"] | null
  >(categories[0]?.id ?? null);

  // lưu số item đang hiển thị cho mỗi category
  const [visibleMap, setVisibleMap] = React.useState<Record<string, number>>(
    () =>
      categories.reduce((acc, cat) => {
        acc[String(cat.id)] = Math.min(initialVisibleCount, cat.items.length);
        return acc;
      }, {} as Record<string, number>)
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
        prev[activeCatKey] + initialVisibleCount,
        activeCategory.items.length
      ),
    }));
  };

  const pillClass = (id: ListingCategory["id"]) =>
    `btn btn-sm rounded-pill me-2 mb-2 ${
      id === activeCategory.id ? "btn-primary" : "btn-outline-secondary bg-white"
    }`;

  return (
    <section className={className}>
      {/* Tiêu đề + mô tả */}
      <h4 className="fw-bold mb-1">{title}</h4>
      {description && (
        <p className="text-muted small mb-3">{description}</p>
      )}

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

        {/* Chỉ hiện text này nếu category thuộc loại “dài” (từng có nút Hiển thị thêm) */}
        {!hasMore && isLongCategory && (
          <span className="small text-muted">Đã tải tất cả các mục</span>
        )}
      </div>
    </section>
  );
};

export default Listing;
