import React, { useMemo, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const BINS = [
  { k: "00-05", t: "00:00–05:59" },
  { k: "06-11", t: "06:00–11:59" },
  { k: "12-17", t: "12:00–17:59" },
  { k: "18-23", t: "18:00–23:59" },
];

export default function FilterBar({
  totalResults,
  fromIata,
  toIata,
  airlineStats,
  value,
  onChange,
  onResetAll,
}) {
  const [timeTab, setTimeTab] = useState("outbound"); // outbound | return

  const allAirlines = useMemo(
    () => airlineStats.map((x) => x.name),
    [airlineStats]
  );
  const isAllChecked = useMemo(() => {
    const s = value.airlines;
    if (!s) return true;
    return allAirlines.every((a) => s.has(a));
  }, [value.airlines, allAirlines]);

  const stopsIsDefault = value.stops === "any";
  const airlinesIsDefault = isAllChecked;

  const toggleAirline = (name) => {
    const next = new Set(value.airlines || []);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange({ ...value, airlines: next });
  };

  const setOnlyAirline = (name) => {
    onChange({ ...value, airlines: new Set([name]) });
  };

  const toggleBin = (key, type) => {
    const set0 = type === "depart" ? value.departBins : value.arriveBins;
    const next = new Set(set0);
    if (next.has(key)) next.delete(key);
    else next.add(key);

    onChange({
      ...value,
      [type === "depart" ? "departBins" : "arriveBins"]: next,
    });
  };

  return (
    <div className="border rounded-3 bg-white p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="fw-bold">Bộ lọc</div>
          <div className="small text-muted">
            Hiển thị {totalResults} kết quả
          </div>
        </div>

        <button type="button" className="btn btn-link p-0" onClick={onResetAll}>
          Cài lại tất cả
        </button>
      </div>

      <hr />

      {/* Stops */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="fw-bold">Điểm dừng</div>
          {!stopsIsDefault ? (
            <button
              type="button"
              className="btn btn-link p-0 small"
              onClick={() => onChange({ ...value, stops: "any" })}
            >
              Cài lại
            </button>
          ) : null}
        </div>

        <label className="d-flex gap-2 align-items-start small mb-2">
          <input
            type="radio"
            name="stops"
            checked={value.stops === "any"}
            onChange={() => onChange({ ...value, stops: "any" })}
          />
          <span>Bất kỳ</span>
        </label>

        <label className="d-flex gap-2 align-items-start small">
          <input
            type="radio"
            name="stops"
            checked={value.stops === "max1"}
            onChange={() => onChange({ ...value, stops: "max1" })}
          />
          <span>Tối đa một điểm dừng</span>
        </label>
      </div>

      <hr />

      {/* Airlines */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="fw-bold">Hãng hàng không</div>
          {!airlinesIsDefault ? (
            <button
              type="button"
              className="btn btn-link p-0 small"
              onClick={() =>
                onChange({ ...value, airlines: new Set(allAirlines) })
              }
            >
              Cài lại
            </button>
          ) : null}
        </div>

        <div className="d-flex flex-column gap-2">
          {airlineStats.map((a) => (
            <div
              key={a.name}
              className="d-flex align-items-center justify-content-between small airline-row"
            >
              <label className="d-flex align-items-center gap-2 m-0">
                <input
                  type="checkbox"
                  checked={value.airlines?.has(a.name)}
                  onChange={() => toggleAirline(a.name)}
                />
                <span>{a.name}</span>
                <button
                  type="button"
                  className="btn btn-link p-0 small only-airline"
                  onClick={() => setOnlyAirline(a.name)}
                >
                  chỉ hãng này
                </button>
              </label>
              <span className="text-muted">{a.count}</span>

              <style>{`
                .airline-row .only-airline{ display:none; }
                .airline-row:hover .only-airline{ display:inline-block; margin-left:8px; }
              `}</style>
            </div>
          ))}
        </div>
      </div>

      <hr />

      {/* Time */}
      <div>
        <div className="fw-bold mb-2">Giờ bay</div>

        <div className="d-flex border-bottom mb-2">
          <button
            type="button"
            className={`btn btn-sm ${
              timeTab === "outbound" ? "btn-link" : "btn-light"
            }`}
            onClick={() => setTimeTab("outbound")}
          >
            {fromIata} - {toIata}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              timeTab === "return" ? "btn-link" : "btn-light"
            }`}
            onClick={() => setTimeTab("return")}
          >
            {toIata} - {fromIata}
          </button>
        </div>

        <div className="small fw-semibold mb-2">
          Khởi hành từ {timeTab === "outbound" ? fromIata : toIata}
        </div>
        <div className="d-flex flex-column gap-2 mb-3">
          {BINS.map((b) => (
            <label key={b.k} className="d-flex gap-2 small">
              <input
                type="checkbox"
                checked={value.departBins?.has(b.k)}
                onChange={() => toggleBin(b.k, "depart")}
              />
              {b.t}
            </label>
          ))}
        </div>

        <div className="small fw-semibold mb-2">
          Đến {timeTab === "outbound" ? toIata : fromIata}
        </div>
        <div className="d-flex flex-column gap-2">
          {BINS.map((b) => (
            <label key={b.k} className="d-flex gap-2 small">
              <input
                type="checkbox"
                checked={value.arriveBins?.has(b.k)}
                onChange={() => toggleBin(b.k, "arrive")}
              />
              {b.t}
            </label>
          ))}
        </div>
      </div>

      <hr />

      {/* Duration */}
      <div>
        <div className="fw-bold mb-1">Thời gian</div>
        <div className="small text-muted mb-2">
          Thời gian tối đa của hành trình
        </div>

        <div className="small fw-semibold mb-2">
          Tối đa: {value.durationMax} giờ
        </div>

        <Slider
          min={1}
          max={54}
          step={1}
          value={value.durationMax}
          onChange={(v) => onChange({ ...value, durationMax: v })}
        />
      </div>
    </div>
  );
}
