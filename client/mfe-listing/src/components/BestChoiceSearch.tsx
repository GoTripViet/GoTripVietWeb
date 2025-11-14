// src/components/BestChoiceSearch.tsx
import React, { useEffect, useRef, useState } from "react";

export type SortOption = {
  value: string;
  label: string;
};

export type BestChoiceSearchProps = {
  /** Danh sách tuỳ chọn sắp xếp */
  options?: SortOption[];
  /** Giá trị hiện tại (nếu muốn dùng dạng controlled) */
  value?: string;
  /** Giá trị mặc định (khi không truyền value) */
  defaultValue?: string;
  /** Gọi khi chọn option mới */
  onChange?: (value: string, option: SortOption) => void;
  className?: string;
};

const DEFAULT_OPTIONS: SortOption[] = [
  { value: "top_choice", label: "Lựa chọn hàng đầu của chúng tôi" },
  { value: "home_apartment", label: "Ưu tiên nhà & căn hộ" },
  { value: "price_low", label: "Giá (ưu tiên thấp nhất)" },
  { value: "price_high", label: "Giá (ưu tiên cao nhất)" },
  {
    value: "best_value",
    label: "Được đánh giá tốt nhất và có giá thấp nhất",
  },
  { value: "stars_high", label: "Xếp hạng chỗ nghỉ (cao đến thấp)" },
  { value: "stars_low", label: "Xếp hạng chỗ nghỉ (thấp đến cao)" },
  { value: "stars_price", label: "Xếp hạng chỗ nghỉ và giá" },
  { value: "distance_center", label: "Khoảng cách từ trung tâm thành phố" },
  { value: "top_rated", label: "Được đánh giá hàng đầu" },
];

const BestChoiceSearch: React.FC<BestChoiceSearchProps> = ({
  options = DEFAULT_OPTIONS,
  value,
  defaultValue,
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? options[0]?.value ?? ""
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentValue = value ?? internalValue;
  const currentOption =
    options.find((o) => o.value === currentValue) ?? options[0];

  const toggleOpen = () => setOpen((o) => !o);

  const handleSelect = (opt: SortOption) => {
    if (!value) {
      setInternalValue(opt.value);
    }
    onChange?.(opt.value, opt);
    setOpen(false);
  };

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`position-relative d-inline-block ${className ?? ""}`}
      style={{ maxWidth: "100%" }}
    >
      {/* Nút chính */}
      <button
        type="button"
        className="btn btn-outline-secondary rounded-pill d-flex align-items-center px-3 py-2 w-100 text-start"
        onClick={toggleOpen}
      >
        <i className="bi bi-arrow-down-up me-2" />
        <span className="small text-muted me-1">Sắp xếp theo:</span>
        <span className="small fw-semibold text-truncate">
          {currentOption?.label}
        </span>
        <i
          className={
            "bi ms-auto " + (open ? "bi-chevron-up" : "bi-chevron-down")
          }
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="position-absolute mt-1 bg-white shadow rounded-3 py-1"
          style={{
            zIndex: 1050,
            minWidth: "100%",
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => {
            const active = opt.value === currentValue;
            return (
              <button
                key={opt.value}
                type="button"
                className={
                  "w-100 text-start border-0 bg-transparent px-3 py-2 small " +
                  (active ? "fw-semibold text-primary" : "")
                }
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BestChoiceSearch;

// import BestChoiceSearch, { SortOption } from "../components/BestChoiceSearch";

// const MyListingHeader = () => {
//   const handleSortChange = (value: string, option: SortOption) => {
//     console.log("Sort by:", value, option.label);
//     // gọi API / sort lại danh sách ở đây
//   };

//   return (
//     <div className="d-flex justify-content-end mb-3">
//       <BestChoiceSearch onChange={handleSortChange} />
//     </div>
//   );
// };