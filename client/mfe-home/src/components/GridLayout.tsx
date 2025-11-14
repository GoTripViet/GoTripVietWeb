// src/components/GridLayout.tsx
import React from "react";

export type GridLayoutItem = {
  id: string | number;
  imageUrl: string;
  /** Tên ảnh – hiển thị to ở góc trên trái */
  title: string;
  /** Mô tả nhỏ dưới tên ảnh (không bắt buộc) */
  description?: string;
};

type GridLayoutProps = {
  /** Tiêu đề lớn của block */
  title?: React.ReactNode;
  /** Mô tả nhỏ dưới tiêu đề */
  description?: React.ReactNode;
  /** Danh sách ảnh */
  items: GridLayoutItem[];
  /** Số lượng ảnh muốn hiển thị (mặc định = tất cả) */
  maxItems?: number;
  /** Class tùy chỉnh cho section */
  className?: string;
  /** Click 1 item */
  onItemClick?: (item: GridLayoutItem) => void;
};

const GridLayout: React.FC<GridLayoutProps> = ({
  title,
  description,
  items,
  maxItems,
  className,
  onItemClick,
}) => {
  const visibleItems =
    maxItems && maxItems > 0 ? items.slice(0, maxItems) : items;

  return (
    <section className={className}>
      {(title || description) && (
        <header className="mb-3">
          {title && <h4 className="fw-bold mb-1">{title}</h4>}
          {description && (
            <p className="text-muted small mb-0">{description}</p>
          )}
        </header>
      )}

      <div className="row g-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-lg-4">
            <button
              type="button"
              className="w-100 p-0 border-0 bg-transparent text-start"
              onClick={() => onItemClick?.(item)}
            >
              <div
                className="position-relative rounded-4 overflow-hidden"
                style={{ minHeight: 180 }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />

                {/* overlay tối nhẹ để chữ nổi bật */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.4))",
                  }}
                />

                {/* text ở góc trên trái */}
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex">
                  <div className="p-3 align-self-start">
                    <div className="text-white fw-bold fs-5 mb-1">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-white-50 small">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GridLayout;
