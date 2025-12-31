import React from "react";
import Button from "react-bootstrap/Button";

export default function BigCard({
  id,
  imageUrl,
  title,
  price,
  originalPrice,
  // Các thông tin chi tiết Tour
  tourCode,       // Mã tour
  startPoint,     // Khởi hành
  duration,       // Thời gian (VD: 6N5Đ)
  departureDates,
  transport, transportIcon,
  onClick
}) {
  return (
    <div className="card h-100 border shadow-sm cursor-pointer hover-shadow" onClick={onClick}>
      {/* 1. ẢNH THUMBNAIL */}
      <div className="position-relative overflow-hidden">
        <img
          src={imageUrl}
          className="card-img-top transition-transform"
          alt={title}
          style={{ height: "200px", objectFit: "cover" }}
        />
        {/* Badge giảm giá nếu có */}
        {originalPrice > price && (
          <span className="position-absolute top-0 end-0 bg-danger text-white badge m-2 rounded-pill">
            Giảm {Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="card-body p-3 d-flex flex-column">
        {/* 2. TIÊU ĐỀ TOUR */}
        <h6 className="card-title fw-bold text-dark mb-3 text-truncate-2-lines" style={{ minHeight: '40px', lineHeight: '1.4' }}>
          {title}
        </h6>

        {/* 3. THÔNG TIN CHI TIẾT (GRID 2 CỘT) */}
        <div className="row g-2 mb-3 small text-secondary">
          {/* Cột 1: Mã tour */}
          <div className="col-6 d-flex align-items-center gap-2">
            <i className="bi bi-ticket-perforated text-muted fs-6"></i>
            <span className="text-truncate">Mã: <span className="fw-bold text-dark">{tourCode}</span></span>
          </div>

          {/* Cột 2: Khởi hành */}
          <div className="col-6 d-flex align-items-center gap-2">
            <i className="bi bi-geo-alt text-muted fs-6"></i>
            <span className="text-truncate">Từ: <span className="fw-bold text-primary">{startPoint}</span></span>
          </div>

          {/* Cột 3: Thời gian */}
          <div className="col-6 d-flex align-items-center gap-2">
            <i className="bi bi-clock text-muted fs-6"></i>
            <span>{duration}</span>
          </div>

          {/* Cột 4: Phương tiện */}
          <div className="col-6 d-flex align-items-center gap-2">
            {/* Dùng class icon được truyền vào */}
            <i className={`bi ${transportIcon || 'bi-bus-front'} text-primary fs-6`}></i>
            <span className="text-truncate" title={transport}>{transport}</span>
          </div>
        </div>

        {/* 4. NGÀY KHỞI HÀNH (CÁC Ô NHỎ) */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-calendar3 text-muted"></i>
          <span className="small text-muted me-1">Khởi hành:</span>
          <div className="d-flex gap-1 overflow-hidden">
            {departureDates && departureDates.length > 0 ? (
              departureDates.slice(0, 3).map((date, index) => (
                <span key={index} className="border border-danger text-danger rounded px-2 py-0 small bg-white" style={{ fontSize: '11px' }}>
                  {date}
                </span>
              ))
            ) : (
              <span className="text-muted small">Liên hệ</span>
            )}
          </div>
        </div>

        {/* 5. GIÁ VÀ NÚT BẤM (FOOTER) */}
        <div className="mt-auto pt-3 border-top d-flex align-items-end justify-content-between">
          <div>
            <div className="small text-muted">Giá từ:</div>
            <div className="fw-bold text-danger fs-5 lh-1">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </div>
            {originalPrice > price && (
              <small className="text-decoration-line-through text-muted" style={{ fontSize: '11px' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
              </small>
            )}
          </div>

          <Button variant="primary" size="sm" className="fw-bold px-3 rounded-1">
            Xem chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
}