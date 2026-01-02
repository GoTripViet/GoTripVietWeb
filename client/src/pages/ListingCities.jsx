import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import PlaneSearch from "../components/search/PlaneSearch.jsx";

// đổi path import theo project của bạn
import { CITY_DEALS, CITY_OFFERS } from "../data/HomeData.jsx";

import FilterBar from "../components/cities/FilterBar.jsx";
import GridLayout from "../components/GridLayout.jsx";
import CityCard from "../components/cities/CityCard.jsx";
import ExpandCard from "../components/cities/ExpandCard.jsx";

const DEFAULT_FILTERS = {
  sort: "popular", // popular | cheapest | fastest
  stops: "any", // any | direct | oneStop
  priceMax: 9000000,
  durationMaxHours: 24,
  departTime: [0, 24],
  returnTime: [0, 24],
};

export default function ListingCities() {
  const location = useLocation();
  const navigate = useNavigate();
  const q = useMemo(() => {
    const v = new URLSearchParams(location.search).get("q");
    return (v || "").trim();
  }, [location.search]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedCityId, setSelectedCityId] = useState(() => {
    if (!q) return null;
    const found = CITY_DEALS.find(
      (c) => c.title.toLowerCase() === q.toLowerCase()
    );
    return found ? found.id : null;
  });

  // state nhận từ PlaneSearch (để ExpandCard hiển thị “ngày bay”)
  const [planeSearchState, setPlaneSearchState] = useState(null);

  const filteredCities = useMemo(() => {
    let arr = [...CITY_DEALS];

    // stops
    if (filters.stops === "direct")
      arr = arr.filter((c) => (c.minStops ?? 99) === 0);
    if (filters.stops === "oneStop")
      arr = arr.filter((c) => (c.minStops ?? 99) <= 1);

    // price
    arr = arr.filter((c) => (c.price ?? 0) <= filters.priceMax);

    // duration
    arr = arr.filter((c) => (c.fastestHours ?? 99) <= filters.durationMaxHours);

    // sort
    if (filters.sort === "cheapest")
      arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (filters.sort === "fastest")
      arr.sort((a, b) => (a.fastestHours ?? 99) - (b.fastestHours ?? 99));
    else arr.sort((a, b) => (b.popularScore ?? 0) - (a.popularScore ?? 0));

    return arr;
  }, [filters]);

  const selectedCity = useMemo(
    () => CITY_DEALS.find((c) => c.id === selectedCityId) || null,
    [selectedCityId]
  );

  return (
    <div className="py-3">
      <Container className="my-2">
        <PlaneSearch onSearch={(r) => setPlaneSearchState(r)} />
      </Container>

      <Container className="my-2">
        <FilterBar
          value={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />
      </Container>

      <Container className="my-3">
        <div className="row g-3 align-items-start">
          {selectedCity ? (
            <>
              <div className="col-12 col-lg-4">
                <ExpandCard
                  city={selectedCity}
                  offers={CITY_OFFERS[selectedCity.id] || []}
                  planeSearchState={planeSearchState}
                  onClose={() => setSelectedCityId(null)}
                  onSearchAllFlights={() => {
                    // lấy thông tin từ planeSearchState (fallback nếu chưa có)
                    const fromIata =
                      planeSearchState?.fromIata ||
                      planeSearchState?.from?.iata ||
                      "SGN";
                    const toIata =
                      planeSearchState?.toIata ||
                      planeSearchState?.to?.iata ||
                      "HND";

                    const departLabel =
                      planeSearchState?.departLabel ||
                      planeSearchState?.dateLabel ||
                      planeSearchState?.dates ||
                      "";

                    // bạn có thể bổ sung returnLabel nếu PlaneSearch có
                    const returnLabel = planeSearchState?.returnLabel || "";

                    // ✅ vừa truyền query để refresh vẫn giữ, vừa truyền state để dùng ngay
                    const qs = new URLSearchParams({
                      city: selectedCity.title,
                      from: fromIata,
                      to: toIata,
                      depart: departLabel,
                      ret: returnLabel,
                    }).toString();

                    navigate(`/flights?${qs}`, {
                      state: {
                        city: selectedCity,
                        planeSearchState,
                      },
                    });
                  }}
                />
              </div>
              <div className="col-12 col-lg-8">
                <GridLayout
                  items={filteredCities}
                  columnsLg={4}
                  className=""
                  renderItem={(c) => (
                    <CityCard
                      city={c}
                      active={c.id === selectedCityId}
                      onClick={() => setSelectedCityId(c.id)}
                    />
                  )}
                />
              </div>
            </>
          ) : (
            <div className="col-12">
              <GridLayout
                items={filteredCities}
                columnsLg={4}
                className=""
                renderItem={(c) => (
                  <CityCard
                    city={c}
                    active={false}
                    onClick={() => setSelectedCityId(c.id)}
                  />
                )}
              />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
