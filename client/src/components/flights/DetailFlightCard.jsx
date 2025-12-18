import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const StopsText = (processTag) => {
  if (!processTag) return "";
  if (processTag.type === "direct") return "Bay thẳng";
  return processTag.label || "";
};

const SmallLogo = ({ src }) => {
  if (!src) return null;
  return (
    <img
      src={src}
      alt="airline"
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid #e9ecef",
        background: "#fff",
      }}
    />
  );
};

const SegmentRow = ({ seg }) => {
  if (!seg) return null;

  return (
    <div className="border rounded-3 p-3 mb-2">
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex gap-2">
          <SmallLogo src={seg.airlineLogo} />
          <div>
            <div className="fw-semibold">{seg.airlineName}</div>
            <div className="small text-muted">
              {seg.cabinClass ? seg.cabinClass : ""}
            </div>
          </div>
        </div>

        <div className="small text-muted">
          {seg.durationText ? `Thời gian bay ${seg.durationText}` : ""}
        </div>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <div>
          <div className="small text-muted">{seg.departDate}</div>
          <div className="fw-bold">
            {seg.fromIata} - {seg.fromName}
          </div>
          <div className="small text-muted">{seg.departTime}</div>
        </div>

        <div className="text-end">
          <div className="small text-muted">{seg.arriveDate}</div>
          <div className="fw-bold">
            {seg.toIata} - {seg.toName}
          </div>
          <div className="small text-muted">{seg.arriveTime}</div>
        </div>
      </div>
    </div>
  );
};

const LayoverBox = ({ layover }) => {
  if (!layover?.durationText) return null;

  if (layover.type === "self_transfer") {
    return (
      <div className="border rounded-3 p-3 mb-2 bg-light">
        <div className="fw-bold">Tự chuyển tiếp trong lúc quá cảnh</div>
        <div className="small text-muted mt-2 d-flex flex-column gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-clock" />
            <span>Quá cảnh {layover.durationText}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-check" />
            <span>
              Tự chuyển tiếp có đảm bảo - bạn được hỗ trợ cho việc chuyển tiếp
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-luggage" />
            <span>Nhận và ký gửi lại hành lý cho chuyến bay tiếp theo</span>
          </div>
        </div>

        <button type="button" className="btn btn-link p-0 mt-2 small">
          Tự chuyển tiếp là gì ?
        </button>
      </div>
    );
  }

  // type normal
  return (
    <div className="small text-muted d-flex align-items-center gap-2 mb-2">
      <i className="bi bi-clock" />
      <span>Quá cảnh {layover.durationText}</span>
    </div>
  );
};

const getLayoverAfter = (line, idx) => {
  const arr = Array.isArray(line?.layovers) ? line.layovers : [];
  // fallback: nếu line còn kiểu cũ (layover), vẫn chạy
  if (arr.length === 0 && line?.layover && line.layover.afterIndex === idx)
    return line.layover;
  return arr.find((l) => l.afterIndex === idx) || null;
};

