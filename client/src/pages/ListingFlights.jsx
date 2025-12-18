import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";

import FilterBar from "../components/flights/FliterBar.jsx";
import FlightCard from "../components/flights/FlightCard.jsx";
import DetailFlightCard from "../components/flights/DetailFlightCard.jsx";
import {
  DUMMY_FLIGHTS,
  createDefaultFlightFilters,
} from "../data/FlightsData.jsx";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const timeToMinutes = (t) => {
  // "23:05" -> 1385
  const [hh, mm] = String(t || "0:0")
    .split(":")
    .map(Number);
  return hh * 60 + mm;
};

const inBin = (minutes, binKey) => {
  // 00-05:59 | 06-11:59 | 12-17:59 | 18-23:59
  const h = Math.floor(minutes / 60);
  if (binKey === "00-05") return h >= 0 && h <= 5;
  if (binKey === "06-11") return h >= 6 && h <= 11;
  if (binKey === "12-17") return h >= 12 && h <= 17;
  if (binKey === "18-23") return h >= 18 && h <= 23;
  return true;
};

const DEFAULT_FILTERS = {
  stops: "any", // any | max1
  airlines: null, // sẽ fill sau
  durationMax: 54,
  timeTab: "outbound", // outbound | return
  departBins: new Set(), // selected bins
  arriveBins: new Set(),
};

export default function ListingFlights() {
  const location = useLocation();
  const navigate = useNavigate();
  const sp = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const cityFromUrl = sp.get("city") || "";
  const fromIata = sp.get("from") || "SGN";
  const toIata = sp.get("to") || "HND";
  const departLabel = sp.get("depart") || "";
  const retLabel = sp.get("ret") || "";
  const initialCity = location.state?.city?.title || cityFromUrl;
  const detailIdFromUrl = sp.get("detail");
  // airlines options from data
  const airlineStats = useMemo(() => {
    const map = new Map();
    DUMMY_FLIGHTS.forEach((f) => {
      (f.airlines || []).forEach((a) => {
        map.set(a, (map.get(a) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const [filters, setFilters] = useState(() => {
    return createDefaultFlightFilters(airlineStats.map((x) => x.name));
  });

  const [sortMode, setSortMode] = useState("best"); // best | cheap | fast
  const [manualSelectedId, setManualSelectedId] = useState(null);
  const activeDetailId = detailIdFromUrl || manualSelectedId;

  const selectedFlight = useMemo(() => {
    if (!activeDetailId) return null;
    return DUMMY_FLIGHTS.find((f) => f.id === activeDetailId) || null;
  }, [activeDetailId]);

  const flights = useMemo(() => {
    let arr = [...DUMMY_FLIGHTS];

    // stops
    if (filters.stops === "max1")
      arr = arr.filter((f) => (f.stopsMax ?? 99) <= 1);

    // airlines
    if (filters.airlines && filters.airlines.size > 0) {
      arr = arr.filter((f) =>
        (f.airlines || []).some((a) => filters.airlines.has(a))
      );
    }

    // duration
    arr = arr.filter(
      (f) => (f.totalDurationHours ?? 999) <= filters.durationMax
    );

    // time bins (nếu user chọn)
    if (filters.departBins.size > 0) {
      arr = arr.filter((f) => {
        const m = f.departMin ?? 0;
        return Array.from(filters.departBins).some((k) => inBin(m, k));
      });
    }
    if (filters.arriveBins.size > 0) {
      arr = arr.filter((f) => {
        const m = f.arriveMin ?? 0;
        return Array.from(filters.arriveBins).some((k) => inBin(m, k));
      });
    }

    // sort
    if (sortMode === "cheap")
      arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sortMode === "fast")
      arr.sort(
        (a, b) => (a.totalDurationHours ?? 999) - (b.totalDurationHours ?? 999)
      );
    else {
      // best: ưu tiên best tag, rồi giá
      arr.sort(
        (a, b) =>
          Number(!!b.best) - Number(!!a.best) || (a.price ?? 0) - (b.price ?? 0)
      );
    }

    return arr;
  }, [filters, sortMode]);

  const closeDetail = () => {
    setManualSelectedId(null);

    const next = new URLSearchParams(location.search);
    next.delete("detail");
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  };

  return (
    <div className="py-3">
      <Container>
        <div className="row g-3 align-items-start">
          {/* LEFT */}
          <div className="col-12 col-lg-3">
            <FilterBar
              totalResults={flights.length}
              fromIata={fromIata}
              toIata={toIata}
              airlineStats={airlineStats}
              value={filters}
              onChange={setFilters}
              onResetAll={() => {
                setFilters(
                  createDefaultFlightFilters(airlineStats.map((x) => x.name))
                );
              }}
            />
          </div>

          {/* RIGHT */}
          <div className="col-12 col-lg-9">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-bold">
                {initialCity
                  ? `Chuyến bay đến ${initialCity}`
                  : "Danh sách chuyến bay"}
              </div>
              <div className="small text-muted">
                {departLabel || retLabel
                  ? `${departLabel}${retLabel ? ` – ${retLabel}` : ""}`
                  : null}
              </div>
            </div>

            {/* sort bar */}
            <div className="border rounded-3 p-1 d-flex mb-3">
              {[
                { k: "best", t: "Tốt nhất" },
                { k: "cheap", t: "Rẻ nhất" },
                { k: "fast", t: "Nhanh nhất" },
              ].map((x) => (
                <button
                  key={x.k}
                  type="button"
                  className={`btn flex-fill ${
                    sortMode === x.k ? "btn-outline-primary" : "btn-light"
                  }`}
                  onClick={() => setSortMode(x.k)}
                >
                  {x.t}
                </button>
              ))}
            </div>

            <div className="d-flex flex-column gap-3">
              {flights.map((f) => (
                <FlightCard
                  key={f.id}
                  flight={f}
                  onOpenDetail={(flight) => {
                    setManualSelectedId(flight.id);

                    const next = new URLSearchParams(location.search);
                    next.set("detail", flight.id);
                    navigate(`${location.pathname}?${next.toString()}`, {
                      replace: true,
                    });
                  }}
                />
              ))}
            </div>

            {flights.length === 0 && (
              <div className="text-muted small mt-3">
                Không có kết quả phù hợp bộ lọc. Bạn thử “Cài lại tất cả” nhé.
              </div>
            )}

            <Modal
              show={!!selectedFlight}
              onHide={closeDetail}
              centered
              size="lg"
              backdrop="static"
            >
              <DetailFlightCard flight={selectedFlight} onClose={closeDetail} />
            </Modal>
          </div>
        </div>
      </Container>
    </div>
  );
}
