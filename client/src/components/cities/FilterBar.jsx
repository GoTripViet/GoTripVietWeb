import React, { useMemo, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

function Chip({ label, open, onToggle, children, active }) {
  return (
    <div className="position-relative">
      <button
        type="button"
        className={`btn btn-sm rounded-pill ${
          active ? "btn-outline-primary" : "btn-outline-secondary"
        }`}
        onClick={onToggle}
      >
        {label} <i className="bi bi-chevron-down ms-1" />
      </button>

      {open ? (
        <div
          className="position-absolute top-100 start-0 mt-2 p-3 bg-white border rounded-4 shadow"
          style={{ minWidth: 320, zIndex: 50 }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function FilterBar({ value, onChange, onClear }) {
  const [openKey, setOpenKey] = useState(null);

  const set = (patch) => onChange({ ...value, ...patch });

  const activeCount = useMemo(() => {
    let c = 0;
    if (value.sort !== "popular") c++;
    if (value.stops !== "any") c++;
    if (value.priceMax !== 9000000) c++;
    if (value.durationMaxHours !== 24) c++;
    // giờ bay chỉ đếm nếu lệch default
    if (value.departTime?.[0] !== 0 || value.departTime?.[1] !== 24) c++;
    if (value.returnTime?.[0] !== 0 || value.returnTime?.[1] !== 24) c++;
    return c;
  }, [value]);

  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      {/* 1) Thịnh hành */}
      <Chip
        label="Thịnh hành"
        open={openKey === "sort"}
        active={value.sort !== "popular"}
        onToggle={() => setOpenKey(openKey === "sort" ? null : "sort")}
      >
        <div className="fw-bold mb-2">Sắp xếp</div>

        {[
          { k: "popular", t: "Thịnh hành - Các thành phố được ưa chuộng nhất" },
          { k: "cheapest", t: "Rẻ nhất" },
          { k: "fastest", t: "Nhanh nhất" },
        ].map((opt) => (
          <label key={opt.k} className="d-flex gap-2 align-items-start mb-2">
            <input
              type="checkbox"
              checked={value.sort === opt.k}
              onChange={() => set({ sort: opt.k })}
            />
            <span className="small">{opt.t}</span>
          </label>
        ))}
      </Chip>

      {/* 2) Điểm dừng */}
      <Chip
        label="Điểm dừng"
        open={openKey === "stops"}
        active={value.stops !== "any"}
        onToggle={() => setOpenKey(openKey === "stops" ? null : "stops")}
      >
        <div className="fw-bold mb-2">Điểm dừng</div>

        {[
          { k: "any", t: "Bất kỳ" },
          { k: "direct", t: "Bay trực tiếp" },
          { k: "oneStop", t: "Tối đa một điểm dừng" },
        ].map((opt) => (
          <label key={opt.k} className="d-flex gap-2 align-items-start mb-2">
            <input
              type="checkbox"
              checked={value.stops === opt.k}
              onChange={() => set({ stops: opt.k })}
            />
            <span className="small">{opt.t}</span>
          </label>
        ))}
      </Chip>

      {/* 3) Giá */}
      <Chip
        label="Giá"
        open={openKey === "price"}
        active={value.priceMax !== 9000000}
        onToggle={() => setOpenKey(openKey === "price" ? null : "price")}
      >
        <div className="fw-bold mb-1">Giá</div>
        <div className="small text-muted mb-2">Mỗi người lớn, bay khứ hồi</div>

        <div className="small fw-semibold mb-2">
          Tối đa: {formatVND(value.priceMax)}
        </div>

        <Slider
          min={2000000}
          max={9000000}
          step={100000}
          value={value.priceMax}
          onChange={(v) => set({ priceMax: v })}
        />
      </Chip>

      {/* 4) Thời gian */}
      <Chip
        label="Thời gian"
        open={openKey === "duration"}
        active={value.durationMaxHours !== 24}
        onToggle={() => setOpenKey(openKey === "duration" ? null : "duration")}
      >
        <div className="fw-bold mb-1">Thời gian</div>
        <div className="small text-muted mb-2">
          Thời gian tối đa của hành trình
        </div>

        <div className="small fw-semibold mb-2">
          Tối đa: {value.durationMaxHours} giờ
        </div>

        <Slider
          min={1}
          max={24}
          step={1}
          value={value.durationMaxHours}
          onChange={(v) => set({ durationMaxHours: v })}
        />
      </Chip>

      {/* 5) Giờ bay */}
      <Chip
        label="Giờ bay"
        open={openKey === "time"}
        active={
          value.departTime?.[0] !== 0 ||
          value.departTime?.[1] !== 24 ||
          value.returnTime?.[0] !== 0 ||
          value.returnTime?.[1] !== 24
        }
        onToggle={() => setOpenKey(openKey === "time" ? null : "time")}
      >
        <div className="fw-bold mb-2">Giờ bay</div>

        <div className="fw-semibold small mb-2">Chuyến bay đi</div>
        <Slider
          range
          min={0}
          max={24}
          step={1}
          allowCross={false}
          value={value.departTime}
          onChange={(v) => set({ departTime: v })}
        />
        <div className="small text-muted mt-1 mb-3">
          {value.departTime[0]}:00 – {value.departTime[1]}:00
        </div>

        <div className="fw-semibold small mb-2">Chuyến bay về</div>
        <Slider
          range
          min={0}
          max={24}
          step={1}
          allowCross={false}
          value={value.returnTime}
          onChange={(v) => set({ returnTime: v })}
        />
        <div className="small text-muted mt-1">
          {value.returnTime[0]}:00 – {value.returnTime[1]}:00
        </div>
      </Chip>

      <button
        type="button"
        className="btn btn-link text-decoration-none ms-2"
        onClick={() => {
          onClear();
          setOpenKey(null);
        }}
      >
        Xóa bộ lọc{activeCount ? ` (${activeCount})` : ""}
      </button>
    </div>
  );
}
