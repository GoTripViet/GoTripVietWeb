import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";

type SliderProps<T> = {
  title?: React.ReactNode;
  /** Dòng mô tả nhỏ dưới title */
  description?: React.ReactNode;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Min width mỗi item (px). Slider sẽ tự hiển thị được nhiều/ít item tùy theo viewport. */
  itemMinWidth?: number; // default 280
  /** Khoảng cách giữa các item (px) */
  gap?: number; // default 16
  className?: string;
};

export default function Slider<T>({
  title,
  description,
  items,
  renderItem,
  itemMinWidth = 280,
  gap = 16,
  className,
}: SliderProps<T>) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1; // trừ sai số
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < max);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByAmount = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(itemMinWidth + gap, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // hỗ trợ cuộn bằng Shift+wheel (nhiều trình duyệt cuộn dọc mặc định)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; // chủ yếu dọc -> bỏ qua
      e.preventDefault();
      el.scrollBy({ left: e.deltaX, behavior: "auto" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className={className}>
      {(title || description) && (
        <div className="mb-2">
          {title && (
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="m-0 fw-bold">{title}</h5>
            </div>
          )}
          {description && (
            <p className="m-0 mt-1 text-muted small">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="position-relative">
        {/* Track */}
        <div
          ref={trackRef}
          role="region"
          aria-label="Slider"
          className="d-flex overflow-auto"
          style={{
            scrollSnapType: "x mandatory",
            gap,
            paddingBottom: 6, // tránh scroll bar đè bóng
          }}
          onScroll={updateArrows}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className="slider-item"
              style={{
                flex: `0 0 ${itemMinWidth}px`,
                scrollSnapAlign: "start",
              }}
            >
              {renderItem(it, i)}
            </div>
          ))}
        </div>

        {/* Arrows */}
        <Button
          variant="light"
          className="position-absolute top-50 translate-middle-y shadow-sm"
          style={{
            left: -8,
            opacity: canPrev ? 1 : 0,
            pointerEvents: canPrev ? "auto" : "none",
          }}
          onClick={() => scrollByAmount(-1)}
          aria-label="Trước"
        >
          ‹
        </Button>
        <Button
          variant="light"
          className="position-absolute top-50 translate-middle-y shadow-sm"
          style={{
            right: -8,
            opacity: canNext ? 1 : 0,
            pointerEvents: canNext ? "auto" : "none",
          }}
          onClick={() => scrollByAmount(1)}
          aria-label="Sau"
        >
          ›
        </Button>
      </div>
    </section>
  );
}
