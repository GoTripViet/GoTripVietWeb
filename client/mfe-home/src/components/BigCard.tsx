// mfe-home/src/components/BigCard.tsx
import React from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';

type ExtraA = {
  kind: "A";                     // ⭐ Loại A: phân loại + số sao (nằm TRÊN tiêu đề)
  category: string;              // ví dụ: "Khách sạn", "Nhà nghỉ", "Resort"
  stars: 1 | 2 | 3 | 4 | 5;      // số sao hiển thị icon
  badges?: ReadonlyArray<string>;             // tùy chọn: ["Genius"] ...
};

type ExtraB = {
  kind: "B";                     // 💸 Loại B: giá (nằm DƯỚI cụm điểm đánh giá)
  note?: string;                 // "2 đêm", "Bắt đầu từ", ...
  oldPrice?: number | string;    // giá gốc (đỏ, gạch ngang)
  price: number | string;        // giá hiện tại (đậm)
  eventLabel?: string;           // nhãn ưu đãi: "Ưu đãi cuối năm" (hiển thị dưới số lượt đánh giá)
};

export type BigCardProps = {
  imageUrl: string;
  title: string;                  // tên chính (to nhất)
  address: string;                // dòng nhỏ ngay dưới tiêu đề
  rating?: number;                // 0–10, vd 8.4
  reviews?: number;               // số lượng đánh giá
  extra?: ExtraA | ExtraB;        // A và B loại trừ lẫn nhau
  liked?: boolean;                // trái tim trên ảnh
  onClickHeart?: () => void;
};

function ratingLabel(v?: number) {
  if (v == null) return "Chưa có";
  if (v >= 9) return "Tuyệt hảo";
  if (v >= 8) return "Rất tốt";
  if (v >= 7) return "Tốt";
  return "Dễ chịu";
}

function fmtPrice(v?: number | string) {
  if (v == null) return "";
  if (typeof v === "number") return v.toLocaleString("vi-VN", { style: "currency", currency: "USD" });
  return v;
}

export default function BigCard({
  imageUrl,
  title,
  address,
  rating,
  reviews,
  extra,
  liked = false,
  onClickHeart,
}: BigCardProps) {
  const isA = extra?.kind === "A";
  const isB = extra?.kind === "B";

  return (
    <div className="card rounded-4 shadow-sm h-100 overflow-hidden">
      {/* Ảnh + nút tim */}
      <div className="position-relative">
        <div className="ratio ratio-4x3">
          <img src={imageUrl} loading="lazy" alt={title} className="w-100 h-100 object-fit-cover" />
        </div>
        <button
          type="button"
          className={`btn btn-light rounded-circle position-absolute top-0 end-0 m-2 ${liked ? "text-danger" : ""} d-flex align-items-center justify-content-center p-0`}
          aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
          onClick={onClickHeart}
          style={{ width: 36, height: 36 }}
        >
          <i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`} style={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Nội dung */}
      <div className="card-body">
        {/* Loại A (category + sao) – nằm trên tiêu đề */}
        {isA && (
          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <span className="text-muted small">{(extra as ExtraA).category}</span>
            <span className="text-warning">
              {Array.from({ length: (extra as ExtraA).stars }).map((_, i) => (
                <i key={i} className="bi bi-star-fill me-1" />
              ))}
            </span>
            {(extra as ExtraA).badges?.map((b, i) => (
              <span key={i} className="badge text-bg-primary">{b}</span>
            ))}
          </div>
        )}

        {/* Tiêu đề + địa chỉ */}
        <h5 className="card-title mb-1 fw-bold">{title}</h5>
        <div className="text-muted">{address}</div>

        {/* Điểm + mô tả + số lượt đánh giá */}
        <div className="d-flex align-items-start mt-3">
          {typeof rating === "number" ? (
            <>
              <div
                className="bg-primary text-white rounded-2 px-2 py-1 me-2 fw-semibold"
                style={{ minWidth: 32, textAlign: "center" }}
              >
                {rating.toFixed(1).replace(".", ",")}
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold">{ratingLabel(rating)}</div>
                {typeof reviews === "number" && (
                  <div className="text-muted small">
                    {reviews.toLocaleString("vi-VN")} đánh giá
                  </div>
                )}
              </div>
              {isB && (
                <div className="mt-2" style={{ minHeight: 28 }}>
                  {(extra as ExtraB).eventLabel && (
                    <span className="badge text-bg-success">{(extra as ExtraB).eventLabel}</span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-muted small">Chưa có đánh giá</div>
          )}
        </div>

        {/* Loại B (giá) – nằm dưới cụm đánh giá */}
        {isB && (
          <div className="mt-1">
            <div className="d-flex align-items-end justify-content-between gap-2">
              {/* Trái: NOTE (giống ảnh) */}
              <div className="text-muted small">
                {(extra as ExtraB).note}
              </div>

              {/* Phải: giá */}
              <div className="d-flex align-items-end gap-2 text-end">
                {(extra as ExtraB).oldPrice != null && (
                  <div className="text-danger text-decoration-line-through small">
                    {fmtPrice((extra as ExtraB).oldPrice)}
                  </div>
                )}
                <div className="fw-bold fs-5">
                  {fmtPrice((extra as ExtraB).price)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
