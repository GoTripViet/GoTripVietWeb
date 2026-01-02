import React from "react";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const Tag = ({ text }) => {
  const isBest = text === "Tốt nhất";
  return (
    <span
      className="px-2 py-1 rounded-2 small fw-semibold me-2"
      style={{
        color: isBest ? "#0d6efd" : "#146c43",
        background: isBest ? "#e7f1ff" : "#e8f5ee",
      }}
    >
      {text}
    </span>
  );
};

const ProcessTag = ({ tag }) => {
  if (!tag) return null;
  const isDirect = tag.type === "direct";
  return (
    <div className="d-inline-flex flex-column align-items-center">
      <span
        className="px-2 py-1 rounded-2 small fw-semibold"
        style={{
          background: isDirect ? "#198754" : "#fff",
          color: isDirect ? "#fff" : "#111",
          border: isDirect ? "none" : "1px solid #dee2e6",
        }}
      >
        {tag.label}
      </span>
      <div className="small text-muted mt-1">{/* duration text */}</div>
    </div>
  );
};

const BaggageIcons = ({ baggage }) => {
  // chỉ icon, hover mới show box
  const hasPersonal = !!baggage?.personal;
  const hasCarry = !!baggage?.carryOn;
  const hasChecked = !!baggage?.checked;

  return (
    <div className="position-relative d-inline-block baggage-wrap">
      <div className="d-flex justify-content-end gap-2">
        {hasPersonal ? <i className="bi bi-briefcase" /> : null}
        {hasCarry ? <i className="bi bi-suitcase2" /> : null}
        {hasChecked ? <i className="bi bi-luggage" /> : null}
      </div>

      <div className="baggage-pop border rounded-3 shadow bg-white p-3">
        <div className="fw-bold mb-2">Hành lý tiêu chuẩn</div>
        <div className="small d-flex flex-column gap-2">
          {hasPersonal ? (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-briefcase" /> Vật dụng cá nhân
            </div>
          ) : null}
          {hasCarry ? (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-suitcase2" /> Hành lý xách tay
            </div>
          ) : null}
          {hasChecked ? (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-luggage" /> Hành lý ký gửi
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        .baggage-wrap .baggage-pop{
          display:none;
          position:absolute;
          right:0;
          top:100%;
          margin-top:8px;
          width:240px;
          z-index:20;
        }
        .baggage-wrap:hover .baggage-pop{ display:block; }
      `}</style>
    </div>
  );
};

const AirlineLogoStack = ({ logos = [] }) => {
  const list = Array.isArray(logos) ? logos.filter(Boolean) : [];
  const maxShow = 2;
  const show = list.slice(0, maxShow);
  const more = list.length - show.length;

  if (list.length === 0) {
    return (
      <div
        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
        style={{ width: 28, height: 28 }}
      >
        <i className="bi bi-airplane" />
      </div>
    );
  }

  return (
    <div
      className="position-relative d-inline-flex align-items-center"
      style={{ height: 26 }}
    >
      <div className="d-flex align-items-center">
        {show.map((src, idx) => (
          <img
            key={src + idx}
            src={src}
            alt="airline"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #e9ecef",
              marginLeft: idx === 0 ? 0 : -8,
              background: "#fff",
            }}
          />
        ))}
      </div>

      {more > 0 ? (
        <span
          className="position-absolute d-flex align-items-center justify-content-center fw-semibold"
          style={{
            right: -6,
            bottom: -6,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "#fff",
            border: "1px solid #dee2e6",
            fontSize: 11,
            lineHeight: "18px",
            color: "#495057",
          }}
          title={list.slice(maxShow).join(", ")}
        >
          +{more}
        </span>
      ) : null}
    </div>
  );
};

export default function FlightCard({ flight, onOpenDetail }) {
  const lines = flight.lines || [];
  const joinAirlinesSmart = (arr = [], max = 4) => {
    const a = (arr || []).filter(Boolean);
    if (a.length <= max) return a.join(", ");
    return `${a.slice(0, max).join(", ")} +${a.length - max}`;
  };
  return (
    <div className="border rounded-3 bg-white overflow-hidden">
      <div className="row g-0">
        {/* A: info */}
        <div className="col-12 col-lg-8 p-3">
          {/* tags */}
          <div className="mb-2">
            {(flight.tags || []).map((t) => (
              <Tag key={t} text={t} />
            ))}
            {flight.best ? <Tag text="Tốt nhất" /> : null}
          </div>

          {/* lines */}
          <div className="d-flex flex-column gap-3">
            {lines.map((ln, idx) => (
              <div key={idx} className="d-flex align-items-center gap-3">
                {/* logo placeholder */}
                <div style={{ width: 54 }}>
                  <AirlineLogoStack
                    logos={[
                      ...new Set(
                        (ln.segments || [])
                          .map((s) => s.airlineLogo)
                          .filter(Boolean)
                      ),
                    ]}
                  />
                </div>

                {/* dep */}
                <div style={{ minWidth: 90 }}>
                  <div className="fw-bold">{ln.depTime}</div>
                  <div className="small text-muted">
                    {ln.segments?.[0]?.fromIata || ln.depAirport}
                    {ln.segments?.[0]?.cabinClass
                      ? ` · ${ln.segments[0].cabinClass}`
                      : ""}
                    {` · ${ln.depDate}`}
                  </div>
                </div>

                {/* process */}
                <div className="flex-grow-1 text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div
                      className="flex-grow-1"
                      style={{ height: 2, background: "#dee2e6" }}
                    />
                    <ProcessTag tag={ln.processTag} />
                    <div
                      className="flex-grow-1"
                      style={{ height: 2, background: "#dee2e6" }}
                    />
                  </div>
                  <div className="small text-muted mt-1">{ln.durationText}</div>
                </div>

                {/* arr */}
                <div style={{ minWidth: 90 }} className="text-end">
                  <div className="fw-bold">{ln.arrTime}</div>
                  <div className="small text-muted">
                    {ln.arrAirport} · {ln.arrDate}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* operated by */}
          {flight.operatedBy ? (
            <div className="small text-muted mt-3">
              {flight.operatedBy || joinAirlinesSmart(flight.airlines, 4)}
            </div>
          ) : null}
        </div>

        {/* B: payment + detail */}
        <div className="col-12 col-lg-4 p-3 border-start">
          <div className="d-flex justify-content-end mb-2">
            <BaggageIcons baggage={flight.baggage} />
          </div>

          <div className="d-flex align-items-center justify-content-between">
            <div />
            <div className="fw-bold fs-5">{formatVND(flight.price)}</div>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary w-100 mt-2"
            onClick={() => onOpenDetail?.(flight)}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