const TimelineLine = ({ title, line }) => {
  if (!line) return null;
  const segs = line.segments || [];

  return (
    <div className="mb-4">
      <div className="fw-bold">{title}</div>
      <div className="small text-muted">
        {StopsText(line.processTag)}{" "}
        {line.durationText ? `· ${line.durationText}` : ""}
      </div>

      <div className="mt-3">
        {segs.map((seg, idx) => (
          <React.Fragment key={idx}>
            {/* segment timeline row */}
            <div className="d-flex gap-3">
              {/* left timeline */}
              <div
                style={{ width: 18 }}
                className="d-flex flex-column align-items-center"
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    border: "2px solid #adb5bd",
                    background: "#fff",
                    marginTop: 4,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    width: 2,
                    background: "#adb5bd",
                    minHeight: 46,
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    border: "2px solid #adb5bd",
                    background: "#fff",
                  }}
                />
              </div>

              {/* middle: time + airport */}
              <div className="flex-grow-1">
                <div className="small text-muted">{seg.departDate}</div>
                <div className="fw-bold">
                  {seg.fromIata} - {seg.fromName}
                </div>

                <div className="small text-muted mt-1">{seg.departTime}</div>

                <div className="mt-3 small text-muted">{seg.arriveDate}</div>
                <div className="fw-bold">
                  {seg.toIata} - {seg.toName}
                </div>
                <div className="small text-muted mt-1">{seg.arriveTime}</div>
              </div>

              {/* right: airline info */}
              <div style={{ width: 190 }} className="text-end">
                <div className="d-inline-flex align-items-center gap-2 justify-content-end">
                  <SmallLogo src={seg.airlineLogo} />
                  <div className="text-start">
                    <div className="small fw-semibold">{seg.airlineName}</div>
                    <div className="small text-muted">
                      {seg.flightNo ? `${seg.flightNo} · ` : ""}
                      {seg.cabinClass || ""}
                    </div>
                    <div className="small text-muted">
                      {seg.durationText
                        ? `Thời gian bay ${seg.durationText}`
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* layover between segments */}
            {idx < segs.length - 1 ? (
              <div className="d-flex gap-3 my-2">
                <div
                  style={{ width: 18 }}
                  className="d-flex flex-column align-items-center"
                >
                  <div
                    style={{ width: 2, background: "#adb5bd", height: 10 }}
                  />
                </div>

                <div className="flex-grow-1">
                  {getLayoverAfter(line, idx) ? (
                    <LayoverBox layover={getLayoverAfter(line, idx)} />
                  ) : null}
                </div>

                <div style={{ width: 190 }} />
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default function DetailFlightCard({ flight, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!flight) return null;

  const lines = flight.lines || [];
  const outbound = lines[0];
  const inbound = lines[1];

  const buildShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("detail", flight.id); // ✅ mở đúng modal
    return url.toString();
  };

  const handleShare = async () => {
    const shareUrl = buildShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback cho browser chặn clipboard
      window.prompt("Sao chép liên kết này:", shareUrl);
    }
  };

  return (
    <>
      <Modal.Header closeButton onHide={onClose}>
        <Modal.Title className="fw-bold">
          Chuyến bay của bạn
          {flight?.city ? ` tới ${flight.city}` : ""}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* share */}
        <button
          type="button"
          className="btn btn-link p-0 mb-3"
          onClick={handleShare}
        >
          <i className="bi bi-share me-2" />
          Chia sẻ
        </button>
        {copied ? (
          <Alert variant="success" className="py-2 small mb-3">
            Đã sao chép địa chỉ. Bạn chỉ cần dán để mở đúng chi tiết chuyến bay
            này.
          </Alert>
        ) : null}

        {/* outbound */}
        {outbound ? (
          <TimelineLine title="Chuyến bay đến" line={outbound} />
        ) : null}

        {/* inbound */}
        {inbound ? <TimelineLine title="Chuyến bay về" line={inbound} /> : null}

        {/* baggage + rules + extras kiểu 2 cột */}

        <div className="border-top pt-3">
          {/* Hành lý tiêu chuẩn */}
          <div
            className="row g-0 py-3"
            style={{ borderBottom: "1px solid #e9ecef" }}
          >
            <div className="col-12 col-md-4 pe-md-3">
              <div className="fw-bold">Hành lý tiêu chuẩn</div>
              <div className="small text-muted">
                Tổng số hành lý được bao gồm trong giá
              </div>
            </div>

            <div
              className="col-12 col-md-8 ps-md-3"
              style={{ borderLeft: "1px solid #e9ecef" }}
            >
              <div className="d-flex flex-column gap-3">
                {flight?.baggageDetails?.personal ? (
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-2">
                      <i className="bi bi-briefcase fs-5" />
                      <div>
                        <div className="fw-semibold">
                          {flight.baggageDetails.personal.title}
                        </div>
                        <div className="small text-muted">
                          {flight.baggageDetails.personal.desc}
                        </div>
                      </div>
                    </div>
                    <div
                      className="small fw-semibold"
                      style={{ color: "#198754" }}
                    >
                      Đã bao gồm
                    </div>
                  </div>
                ) : null}

                {flight?.baggageDetails?.carryOn ? (
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-2">
                      <i className="bi bi-suitcase2 fs-5" />
                      <div>
                        <div className="fw-semibold">
                          {flight.baggageDetails.carryOn.title}
                        </div>
                        <div className="small text-muted">
                          {flight.baggageDetails.carryOn.desc}
                        </div>
                      </div>
                    </div>
                    <div
                      className="small fw-semibold"
                      style={{ color: "#198754" }}
                    >
                      Đã bao gồm
                    </div>
                  </div>
                ) : null}

                {flight?.baggageDetails?.checked ? (
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-2">
                      <i className="bi bi-luggage fs-5" />
                      <div>
                        <div className="fw-semibold">
                          {flight.baggageDetails.checked.title}
                        </div>
                        <div className="small text-muted">
                          {flight.baggageDetails.checked.desc}
                        </div>
                      </div>
                    </div>
                    <div
                      className="small fw-semibold"
                      style={{ color: "#198754" }}
                    >
                      Đã bao gồm
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Điều kiện vé */}
          <div
            className="row g-0 py-3"
            style={{ borderBottom: "1px solid #e9ecef" }}
          >
            <div className="col-12 col-md-4 pe-md-3">
              <div className="fw-bold">Điều kiện vé</div>
              <div className="small text-muted">
                Thông tin chính sách hữu ích
              </div>
            </div>

            <div
              className="col-12 col-md-8 ps-md-3"
              style={{ borderLeft: "1px solid #e9ecef" }}
            >
              <div className="d-flex flex-column gap-2">
                {(flight.ticketRules || []).map((r, idx) => (
                  <div key={idx} className="d-flex gap-2">
                    <i className={`bi ${r.icon} fs-5`} />
                    <div className="small">{r.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dịch vụ bổ sung */}
          <div className="row g-0 py-3">
            <div className="col-12 col-md-4 pe-md-3">
              <div className="fw-bold">Dịch vụ bổ sung bạn có thể muốn</div>
              <div className="small text-muted">Có thể mua thêm</div>
            </div>

            <div
              className="col-12 col-md-8 ps-md-3"
              style={{ borderLeft: "1px solid #e9ecef" }}
            >
              <div className="d-flex flex-column gap-3">
                {(flight.extras || []).map((x, idx) => (
                  <div
                    key={idx}
                    className="d-flex justify-content-between gap-3"
                  >
                    <div className="d-flex gap-2">
                      <i className={`bi ${x.icon} fs-5`} />
                      <div>
                        <div className="fw-semibold">{x.title}</div>
                        {x.sub ? (
                          <div className="small text-muted">{x.sub}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="small text-muted">
                      {x.note || "Có ở các bước tiếp theo"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr />

        <div className="small text-muted">
          Chuyến đi này gồm các vé một chiều riêng biệt, mỗi vé có quy định
          riêng về việc huỷ và thay đổi.
        </div>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div className="fw-bold fs-5">{formatVND(flight.price)}</div>
        <button
          type="button"
          className="btn btn-primary px-4"
          onClick={onClose}
        >
          Tiếp tục
        </button>
      </Modal.Footer>
    </>
  );
}
