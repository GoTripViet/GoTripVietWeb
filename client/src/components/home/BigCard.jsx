import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function ratingLabel(v) {
  if (v == null) return "Chưa có";
  if (v >= 9) return "Tuyệt hảo";
  if (v >= 8) return "Rất tốt";
  if (v >= 7) return "Tốt";
  return "Dễ chịu";
}

function fmtPrice(v) {
  if (v == null) return "";
  if (typeof v === "number")
    return v.toLocaleString("vi-VN", {
      style: "currency",
      currency: "USD",
    });
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
  onClick,
}) {
  const isA = extra && extra.kind === "A";
  const isB = extra && extra.kind === "B";
  const extraA = isA ? extra : null;
  const extraB = isB ? extra : null;

  return (
    <div
      className="card rounded-4 shadow-sm h-100 overflow-hidden"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {/* Ảnh + nút tim */}
      <div className="position-relative">
        <div className="ratio ratio-4x3">
          <img
            src={imageUrl}
            loading="lazy"
            alt={title}
            className="w-100 h-100 object-fit-cover"
          />
        </div>
        <button
          type="button"
          className={`btn btn-light rounded-circle position-absolute top-0 end-0 m-2 ${
            liked ? "text-danger" : ""
          } d-flex align-items-center justify-content-center p-0`}
          aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
          onClick={(e) => {
            e.stopPropagation();
            onClickHeart && onClickHeart();
          }}
          style={{ width: 36, height: 36 }}
        >
          <i
            className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`}
            style={{ fontSize: 18 }}
          />
        </button>
      </div>

      {/* Nội dung */}
      <div className="card-body">
        {/* Loại A */}
        {isA && extraA && (
          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <span className="text-muted small">{extraA.category}</span>
            <span className="text-warning">
              {Array.from({ length: extraA.stars }).map((_, i) => (
                <i key={i} className="bi bi-star-fill me-1" />
              ))}
            </span>
            {extraA.badges &&
              extraA.badges.map((b, i) => (
                <span key={i} className="badge text-bg-primary">
                  {b}
                </span>
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
              {isB && extraB && (
                <div className="mt-2" style={{ minHeight: 28 }}>
                  {extraB.eventLabel && (
                    <span className="badge text-bg-success">
                      {extraB.eventLabel}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-muted small">Chưa có đánh giá</div>
          )}
        </div>

        {/* Loại B (giá) */}
        {isB && extraB && (
          <div className="mt-1">
            <div className="d-flex align-items-end justify-content-between gap-2">
              <div className="text-muted small">{extraB.note}</div>
              <div className="d-flex align-items-end gap-2 text-end">
                {extraB.oldPrice != null && (
                  <div className="text-danger text-decoration-line-through small">
                    {fmtPrice(extraB.oldPrice)}
                  </div>
                )}
                <div className="fw-bold fs-5">{fmtPrice(extraB.price)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
