// src/components/Faq.tsx
import React from "react";

export type FaqItem = {
  id: string;
  question: React.ReactNode;
  answer: React.ReactNode;
};

type FaqProps = {
  /** Tiêu đề lớn */
  title: React.ReactNode;
  /** Mô tả nhỏ dưới tiêu đề (không bắt buộc) */
  description?: React.ReactNode;
  /** Danh sách câu hỏi / trả lời */
  items: FaqItem[];
  /** Mặc định mở tất cả câu trả lời? (default: true) */
  defaultOpenAll?: boolean;
  /** Số cột trên desktop (1 hoặc 2, default: 2) */
  columns?: 1 | 2;
  className?: string;
};

const Faq: React.FC<FaqProps> = ({
  title,
  description,
  items,
  defaultOpenAll = true,
  columns = 2,
  className,
}) => {
  const [openIds, setOpenIds] = React.useState<string[]>(
    defaultOpenAll ? items.map((i) => i.id) : []
  );

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isOpen = (id: string) => openIds.includes(id);

  const colClass =
    columns === 2 ? "col-12 col-md-6" : "col-12";

  return (
    <section className={className}>
      <h5 className="fw-bold mb-1">{title}</h5>
      {description && <p className="small mb-3">{description}</p>}

      <div className="row g-3">
        {items.map((item) => (
          <div key={item.id} className={colClass}>
            <div className="border rounded-3 bg-white h-100">
              <button
                type="button"
                className="w-100 text-start border-0 bg-transparent px-3 py-3 d-flex align-items-center justify-content-between"
                onClick={() => toggle(item.id)}
              >
                <span className="fw-semibold">{item.question}</span>
                <i
                  className={
                    "bi ms-2 " +
                    (isOpen(item.id) ? "bi-chevron-up" : "bi-chevron-down")
                  }
                />
              </button>
              {isOpen(item.id) && (
                <div className="px-3 pb-3 small text-muted">
                  {item.answer}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;
