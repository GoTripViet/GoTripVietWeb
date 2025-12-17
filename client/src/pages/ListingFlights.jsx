import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";

import FilterBar from "../components/flights/FliterBar.jsx";
import FlightCard from "../components/flights/FlightCard.jsx";
import DetailFlightCard from "../components/flights/DetailFlightCard.jsx";

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

// dummy data (thay bằng api sau)
const DUMMY_FLIGHTS = [
  {
    id: "f1",
    tags: ["Rẻ nhất", "Có thể nâng lên thành vé linh hoạt"],
    flexible: true,
    best: false,
    price: 29199642,
    baggage: { personal: true, carryOn: true, checked: true },
    lines: [
      {
        airlineLogos: ["VA"], // bạn thay bằng url logo nếu có
        depTime: "14:50",
        depAirport: "SGN",
        depDate: "17 tháng 1",
        processTag: { type: "stops", label: "1 điểm dừng" },
        durationText: "29 giờ 55 phút",
        arrTime: "22:45",
        arrAirport: "HND",
        arrDate: "18 tháng 1",
      },
      {
        airlineLogos: ["CX", "MU"],
        depTime: "08:40",
        depAirport: "HND",
        depDate: "22 tháng 1",
        processTag: { type: "stops", label: "3 điểm dừng" },
        durationText: "33 giờ 50 phút",
        arrTime: "06:30",
        arrAirport: "GRU",
        arrDate: "23 tháng 1",
      },
    ],
    operatedBy:
      "VietJet Aviation, Hong Kong Express, China Eastern Airlines, Copa Airlines",
    totalDurationHours: 54,
    stopsMax: 3,
    airlines: ["VietJet", "Hong Kong Express", "China Eastern", "Copa"],
    departMin: timeToMinutes("14:50"),
    arriveMin: timeToMinutes("22:45"),
  },
  {
    id: "f2",
    tags: ["Nhanh nhất", "Bay thẳng rẻ nhất"],
    flexible: false,
    best: true,
    price: 75980407,
    baggage: { personal: true, carryOn: true, checked: true },
    lines: [
      {
        airlineLogos: ["NH"],
        depTime: "23:05",
        depAirport: "SGN",
        depDate: "17 tháng 1",
        processTag: { type: "direct", label: "Bay thẳng" },
        durationText: "5 giờ 55 phút",
        arrTime: "07:00",
        arrAirport: "HND",
        arrDate: "18 tháng 1",
      },
      {
        airlineLogos: ["AA"],
        depTime: "17:10",
        depAirport: "HND",
        depDate: "22 tháng 1",
        processTag: { type: "stops", label: "1 điểm dừng" },
        durationText: "24 giờ 55 phút",
        arrTime: "06:05",
        arrAirport: "GRU",
        arrDate: "23 tháng 1",
      },
    ],
    operatedBy:
      "Vietnam Airlines, điều hành bởi NH, Japan Airlines, điều hành bởi American Airlines",
    totalDurationHours: 31,
    stopsMax: 1,
    airlines: [
      "Vietnam Airlines",
      "All Nippon Airways",
      "Japan Airlines",
      "American Airlines",
    ],
    departMin: timeToMinutes("23:05"),
    arriveMin: timeToMinutes("07:00"),
  },
];

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
    const all = new Set(airlineStats.map((x) => x.name));
    return { ...DEFAULT_FILTERS, airlines: all };
  });

  const [sortMode, setSortMode] = useState("best"); // best | cheap | fast
  const [selectedFlight, setSelectedFlight] = useState(null);

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
                setFilters({
                  ...DEFAULT_FILTERS,
                  airlines: new Set(airlineStats.map((x) => x.name)),
                });
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
                  onOpenDetail={(flight) => setSelectedFlight(flight)}
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
              onHide={() => setSelectedFlight(null)}
              centered
              size="lg"
              backdrop="static"
            >
              <DetailFlightCard
                flight={selectedFlight}
                onClose={() => setSelectedFlight(null)}
              />
            </Modal>
          </div>
        </div>
      </Container>
    </div>
  );
}
