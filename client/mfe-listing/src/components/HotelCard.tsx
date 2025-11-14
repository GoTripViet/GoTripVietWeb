// src/components/Card.tsx
import React from "react";

export type RoomDescription = {
  bathrooms?: number;
  livingRooms?: number;
  bedrooms?: number;
  isWholeBungalow?: boolean;
  areaM2?: number;
  /** Bắt buộc: mô tả giường – ví dụ: "1 giường đôi hoặc 2 giường đơn" */
  bedSummary: string;
  /** Nội dung nhỏ thêm bên dưới – ví dụ "Phù hợp cho 2 người lớn" */
  extraText?: string;
};

export type PriceInfo = {
  /** Tiền gốc (chưa giảm). Nếu không có giảm giá thì sẽ là giá hiển thị chính. */
  basePrice: number;
  /** Nếu có giá giảm, đây là giá sau giảm – sẽ là giá hiển thị to, basePrice thành giá gốc gạch ngang đỏ. */
  discountedPrice?: number;
  /** Tiền tệ hiển thị, ví dụ "VND" (default: "VND") */
  currency?: string;
  /** Tooltip breakdown khi hover icon (nếu muốn custom, còn không sẽ tự sinh). */
  breakdownTooltip?: string;
  /** Số đêm (default 1) */
  nights?: number;
  /** Số người lớn (default 2) */
  adults?: number;
};

export type ListingCardProps = {
  // ảnh & yêu thích
  imageUrl: string;
  title: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;

  // thông tin chung
  stars?: number;
  badgeLabel?: string; // "Nổi bật", "Ưu đãi cuối năm"...
  location: string; // "Cái Bè"
  distanceToCenterKm?: number; // 1.7 -> "Cách trung tâm 1,7km"
  onMapClick?: () => void;

  // rating
  ratingScore?: number; // 0–10
  reviewCount?: number; // 1113
  /** Nhãn "Mới trên ...", nếu có */
  newLabel?: string; // mặc định bạn có thể truyền "Mới trên GoTripViet"

  // labels bên trái
  eventLabel?: string; // "Ưu Đãi Cuối Năm"

  // phòng
  roomName: string;
  roomDescription: RoomDescription;

  includesBreakfast?: boolean;
  freeCancellation?: boolean;
  payAtProperty?: boolean; // "Không cần thanh toán trước - thanh toán tại chỗ nghỉ"
  remainingRoomsText?: string; // "Chỉ còn 3 phòng với giá này trên trang của chúng tôi"

  // giá
  priceInfo: PriceInfo;

  // click actions
  onViewAvailability?: () => void;
};

function formatCurrency(value: number, currency = "VND") {
  return (
    currency +
    " " +
    value.toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    })
  );
}

function getRatingLabel(score?: number) {
  if (score == null) return undefined;
  if (score >= 9) return "Xuất sắc";
  if (score >= 8) return "Tuyệt vời";
  if (score >= 7) return "Tốt";
  if (score >= 6) return "Dễ chịu";
  return "Đánh giá";
}

