import React from "react";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function LittleCard({ offer }) {
  return (
    <div className="border rounded-3 p-3 d-flex justify-content-between gap-3">
      {/* left */}
      <div className="small">
        <div className="fw-semibold">
          {(offer.airlines || []).join(", ")}
          {offer.airports?.length ? ` · ${offer.airports.join(" → ")}` : ""}
        </div>

        <div className="text-muted mt-1 d-flex flex-wrap gap-2">
          {offer.direct ? (
            <span>
              <i className="bi bi-check2 me-1" />
              Bay thẳng
            </span>
          ) : null}

          {offer.tripType ? <span>{offer.tripType}</span> : null}

          <span>{offer.durationText}</span>
        </div>
      </div>

      {/* right */}
      <div className="text-end" style={{ minWidth: 140 }}>
        <div className="fw-bold" style={{ color: "#198754" }}>
          {formatVND(offer.price)}
        </div>
      </div>
    </div>
  );
}
