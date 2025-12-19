import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import ProgressBar from "../components/ProgressBar";
import UserCard from "../components/flights/UserCard";

const formatVND = (v) =>
  (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const getStoredFlight = () => {
  try {
    const raw = sessionStorage.getItem("order_flight");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const buildTripSummary = (flight) => {
  const outbound = flight?.lines?.[0];
  const inbound = flight?.lines?.[1];

  const firstSeg = outbound?.segments?.[0];
  const lastSeg = outbound?.segments?.[outbound?.segments?.length - 1];

  const isRoundTrip = !!inbound;

  return {
    isRoundTrip,
    fromCity: toCityLabel(
      firstSeg?.fromName,
      firstSeg?.fromIata || outbound?.depAirport || ""
    ),
    toCity: toCityLabel(
      lastSeg?.toName,
      lastSeg?.toIata || outbound?.arrAirport || ""
    ),
    departText: firstSeg?.departDate || outbound?.depDate || "",
    arriveText: lastSeg?.arriveDate || outbound?.arrDate || "",
  };
};

const defaultPassengers = [{ type: "adult" }, { type: "adult" }]; // demo

const toCityLabel = (name = "", fallback = "") => {
  // bỏ prefix dài
  let s = name
    .replace(/Sân bay Quốc tế\s*/i, "")
    .replace(/Sân bay\s*/i, "")
    .trim();

  // một vài case hay gặp
  const map = {
    "Tân Sơn Nhất": "TP. Hồ Chí Minh",
    "Nội Bài": "Hà Nội",
    "Đà Nẵng": "Đà Nẵng",
    "Cam Ranh": "Nha Trang",
    "Phú Quốc": "Phú Quốc",
    "Haneda Airport": "Tokyo",
    "Tokyo Haneda Airport": "Tokyo",
    Changi: "Singapore",
  };

  if (map[s]) return map[s];

  // nếu còn chuỗi dài quá thì lấy chữ cuối (thường là thành phố)
  if (s.length > 22) {
    const parts = s.split(" ");
    return parts.slice(-2).join(" ");
  }

  return s || fallback;
};

export default function OrderFlight() {
  const location = useLocation();
  const navigate = useNavigate();

  const flight = useMemo(() => getStoredFlight(), [location.key]);

  const summary = useMemo(() => buildTripSummary(flight), [flight]);

  const [step, setStep] = useState(1); // 1..4
  const [priceOpen, setPriceOpen] = useState(false);
  // phí add-on cho loại vé (bạn chỉnh số cho đúng)
  const STANDARD_FARE_FEE = 0;
  const FLEXIBLE_FARE_FEE = 310868; // ví dụ, bạn đổi theo logic thật

  const [fareType, setFareType] = useState("standard"); // "standard" | "flexible"

  const fareFee =
    fareType === "flexible" ? FLEXIBLE_FARE_FEE : STANDARD_FARE_FEE;
  const fareLabel = fareType === "flexible" ? "Vé linh hoạt" : "Vé tiêu chuẩn";

  const baseFlightPrice = flight.price || 0;

  // ✅ chỉ cộng phí loại vé khi đã qua step 2 (tức step >= 2)
  const addOnFee = step >= 2 ? fareFee : 0;

  const totalPrice = baseFlightPrice + addOnFee;

  // passengers demo: sau này lấy từ PlaneSearch (adult/child)
  const [passengers, setPassengers] = useState(
    () => flight?.passengers || defaultPassengers
  );

  const adultCount = passengers.filter((p) => p.type === "adult").length;
  const childCount = passengers.filter((p) => p.type === "child").length;

  // state cho contact info
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // pet info
  const [petOpen, setPetOpen] = useState(false);

  if (!flight) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Không tìm thấy dữ liệu chuyến bay. Vui lòng quay lại danh sách chuyến
          bay và chọn lại.
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/flights")}
        >
          Quay lại danh sách chuyến bay
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-bottom">
        <div className="container py-3">
          <ProgressBar
            activeStep={step}
            steps={[
              "Thông tin của bạn",
              "Loại vé",
              "Dịch vụ bổ sung",
              "Kiểm tra và thanh toán",
            ]}
          />
          <br></br>
          {/* top summary */}
          <div className="small text-muted mb-2">
            {summary.isRoundTrip ? "Khứ hồi" : "Một chiều"} ·{" "}
            {adultCount + childCount} hành khách · {summary.departText}
            {summary.arriveText ? ` - ${summary.arriveText}` : ""}
          </div>

          <div className="display-6 fw-bold mb-4">
            Từ {summary.fromCity} đến {summary.toCity}
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          {/* LEFT */}
          <div className="col-12 col-lg-8">
            {step === 1 ? (
              <>
                {/* ===== STEP 1: Thông tin của bạn ===== */}
                <div className="fw-bold fs-4">Điền thông tin của bạn</div>
                <div className="text-muted mb-3">
                  Thêm thông tin khách và xem lại lựa chọn hành lý
                </div>

                {/* user cards */}
                <div className="d-flex flex-column gap-3">
                  {passengers.map((p, idx) => (
                    <UserCard
                      key={idx}
                      index={idx}
                      type={p.type}
                      baggageDetails={flight.baggageDetails}
                      value={p}
                      onChange={(next) => {
                        setPassengers((prev) => {
                          const copy = [...prev];
                          copy[idx] = next;
                          return copy;
                        });
                      }}
                    />
                  ))}
                </div>

                {/* contact info */}
                <div className="mt-4">
                  <div className="fw-bold fs-4">Thông tin liên lạc</div>
                  <div className="small text-muted mb-2">
                    <span className="text-danger">*</span> Bắt buộc
                  </div>

                  <div className="border rounded-3 p-3">
                    <label className="form-label fw-semibold">
                      Email liên lạc <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control mb-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@domain.com"
                    />
                    <div className="small text-muted mb-3">
                      Chúng tôi sẽ gửi xác nhận chuyến bay của bạn đến đây
                    </div>

                    <label className="form-label fw-semibold">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>

                    <div className="d-flex gap-2">
                      <select className="form-select" style={{ maxWidth: 110 }}>
                        <option value="+84">🇻🇳 +84</option>
                      </select>
                      <input
                        className="form-control"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                </div>

                {/* helpful info - pet */}
                <div className="mt-3">
                  <button
                    className="w-100 border rounded-3 p-3 bg-white d-flex justify-content-between align-items-center"
                    onClick={() => setPetOpen((v) => !v)}
                    type="button"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ fontSize: 24 }}>🐶</div>
                      <div className="text-start">
                        <div className="fw-bold">Thông tin hữu ích</div>
                        <div className="text-primary small">
                          Đi cùng vật nuôi
                        </div>
                      </div>
                    </div>
                    <i
                      className={`bi ${
                        petOpen ? "bi-chevron-up" : "bi-chevron-right"
                      }`}
                    />
                  </button>

                  <Collapse in={petOpen}>
                    <div className="border border-top-0 rounded-bottom-3 p-3">
                      <div className="fw-bold mb-2">Cách đi cùng vật nuôi</div>
                      <div className="small text-muted">
                        Nếu bạn đi cùng vật nuôi hoặc động vật phục vụ, hãy liên
                        hệ với chúng tôi sau khi đặt vé. Chúng tôi có thể giúp
                        sắp xếp việc đặt vé cho vật nuôi hoặc hướng dẫn bạn đến
                        hãng hàng không để thực hiện việc này.
                        <br />
                        <br />
                        Bạn có thể sẽ cần phải trả phí vật nuôi, hoàn tất một số
                        thủ tục giấy tờ nhất định và tuân thủ mọi giới hạn về
                        kích thước.
                      </div>
                    </div>
                  </Collapse>
                </div>

                {/* bottom nav */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button className="btn btn-link" onClick={() => navigate(-1)}>
                    <i className="bi bi-chevron-left me-1" />
                    Quay lại
                  </button>

                  <button
                    className="btn btn-primary px-4"
                    onClick={() => setStep(2)}
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            ) : null}
            {step === 2 ? (
              <>
                {/* ===== STEP 2: Loại vé ===== */}
                <div className="fw-bold fs-3 mb-3">Chọn loại vé của bạn</div>

                <div className="row g-3">
                  {/* BOX A - Vé tiêu chuẩn */}
                  <div className="col-12 col-lg-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="fw-bold fs-4">Vé tiêu chuẩn</div>

                      <div className="mt-2">
                        <span>Tổng giá </span>
                        <span className="fw-bold">
                          {formatVND((flight.price || 0) + STANDARD_FARE_FEE)}
                        </span>
                      </div>

                      <div className="mt-3 d-flex flex-column gap-2 small">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-check2 text-success" />
                          <span>Giá thấp nhất</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-x-lg text-danger" />
                          <span>
                            Không cần sự linh hoạt - bạn chắc chắn về kế hoạch
                            của mình
                          </span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary w-100 mt-3"
                        type="button"
                        onClick={() => {
                          setFareType("standard");
                          setStep(3);
                        }}
                      >
                        Tiếp tục
                      </button>
                    </div>
                  </div>

                  {/* BOX B - Vé linh hoạt */}
                  <div className="col-12 col-lg-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="fw-bold fs-4">Vé linh hoạt</div>

                        <span
                          className="badge"
                          style={{ background: "#198754", color: "#fff" }}
                        >
                          Phổ biến cho chuyến đi như của bạn
                        </span>
                      </div>

                      <div className="mt-2">
                        <span>Tổng giá </span>
                        <span className="fw-bold">
                          {formatVND((flight.price || 0) + FLEXIBLE_FARE_FEE)}
                        </span>
                      </div>

                      <div className="mt-3 d-flex flex-column gap-2 small">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-check2 text-success" />
                          <span>
                            Đổi giờ hoặc ngày bay một lần, lên đến 24 giờ trước
                            giờ cất cánh
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-check2 text-success" />
                          <span>
                            Bay cùng hãng hàng không theo tuyến đã đặt ban đầu
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-check2 text-success" />
                          <span>
                            Không tính phí đổi – chỉ thanh toán giá chênh lệch
                            (nếu có)
                          </span>
                        </div>
                      </div>

                      <div className="fw-bold mt-3">Cách để thay đổi</div>
                      <div className="mt-2 d-flex flex-column gap-2 small text-muted">
                        <div className="d-flex gap-2">
                          <i className="bi bi-chat-dots" />
                          <span>
                            Liên hệ Dịch vụ Khách hàng của chúng tôi qua tính
                            năng chat trực tiếp hoặc gọi điện ít nhất 24 giờ
                            trước chuyến bay ban đầu
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <i className="bi bi-airplane" />
                          <span>
                            Chúng tôi sẽ chia sẻ các chuyến bay còn vé, phù hợp
                            với yêu cầu đổi của bạn
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <i className="bi bi-credit-card" />
                          <span>
                            Chúng tôi sẽ hỗ trợ bạn trong việc thanh toán giá vé
                            chênh lệch và xác nhận chuyến bay mới
                          </span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary w-100 mt-3"
                        type="button"
                        onClick={() => {
                          setFareType("flexible");
                          setStep(3);
                        }}
                        disabled={!flight.flexible} // optional: nếu không có linh hoạt thì disable
                        title={
                          !flight.flexible
                            ? "Chuyến bay này không có vé linh hoạt"
                            : ""
                        }
                      >
                        Tiếp tục
                      </button>

                      <div className="small text-muted mt-3">
                        Vé linh động chỉ có trong giai đoạn đặt vé. Xem mục Vé
                        linh động để biết điều khoản và điều kiện
                      </div>

                      <button
                        type="button"
                        className="btn btn-link p-0 mt-2"
                        onClick={() => setStep(1)}
                      >
                        Quay lại
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* RIGHT: price detail */}
          <div className="col-12 col-lg-4">
            <div
              className="border rounded-3 p-3 position-sticky"
              style={{ top: 16 }}
            >
              <div className="fw-bold fs-4 mb-3">Chi tiết giá</div>

              <div className="fw-bold mb-2">Chuyến bay</div>

              <div className="d-flex justify-content-between align-items-center">
                <div>Người lớn ({adultCount})</div>
                <div className="d-flex align-items-center gap-2">
                  <div>{formatVND(flight.price)}</div>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPriceOpen((v) => !v)}
                    type="button"
                  >
                    <i
                      className={`bi ${
                        priceOpen ? "bi-chevron-up" : "bi-chevron-down"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {childCount > 0 ? (
                <div className="d-flex justify-content-between mt-2">
                  <div>Trẻ em ({childCount})</div>
                  <div>{formatVND(0)}</div>
                </div>
              ) : null}

              <Collapse in={priceOpen}>
                <div className="mt-3">
                  {/* nếu bạn có breakdown thật, gắn vào flight.priceBreakdown */}
                  <div className="d-flex justify-content-between small text-muted">
                    <div>Giá vé máy bay</div>
                    <div>{formatVND(Math.round(flight.price * 0.81))}</div>
                  </div>
                  <div className="d-flex justify-content-between small text-muted">
                    <div>Thuế và phí hàng không</div>
                    <div>
                      {formatVND(
                        flight.price - Math.round(flight.price * 0.81)
                      )}
                    </div>
                  </div>
                </div>
              </Collapse>

              {step >= 2 ? (
                <>
                  <hr />
                  <div className="fw-bold mt-3">Dịch vụ bổ sung</div>
                  <div className="d-flex justify-content-between small">
                    <div>{fareLabel}</div>
                    <div>{formatVND(fareFee)}</div>
                  </div>
                  <hr />
                </>
              ) : (
                <hr />
              )}

              <div className="d-flex justify-content-between align-items-baseline">
                <div className="fw-bold fs-4">Tổng</div>
                <div className="fw-bold fs-4">{formatVND(totalPrice)}</div>
              </div>
              <div className="small text-muted">Bao gồm thuế và phí</div>

              <div className="mt-3 small">
                <i className="bi bi-check2 me-2" />
                Không ẩn phí - theo dõi giá ở từng bước
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
