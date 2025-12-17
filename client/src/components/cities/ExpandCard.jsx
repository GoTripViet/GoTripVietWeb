import React, { useMemo } from "react";
import LittleCard from "./LittleCard.jsx";

const pickDateLabel = (planeSearchState) => {
  if (!planeSearchState) return "—";
  // bạn có thể map lại theo đúng object PlaneSearch của bạn
  return (
    planeSearchState.dateLabel ||
    planeSearchState.dateRange ||
    planeSearchState.dates ||
    "—"
  );
};

export default function ExpandCard({
  city,
  offers,
  planeSearchState,
  onClose,
  onSearchAllFlights,
}) {
  const dateLabel = useMemo(
    () => pickDateLabel(planeSearchState),
    [planeSearchState]
  );

  return (
    <div className="border rounded-4 p-3 bg-white shadow-sm">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="h3 fw-bold mb-0">{city.title}</div>
        <button
          className="btn btn-light btn-sm"
          onClick={onClose}
          type="button"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <div className="mt-3">
        <img
          src={city.imageUrl}
          alt={city.title}
          className="w-100 rounded-4"
          style={{ height: 220, objectFit: "cover" }}
        />
      </div>

      <div className="mt-3 fw-semibold">
        Giá vé máy bay rẻ nhất từ TP. Hồ Chí Minh
      </div>
      <div className="text-muted small mt-1">{dateLabel}</div>

      <div className="mt-3 d-flex flex-column gap-2">
        {(offers || []).map((o) => (
          <LittleCard key={o.id} offer={o} />
        ))}
      </div>

      <button
        type="button"
        className="btn btn-primary w-100 mt-3 py-2 fw-semibold"
        onClick={() => onSearchAllFlights?.()}
      >
        Tìm kiếm tất cả chuyến bay này
      </button>
    </div>
  );
}