const ListingCard: React.FC<ListingCardProps> = ({
  imageUrl,
  title,
  isFavorite,
  onToggleFavorite,
  stars,
  badgeLabel,
  location,
  distanceToCenterKm,
  onMapClick,
  ratingScore,
  reviewCount,
  newLabel,
  eventLabel,
  roomName,
  roomDescription,
  includesBreakfast,
  freeCancellation,
  payAtProperty,
  remainingRoomsText,
  priceInfo,
  onViewAvailability,
}) => {
  const {
    basePrice,
    discountedPrice,
    currency = "VND",
    breakdownTooltip,
    nights = 1,
    adults = 2,
  } = priceInfo;

  const displayScore =
    typeof ratingScore === "number"
      ? Math.round(ratingScore * 10) / 10
      : undefined;
  const ratingLabel = getRatingLabel(ratingScore);

  const hasDiscount =
    typeof discountedPrice === "number" && discountedPrice < basePrice;

  const finalPrice = hasDiscount ? discountedPrice! : basePrice;

  const tooltipText =
    breakdownTooltip ??
    (hasDiscount
      ? `Giá gốc: ${formatCurrency(
          basePrice,
          currency
        )}\nGiảm giá: -${formatCurrency(
          basePrice - finalPrice,
          currency
        )}\nTổng cộng: ${formatCurrency(finalPrice, currency)}`
      : `Giá cho ${nights} đêm, ${adults} người lớn`);

  const descParts: string[] = [];
  if (roomDescription.bathrooms) {
    descParts.push(`${roomDescription.bathrooms} phòng tắm`);
  }
  if (roomDescription.livingRooms) {
    descParts.push(`${roomDescription.livingRooms} phòng khách`);
  }
  if (roomDescription.bedrooms) {
    descParts.push(`${roomDescription.bedrooms} phòng ngủ`);
  }
  if (roomDescription.isWholeBungalow) {
    descParts.push("Bungalow nguyên căn");
  }
  if (roomDescription.areaM2) {
    descParts.push(`${roomDescription.areaM2} m²`);
  }
  // bedSummary luôn có
  descParts.push(roomDescription.bedSummary);

  return (
    <article className="card border-primary-subtle shadow-sm mb-3">
      <div className="row g-0">
        {/* Ảnh bên trái */}
        <div className="col-12 col-md-4">
          <div className="position-relative h-100">
            <img
              src={imageUrl}
              alt={title}
              className="img-fluid h-100 w-100"
              style={{ objectFit: "cover", minHeight: 180 }}
            />
            <button
              type="button"
              className="btn btn-light rounded-circle shadow position-absolute top-0 end-0 m-2 p-2"
              onClick={onToggleFavorite}
            >
              <i
                className={
                  isFavorite ? "bi bi-heart-fill text-danger" : "bi bi-heart"
                }
              />
            </button>
          </div>
        </div>

        {/* Nội dung bên phải */}
        <div className="col-12 col-md-8">
          <div className="card-body d-flex flex-column h-100">
            {/* Hàng trên: tiêu đề + rating */}
            <div className="d-flex justify-content-between gap-3">
              {/* Bên trái: title + location */}
              <div className="flex-grow-1">
                <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                  <h5 className="card-title fw-bold mb-0">{title}</h5>

                  {typeof stars === "number" && stars > 0 && (
                    <span className="text-warning small">
                      {"★".repeat(stars)}
                    </span>
                  )}

                  {badgeLabel && (
                    <span className="badge border border-warning text-warning small">
                      {badgeLabel}
                    </span>
                  )}
                </div>

                {/* Location line */}
                <div className="small mb-2">
                  <span className="text-primary">{location}</span>
                  {" · "}
                  <button
                    type="button"
                    className="btn btn-link p-0 small text-decoration-none"
                    onClick={onMapClick}
                  >
                    Xem trên bản đồ
                  </button>
                  {typeof distanceToCenterKm === "number" && (
                    <>
                      {" · "}
                      <span className="text-muted">
                        Cách trung tâm {distanceToCenterKm.toLocaleString("vi-VN")}km
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Bên phải: rating */}
              {(displayScore || ratingLabel || reviewCount) && (
                <div className="text-end" style={{ minWidth: 120 }}>
                  {ratingLabel && (
                    <div className="small fw-semibold">{ratingLabel}</div>
                  )}
                  {typeof reviewCount === "number" && (
                    <div className="small text-muted">
                      {reviewCount.toLocaleString("vi-VN")} đánh giá
                    </div>
                  )}
                  {displayScore != null && (
                    <div className="d-inline-block mt-1">
                      <span
                        className="badge rounded-3 px-2 py-1"
                        style={{
                          backgroundColor: "#003b95",
                          color: "#fff",
                          minWidth: 36,
                        }}
                      >
                        {displayScore.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* New label dưới rating */}
            {newLabel && (
              <div className="text-end mt-1">
                <span className="badge bg-warning text-dark small">
                  {newLabel}
                </span>
              </div>
            )}

            <div className="row mt-2">
              {/* Bên trái: thông tin phòng, label */}
              <div className="col-12 col-lg-7">
                {/* Event label */}
                {eventLabel && (
                  <div className="mb-2">
                    <span className="badge bg-success text-white small">
                      {eventLabel}
                    </span>
                  </div>
                )}

                {/* Room name */}
                <div className="fw-semibold mb-1">{roomName}</div>

                {/* Room description */}
                <div className="small text-muted mb-2">
                  {descParts.join(" · ")}
                  {roomDescription.extraText && (
                    <>
                      <br />
                      {roomDescription.extraText}
                    </>
                  )}
                </div>

                {/* Bao bữa sáng */}
                {includesBreakfast && (
                  <div className="small mb-1 fw-semibold text-success">
                    Bao bữa sáng
                  </div>
                )}

                {/* Miễn phí hủy */}
                {freeCancellation && (
                  <div className="small mb-1 text-success d-flex align-items-start">
                    <i className="bi bi-check-lg me-1" />
                    <span>Miễn phí huỷ</span>
                  </div>
                )}

                {/* Không cần thanh toán trước */}
                {payAtProperty && (
                  <div className="small mb-1 text-success d-flex align-items-start">
                    <i className="bi bi-check-lg me-1" />
                    <span>
                      <span className="fw-semibold">
                        Không cần thanh toán trước
                      </span>{" "}
                      – thanh toán tại chỗ nghỉ
                    </span>
                  </div>
                )}

                {/* Remaining rooms */}
                {remainingRoomsText && (
                  <div className="small text-danger fw-semibold mt-1">
                    {remainingRoomsText}
                  </div>
                )}
              </div>

              {/* Bên phải: giá */}
              <div className="col-12 col-lg-5 text-end d-flex flex-column justify-content-between mt-3 mt-lg-0">
                <div>
                  {/* nights & adults */}
                  <div className="small text-muted mb-1">
                    {nights} đêm, {adults} người lớn
                  </div>

                  {/* price */}
                  <div className="mb-1">
                    {hasDiscount && (
                      <div className="small text-danger text-decoration-line-through">
                        {formatCurrency(basePrice, currency)}
                      </div>
                    )}

                    <div className="fw-bold fs-5 d-inline-flex align-items-center gap-1">
                      {formatCurrency(finalPrice, currency)}
                      {/* info icon */}
                      <span
                        className="text-muted small"
                        title={tooltipText}
                        style={{ cursor: "help" }}
                      >
                        <i className="bi bi-info-circle" />
                      </span>
                    </div>
                  </div>

                  <div className="small text-muted mb-3">
                    Đã bao gồm thuế và phí
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2"
                    onClick={onViewAvailability}
                  >
                    <span>Xem chỗ trống</span>
                    <i className="bi bi-arrow-right-short" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dòng dưới cùng, ví dụ: Genius, gợi ý đăng nhập... bạn có thể thêm sau nếu cần */}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;

{/* <ListingCard
  imageUrl="/images/hotels/mekong-lodge.jpg"
  title="Mekong Lodge Resort"
  stars={4}
  badgeLabel="Nổi bật"
  location="Cái Bè"
  distanceToCenterKm={1.7}
  ratingScore={8.7}
  reviewCount={1113}
  newLabel="Mới trên GoTripViet"
  eventLabel="Ưu Đãi Cuối Năm"
  roomName="Phòng Superior Nhìn ra Khu vườn"
  roomDescription={{
    bathrooms: 1,
    bedSummary: "1 giường đôi hoặc 2 giường đơn",
    extraText: "Phù hợp cho 2 người lớn",
  }}
  includesBreakfast
  freeCancellation
  payAtProperty
  remainingRoomsText="Chỉ còn 1 phòng với giá này trên trang của chúng tôi"
  priceInfo={{
    basePrice: 6000000,
    discountedPrice: 2400000,
    currency: "VND",
    nights: 2,
    adults: 2,
  }}
  isFavorite={false}
  onToggleFavorite={() => console.log("toggle heart")}
  onViewAvailability={() => console.log("view availability")}
  onMapClick={() => console.log("open map")}
/>; */}
