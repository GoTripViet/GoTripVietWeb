import React from "react";
import Modal from "react-bootstrap/Modal";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const StopsText = (processTag) => {
  if (!processTag) return "";
  if (processTag.type === "direct") return "Bay thẳng";
  return processTag.label || "";
};

export default function DetailFlightCard({ flight, onClose }) {
  if (!flight) return null;

  const lines = flight.lines || [];
  const outbound = lines[0];
  const inbound = lines[1];

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
        <button type="button" className="btn btn-link p-0 mb-3">
          <i className="bi bi-share me-2" />
          Chia sẻ
        </button>

        {/* outbound */}
        {outbound ? (
          <div className="mb-4">
            <div className="fw-bold">Chuyến bay đến</div>
            <div className="small text-muted">
              {StopsText(outbound.processTag)}
              {outbound.durationText ? ` · ${outbound.durationText}` : ""}
            </div>

            <div className="d-flex justify-content-between mt-3">
              <div>
                <div className="small text-muted">{outbound.depDate}</div>
                <div className="fw-bold">
                  {outbound.depAirport} -{" "}
                  {outbound.depAirportName || "Sân bay khởi hành"}
                </div>
                <div className="small text-muted">{outbound.depTime}</div>
              </div>

              <div className="text-end">
                <div className="small text-muted">{outbound.arrDate}</div>
                <div className="fw-bold">
                  {outbound.arrAirport} -{" "}
                  {outbound.arrAirportName || "Sân bay đến"}
                </div>
                <div className="small text-muted">{outbound.arrTime}</div>
              </div>
            </div>

            <div className="small text-muted mt-2">
              {outbound.airlineName ? outbound.airlineName : ""}
              {outbound.flightNo ? ` · ${outbound.flightNo}` : ""}
              {outbound.durationText
                ? ` · Thời gian bay ${outbound.durationText}`
                : ""}
            </div>
          </div>
        ) : null}

        {/* inbound */}
        {inbound ? (
          <div className="mb-4">
            <div className="fw-bold">Chuyến bay về</div>
            <div className="small text-muted">
              {StopsText(inbound.processTag)}
              {inbound.durationText ? ` · ${inbound.durationText}` : ""}
            </div>

            <div className="d-flex justify-content-between mt-3">
              <div>
                <div className="small text-muted">{inbound.depDate}</div>
                <div className="fw-bold">
                  {inbound.depAirport} -{" "}
                  {inbound.depAirportName || "Sân bay khởi hành"}
                </div>
                <div className="small text-muted">{inbound.depTime}</div>
              </div>

              <div className="text-end">
                <div className="small text-muted">{inbound.arrDate}</div>
                <div className="fw-bold">
                  {inbound.arrAirport} -{" "}
                  {inbound.arrAirportName || "Sân bay đến"}
                </div>
                <div className="small text-muted">{inbound.arrTime}</div>
              </div>
            </div>

            <div className="small text-muted mt-2">
              {inbound.airlineName ? inbound.airlineName : ""}
              {inbound.flightNo ? ` · ${inbound.flightNo}` : ""}
              {inbound.durationText
                ? ` · Thời gian bay ${inbound.durationText}`
                : ""}
            </div>
          </div>
        ) : null}

        <hr />

        {/* baggage */}
        <div className="d-flex justify-content-between align-items-start py-2">
          <div>
            <div className="fw-bold">Hành lý tiêu chuẩn</div>
            <div className="small text-muted">
              Tổng số hành lý được bao gồm trong giá
            </div>
          </div>
          <div className="text-end small" style={{ color: "#198754" }}>
            Đã bao gồm
          </div>
        </div>

        <div className="small d-flex flex-column gap-2 mb-3">
          {flight?.baggage?.personal ? (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-briefcase" /> Vật dụng cá nhân
            </div>
          ) : null}
          {flight?.baggage?.carryOn ? (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-suitcase2" /> Hành lý xách tay
            </div>
          ) : null}
          {flight?.baggage?.checked ? (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-luggage" /> Hành lý ký gửi
            </div>
          ) : null}
        </div>

        <hr />

        {/* ticket conditions */}
        <div className="py-2">
          <div className="fw-bold">Điều kiện vé</div>
          <div className="small text-muted mb-2">
            Thông tin chính sách hữu ích
          </div>

          <div className="small d-flex flex-column gap-2">
            <div className="d-flex gap-2">
              <i className="bi bi-arrow-repeat" />
              <div>
                Bạn được phép đổi chuyến bay này{" "}
                {flight.flexible ? " (có trả phí)" : ""}
              </div>
            </div>
            <div className="d-flex gap-2">
              <i className="bi bi-x-circle" />
              <div>
                Bạn được phép huỷ chuyến bay này{" "}
                {flight.flexible ? " (có trả phí)" : ""}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* extras */}
        <div className="py-2">
          <div className="fw-bold">Dịch vụ bổ sung bạn có thể muốn</div>
          <div className="small text-muted mb-2">Có thể mua thêm</div>

          <div className="small d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <div className="d-flex gap-2">
                <i className="bi bi-luggage" />
                <div>Hành lý ký gửi</div>
              </div>
              <div className="text-muted">Có ở các bước tiếp theo</div>
            </div>

            <div className="d-flex justify-content-between">
              <div className="d-flex gap-2">
                <i className="bi bi-calendar2-check" />
                <div>Vé linh động</div>
              </div>
              <div className="text-muted">Có ở các bước tiếp theo</div>
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
