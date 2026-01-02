import React from "react";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function CityCard({ city, onClick, active }) {
  return (
    <div className="col">
      <button
        type="button"
        onClick={onClick}
        className={`card h-100 text-start border-0 shadow-sm ${
          active ? "ring-1" : ""
        }`}
        style={{ cursor: "pointer" }}
      >
        <img
          src={city.imageUrl}
          alt={city.title}
          className="card-img-top"
          style={{ height: 170, objectFit: "cover" }}
        />
        <div className="card-body d-flex flex-column">
          {/* left */}
          <div>
            <div className="fw-bold">{city.title}</div>
            <div className="small text-muted">
              <i className="bi bi-geo-alt me-1" />
              {city.country}
            </div>
          </div>

          {/* right */}
          <div className="mt-auto d-flex flex-column align-items-end">
            <div className="fw-bold">{formatVND(city.price)}</div>
            <div className="small text-muted">mỗi người</div>
          </div>
        </div>
      </button>
    </div>
  );
}
