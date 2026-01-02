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

  const flight = useMemo(() => getStoredFlight(), []);

  const summary = useMemo(() => buildTripSummary(flight), [flight]);

  const [step, setStep] = useState(1); // 1..5
  const [priceOpen, setPriceOpen] = useState(false);
  // phí add-on cho loại vé (bạn chỉnh số cho đúng)
  const STANDARD_FARE_FEE = 0;
  const FLEXIBLE_FARE_FEE = 310868; // ví dụ, bạn đổi theo logic thật

  const [fareType, setFareType] = useState("standard"); // "standard" | "flexible"

  const fareFee =
    fareType === "flexible" ? FLEXIBLE_FARE_FEE : STANDARD_FARE_FEE;
  const fareLabel = fareType === "flexible" ? "Vé linh hoạt" : "Vé tiêu chuẩn";
  const FASTTRACK_PRICE = 2392879; // ví dụ theo ảnh, bạn đổi theo thực tế
  const [fastTrackChoice, setFastTrackChoice] = useState(null);
  // null | "none" | "add"
  // ===== Seats (Step 4) =====
  const SEAT_MIN_PRICE = 163547; // “Chọn ghế từ …”
  const SEAT_MAX_PRICE = 445858;

  // outbound / inbound seats: lưu danh sách seatId đã chọn
  const [seatSelection, setSeatSelection] = useState({
    outbound: [], // ví dụ ["1A","1B"...]
    inbound: [],
  });

  // mở/đóng phần seatmap trong từng box
  const [seatOpen, setSeatOpen] = useState({
    outbound: false,
    inbound: false,
  });

  // collapse chi tiết giá cho seats
  // (nếu bạn đã có addonOpen thì thêm field seat)

  const [fastTrackBenefitsOpen, setFastTrackBenefitsOpen] = useState(false);
  const baseFlightPrice = flight.price || 0;

  // ✅ chỉ tính “dịch vụ bổ sung” khi đã sang step 3 trở đi
  const fareAddOn = step >= 3 ? fareFee : 0;
  const fastTrackAddOn =
    step >= 3 && fastTrackChoice === "add" ? FASTTRACK_PRICE : 0;

  // seat price theo hàng: hàng càng gần đầu càng mắc (demo)
  function seatPriceOf(row) {
    const t = Math.max(0, Math.min(1, (32 - row) / 31));
    return Math.round(SEAT_MIN_PRICE + t * (SEAT_MAX_PRICE - SEAT_MIN_PRICE));
  }
  const seatsOutboundTotal = (seatSelection.outbound || []).reduce(
    (sum, seatId) => {
      const row = Number(String(seatId).match(/^\d+/)?.[0] || 0);
      return sum + (row ? seatPriceOf(row) : 0);
    },
    0
  );

  const seatsInboundTotal = (seatSelection.inbound || []).reduce(
    (sum, seatId) => {
      const row = Number(String(seatId).match(/^\d+/)?.[0] || 0);
      return sum + (row ? seatPriceOf(row) : 0);
    },
    0
  );

  const seatsTotal = seatsOutboundTotal + seatsInboundTotal;

  // ✅ chỉ tính tiền ghế từ step 4 trở đi
  const seatsAddOn = step >= 4 ? seatsTotal : 0;

  const addOnsTotal = fareAddOn + fastTrackAddOn + seatsAddOn;
  const totalPrice = baseFlightPrice + addOnsTotal;

  const [addonOpen, setAddonOpen] = useState({
    fare: false,
    fasttrack: false,
    seat: false,
  });

  const toggleAddon = (key) =>
    setAddonOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const cols = ["A", "B", "C", "D", "E", "F"];
  const rows = Array.from({ length: 32 }, (_, i) => i + 1);

  // tạo “ghế không có sẵn” demo (cho giống hình)
  const isSeatUnavailable = (row, col) => {
    const key = `${row}${col}`;
    // vài ghế block cố định để nhìn “thật”
    const blocked = new Set(["1A", "1B", "1C", "2A", "21B", "21C"]);
    return blocked.has(key);
  };

  // “lối thoát” demo: row 11 và 12
  const isExitRow = (row) => row === 11 || row === 12;

  const toggleSeat = (dir, seatId) => {
    setSeatSelection((prev) => {
      const current = prev[dir] || [];

      // remove nếu click lại
      if (current.includes(seatId)) {
        return { ...prev, [dir]: current.filter((x) => x !== seatId) };
      }

      // thêm mới: không vượt quá paxCount
      if (current.length >= paxCount) {
        // bạn có thể đổi thành toast sau
        alert(
          `Bạn chỉ có thể chọn tối đa ${paxCount} ghế cho ${paxCount} hành khách.`
        );
        return prev;
      }

      return { ...prev, [dir]: [...current, seatId] };
    });
  };

  // passengers demo: sau này lấy từ PlaneSearch (adult/child)
  const [passengers, setPassengers] = useState(
    () => flight?.passengers || defaultPassengers
  );

  const adultCount = passengers.filter((p) => p.type === "adult").length;
  const childCount = passengers.filter((p) => p.type === "child").length;
  const paxCount = adultCount + childCount;
  // state cho contact info
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // pet info
  const [petOpen, setPetOpen] = useState(false);

  const [payName, setPayName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [openFlightDetail, setOpenFlightDetail] = useState({});
  const toggleFlightDetail = (idx) =>
    setOpenFlightDetail((prev) => ({ ...prev, [idx]: !prev[idx] }));

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

  const getLineHeader = (line) => {
    const first = line?.segments?.[0];
    const last = line?.segments?.[line?.segments?.length - 1];

    return {
      fromCity: toCityLabel(
        first?.fromName,
        first?.fromIata || line?.depAirport || ""
      ),
      toCity: toCityLabel(last?.toName, last?.toIata || line?.arrAirport || ""),
      depDate: first?.departDate || line?.depDate || "",
      arrDate: last?.arriveDate || line?.arrDate || "",
      duration: line?.totalDuration || "",
      cabin: line?.cabinClass || "Hạng phổ thông",
      airlineName: line?.airlineName || first?.airlineName || "",
      flightNo: line?.flightNo || first?.flightNo || "",
      logo: line?.airlineLogo || first?.airlineLogo || "",
    };
  };

  const handlePayNow = () => {
    navigate("/order-success", {
      state: {
        payload: {
          source: "flight",
          totalPrice,
          email,
          orderId: `FL-${Date.now()}`,
          summaryText: `${summary.fromCity} → ${summary.toCity}`,
        },
      },
    });
  };

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
              "Chọn ghế",
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
                      value={email ?? ""}
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
                        value={phone ?? ""}
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
                          setFastTrackChoice(null);
                          setStep(3);
                          setSeatSelection({ outbound: [], inbound: [] });
                          setSeatOpen({ outbound: false, inbound: false });
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
                          setFastTrackChoice(null);
                          setStep(3);
                          setSeatSelection({ outbound: [], inbound: [] });
                          setSeatOpen({ outbound: false, inbound: false });
                        }}
                      >
                        Tiếp tục
                      </button>

                      <div className="small text-muted mt-3">
                        Vé linh động chỉ có trong giai đoạn đặt vé. Xem mục Vé
                        linh động để biết điều khoản và điều kiện
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-primary px-4"
                      onClick={() => setStep(1)}
                    >
                      <i className="bi bi-chevron-left me-1" />
                      Quay lại
                    </button>

                    {/* step 2 không có nút "Tiếp theo" chung vì mỗi box có nút Tiếp tục riêng */}
                    <div />
                  </div>
                </div>
              </>
            ) : null}
            {step === 3 ? (
              <>
                <div className="fw-bold fs-3">Fast Track</div>
                <div className="text-muted mb-3">
                  Sử dụng làn ưu tiên tại khu vực kiểm tra an ninh ở sân bay để
                  tiết kiệm thời gian và an tâm hơn.
                </div>

                <div className="d-flex flex-column gap-3">
                  {/* Option NONE */}
                  <button
                    type="button"
                    className={`w-100 text-start border rounded-3 p-3 bg-white ${
                      fastTrackChoice === "none"
                        ? "border-primary shadow-sm"
                        : ""
                    }`}
                    onClick={() => setFastTrackChoice("none")}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div className="pt-1">
                        <i
                          className={`bi ${
                            fastTrackChoice === "none"
                              ? "bi-record-circle-fill text-primary"
                              : "bi-circle"
                          }`}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold">Không có Fast Track</div>
                        <div className="small text-muted">{formatVND(0)}</div>
                      </div>
                    </div>
                  </button>

                  {/* Option ADD */}
                  <div
                    className={`border rounded-3 p-3 bg-white ${
                      fastTrackChoice === "add"
                        ? "border-primary shadow-sm"
                        : ""
                    }`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className="w-100 text-start border-0 bg-transparent p-0"
                      onClick={() => setFastTrackChoice("add")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setFastTrackChoice("add");
                        }
                      }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div className="pt-1">
                          <i
                            className={`bi ${
                              fastTrackChoice === "add"
                                ? "bi-record-circle-fill text-primary"
                                : "bi-circle"
                            }`}
                          />
                        </div>

                        <div className="flex-grow-1">
                          <div className="fw-bold">Thêm Fast Track</div>
                          <div className="small text-muted">
                            {formatVND(FASTTRACK_PRICE)}
                          </div>
                          <div className="small text-muted">
                            Áp dụng cho tất cả sân bay khởi hành trong đơn đặt
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-link text-decoration-none"
                          onClick={(e) => {
                            e.stopPropagation(); // ✅ để bấm “Lợi ích…” không bị chọn option
                            setFastTrackBenefitsOpen((v) => !v);
                          }}
                        >
                          <span className="fw-semibold text-dark">
                            Lợi ích của Fast Track
                          </span>{" "}
                          <i
                            className={`bi ${
                              fastTrackBenefitsOpen
                                ? "bi-chevron-up"
                                : "bi-chevron-down"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <Collapse in={fastTrackBenefitsOpen}>
                      <div className="mt-2 small text-muted">
                        <div className="d-flex gap-2">
                          <i className="bi bi-phone" />
                          <span>
                            Lưu giữ thẻ Fast Track ngay trong điện thoại, được
                            gửi cho bạn trước chuyến bay
                          </span>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <i className="bi bi-shield-check" />
                          <span>
                            Không phải xếp hàng tại khu vực kiểm tra an ninh ở
                            sân bay, chỉ cần xuất trình thẻ Fast Track
                          </span>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <i className="bi bi-cup-hot" />
                          <span>
                            Thong thả nghỉ ngơi, mua sắm và ăn uống ở khu khởi
                            hành
                          </span>
                        </div>
                      </div>
                    </Collapse>
                  </div>
                </div>

                <div className="small text-muted mt-3">
                  Bạn sẽ không được hoàn tiền khi mua dịch vụ Fast Track, trừ
                  phi chính sách hủy quy định khoản này. Fast Track không thể
                  được chuyển nhượng và chỉ áp dụng cho người mua dịch vụ.
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary px-4"
                    onClick={() => setStep(2)}
                  >
                    <i className="bi bi-chevron-left me-1" />
                    Quay lại
                  </button>

                  <button
                    className="btn btn-primary px-4"
                    onClick={() => setStep(4)}
                    disabled={fastTrackChoice === null}
                    title={
                      fastTrackChoice === null
                        ? "Vui lòng chọn một tùy chọn Fast Track"
                        : ""
                    }
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            ) : null}
            {step === 4 ? (
              <>
                <div className="fw-bold fs-3 mb-3">Chọn ghế</div>

                {/* xác định có inbound không */}
                {(() => {
                  const outbound = flight?.lines?.[0];
                  const inbound = flight?.lines?.[1];

                  const outboundAirline =
                    outbound?.segments?.[0]?.airlineName ||
                    outbound?.airline ||
                    "Hãng bay";
                  const inboundAirline =
                    inbound?.segments?.[0]?.airlineName ||
                    inbound?.airline ||
                    "Hãng bay";

                  const outboundDur = outbound?.durationText || "";
                  const inboundDur = inbound?.durationText || "";

                  const outSelected = seatSelection.outbound?.length || 0;
                  const inSelected = seatSelection.inbound?.length || 0;

                  const outTotal = seatsOutboundTotal;
                  const inTotal = seatsInboundTotal;

                  const RouteBox = ({
                    dir,
                    title,
                    airline,
                    duration,
                    selectedCount,
                    total,
                  }) => (
                    <div className="border rounded-3 bg-white overflow-hidden mb-3">
                      <button
                        type="button"
                        className="w-100 text-start border-0 bg-transparent p-3 d-flex justify-content-between align-items-start"
                        onClick={() =>
                          setSeatOpen((prev) => ({
                            ...prev,
                            [dir]: !prev[dir],
                          }))
                        }
                      >
                        <div>
                          <div className="fw-bold">{title}</div>
                          <div className="small text-muted mt-1">
                            {duration ? `${duration} · ` : ""}
                            {airline}
                          </div>

                          {selectedCount === 0 ? (
                            <>
                              <div className="small text-muted mt-2">
                                Chưa chọn ghế
                              </div>
                              <div className="small text-primary mt-1">
                                Chọn ghế từ {formatVND(SEAT_MIN_PRICE)}
                              </div>
                            </>
                          ) : (
                            <div className="small text-muted mt-2">
                              Đã chọn {selectedCount} ghế · Tổng giá{" "}
                              {formatVND(total)}
                            </div>
                          )}

                          {selectedCount > 0 ? (
                            <div className="small text-primary mt-2">
                              Đổi ghế
                            </div>
                          ) : null}
                        </div>

                        <div className="pt-1">
                          <i
                            className={`bi ${
                              seatOpen[dir]
                                ? "bi-chevron-up"
                                : "bi-chevron-down"
                            }`}
                          />
                        </div>
                      </button>

                      <Collapse in={seatOpen[dir]}>
                        <div className="border-top p-3">
                          <div className="d-flex gap-3 flex-column flex-lg-row">
                            {/* LEFT: passenger + legend */}
                            <div style={{ minWidth: 260 }}>
                              <div className="border rounded-3 p-3 bg-light">
                                <div className="fw-semibold mb-1">
                                  Chọn ghế cho {paxCount} hành khách
                                </div>
                                <div className="small text-muted">
                                  Bạn có thể chọn tối đa {paxCount} ghế cho
                                  chặng này.
                                </div>

                                <div className="mt-3 small">
                                  Đã chọn:{" "}
                                  <span className="fw-semibold">
                                    {(seatSelection[dir] || []).length}/
                                    {paxCount}
                                  </span>
                                </div>

                                {(seatSelection[dir] || []).length ? (
                                  <div className="small text-muted mt-1">
                                    {seatSelection[dir].join(", ")}
                                  </div>
                                ) : null}
                              </div>

                              <div className="mt-3 d-flex flex-column gap-2 small">
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    style={{
                                      width: 22,
                                      height: 22,
                                      border: "1px solid #0d6efd",
                                      borderRadius: 6,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    $
                                  </span>
                                  Ghế có sẵn ({formatVND(SEAT_MIN_PRICE)} –{" "}
                                  {formatVND(SEAT_MAX_PRICE)})
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    style={{
                                      width: 22,
                                      height: 22,
                                      border: "1px solid #ced4da",
                                      borderRadius: 6,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#adb5bd",
                                    }}
                                  >
                                    ×
                                  </span>
                                  Ghế không có sẵn
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    style={{
                                      width: 22,
                                      height: 22,
                                      border: "1px solid #198754",
                                      borderRadius: 6,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: "#e8f5ee",
                                      color: "#198754",
                                    }}
                                  >
                                    ✓
                                  </span>
                                  Ghế đã chọn
                                </div>
                              </div>
                            </div>

                            {/* RIGHT: seat map */}
                            <div className="flex-grow-1">
                              <div className="border rounded-3 p-3">
                                <div className="d-flex justify-content-center gap-4 mb-2 small fw-semibold">
                                  {cols.map((c) => (
                                    <div
                                      key={c}
                                      style={{ width: 30, textAlign: "center" }}
                                    >
                                      {c}
                                    </div>
                                  ))}
                                </div>

                                <div className="d-flex flex-column gap-2">
                                  {rows.map((r) => (
                                    <div
                                      key={r}
                                      className="d-flex align-items-center gap-2"
                                    >
                                      <div
                                        style={{ width: 26 }}
                                        className="small text-muted text-end"
                                      >
                                        {r}
                                      </div>

                                      <div className="d-flex gap-2">
                                        {cols.map((c) => {
                                          const id = `${r}${c}`;
                                          const selected = (
                                            seatSelection[dir] || []
                                          ).includes(id);
                                          const unavailable = isSeatUnavailable(
                                            r,
                                            c
                                          );

                                          const btnStyle = {
                                            width: 30,
                                            height: 30,
                                            borderRadius: 6,
                                            border: selected
                                              ? "1px solid #198754"
                                              : unavailable
                                              ? "1px solid #ced4da"
                                              : "1px solid #0d6efd",
                                            background: selected
                                              ? "#e8f5ee"
                                              : unavailable
                                              ? "#f8f9fa"
                                              : "#fff",
                                            color: selected
                                              ? "#198754"
                                              : unavailable
                                              ? "#adb5bd"
                                              : "#0d6efd",
                                            cursor: unavailable
                                              ? "not-allowed"
                                              : "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 13,
                                          };

                                          return (
                                            <button
                                              key={id}
                                              type="button"
                                              style={btnStyle}
                                              disabled={unavailable}
                                              title={
                                                unavailable
                                                  ? "Ghế không có sẵn"
                                                  : `${id} · ${formatVND(
                                                      seatPriceOf(r)
                                                    )}`
                                              }
                                              onClick={() =>
                                                toggleSeat(dir, id)
                                              }
                                            >
                                              {unavailable
                                                ? "×"
                                                : selected
                                                ? "✓"
                                                : "$"}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {isExitRow(r) ? (
                                        <div className="small text-success ms-2">
                                          Lối thoát
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="small text-muted mt-2">
                                (demo) Giá ghế tính theo hàng; bạn có thể thay
                                bằng data thật sau.
                              </div>
                            </div>
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  );

                  return (
                    <>
                      <RouteBox
                        dir="outbound"
                        title={`Từ ${summary.fromCity} đến ${summary.toCity}`}
                        airline={outboundAirline}
                        duration={outboundDur}
                        selectedCount={outSelected}
                        total={outTotal}
                      />

                      {summary.isRoundTrip && inbound ? (
                        <RouteBox
                          dir="inbound"
                          title={`Từ ${summary.toCity} đến ${summary.fromCity}`}
                          airline={inboundAirline}
                          duration={inboundDur}
                          selectedCount={inSelected}
                          total={inTotal}
                        />
                      ) : null}

                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <button
                          className="btn btn-outline-primary px-4"
                          onClick={() => setStep(3)}
                          type="button"
                        >
                          <i className="bi bi-chevron-left me-1" />
                          Quay lại
                        </button>

                        <button
                          className="btn btn-primary px-4"
                          onClick={() => setStep(5)}
                          type="button"
                        >
                          Tiếp theo
                        </button>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : null}

            {step === 5 && (
              <div>
                <div className="h4 fw-bold mb-3">Kiểm tra và thanh toán</div>

                {/* recap giống DetailFlightCard (mini cards) */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {(flight?.lines || []).map((line, idx) => {
                    const h = getLineHeader(line);
                    return (
                      <div key={idx} className="border rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-center gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                              style={{
                                width: 44,
                                height: 44,
                                overflow: "hidden",
                              }}
                            >
                              {h.logo ? (
                                <img
                                  src={h.logo}
                                  alt={h.airlineName}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    objectFit: "contain",
                                  }}
                                />
                              ) : null}
                            </div>

                            <div>
                              <div className="fw-semibold">
                                {h.fromCity} ({line?.segments?.[0]?.fromIata})
                                đi {h.toCity} (
                                {
                                  line?.segments?.[line?.segments?.length - 1]
                                    ?.toIata
                                }
                                )
                              </div>
                              <div className="small text-muted">
                                {h.depDate}
                                {h.arrDate ? ` - ${h.arrDate}` : ""}
                              </div>
                              <div className="small text-muted">
                                Bay thẳng · {h.duration} · {h.cabin}
                              </div>
                              <div className="small text-muted">
                                {h.airlineName}
                                {h.flightNo ? ` · ${h.flightNo}` : ""}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-link text-decoration-none"
                            onClick={() => toggleFlightDetail(idx)}
                          >
                            Hiển thị chi tiết chuyến bay
                          </button>
                        </div>

                        <Collapse in={!!openFlightDetail[idx]}>
                          <div className="pt-3">
                            <div className="border-top pt-3">
                              {(line?.segments || []).map((seg, sidx) => (
                                <div
                                  key={sidx}
                                  className="d-flex justify-content-between gap-3 py-2"
                                >
                                  <div className="small">
                                    <div className="fw-semibold">
                                      {seg?.fromIata} → {seg?.toIata}
                                    </div>
                                    <div className="text-muted">
                                      {seg?.departTime || ""} -{" "}
                                      {seg?.arriveTime || ""}
                                    </div>
                                  </div>

                                  <div className="small text-muted text-end">
                                    <div>
                                      {seg?.airlineName || ""}{" "}
                                      {seg?.flightNo ? `· ${seg.flightNo}` : ""}
                                    </div>
                                    <div>{seg?.cabinClass || h.cabin}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Collapse>
                      </div>
                    );
                  })}
                </div>

                {/* Thông tin liên lạc */}
                <div className="border rounded-3 p-3 mb-3">
                  <div className="fw-bold mb-2">Thông tin liên lạc</div>
                  <div className="small">
                    <div>{phone || "Chưa có số điện thoại"}</div>
                    <div>{email || "Chưa có email"}</div>
                  </div>
                </div>

                {/* Chi tiết của khách */}
                <div className="border rounded-3 p-3 mb-3">
                  <div className="fw-bold mb-2">Chi tiết của khách</div>
                  <div className="d-flex flex-column gap-2">
                    {passengers.map((p, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center gap-2 small"
                      >
                        <span className="text-muted">👤</span>
                        <div>
                          <div className="fw-semibold">
                            {(p.lastName || "").trim()}{" "}
                            {(p.firstName || "").trim() || "(chưa nhập tên)"}
                          </div>
                          <div className="text-muted">
                            {(p.type === "child" ? "Trẻ em" : "Người lớn") +
                              (p.gender ? ` · ${p.gender}` : "")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hành lý */}
                <div className="border rounded-3 p-3 mb-3">
                  <div className="fw-bold mb-1">Hành lý</div>
                  <div className="small text-muted mb-3">
                    Tổng số kiện hành lý được bao gồm cho tất cả các hành khách
                  </div>

                  {(flight?.lines || []).map((line, idx) => {
                    const h = getLineHeader(line);
                    const bag = flight?.baggageDetails || {};
                    return (
                      <div key={idx} className="mb-3">
                        <div className="fw-semibold small mb-2">
                          Chuyến bay đến {h.toCity}
                        </div>

                        {/* personal */}
                        {bag.personal?.included ? (
                          <div className="d-flex gap-2 small mb-2">
                            <span>🧳</span>
                            <div>
                              <div className="fw-semibold">
                                {bag.personal?.count || 1}{" "}
                                {bag.personal?.label || "túi xách nhỏ"}
                              </div>
                              <div className="text-success">Đã bao gồm</div>
                              <div className="text-muted">
                                {bag.personal?.desc}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex gap-2 small mb-2">
                            <span>🧳</span>
                            <div className="text-muted">
                              {bag.personal?.notIncludedText ||
                                "Không thể thêm vật dụng cá nhân cho đơn đặt này"}
                            </div>
                          </div>
                        )}

                        {/* carry on */}
                        {bag.carryOn?.included ? (
                          <div className="d-flex gap-2 small mb-2">
                            <span>🎒</span>
                            <div>
                              <div className="fw-semibold">
                                {bag.carryOn?.count || 1}{" "}
                                {bag.carryOn?.label || "hành lý cabin"}
                              </div>
                              <div className="text-success">Đã bao gồm</div>
                              <div className="text-muted">
                                {bag.carryOn?.desc}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex gap-2 small mb-2">
                            <span>🎒</span>
                            <div className="text-muted">
                              {bag.carryOn?.notIncludedText ||
                                "Không thể thêm hành lý xách tay cho đơn đặt này, nhưng có thể hãng hàng không sẽ cho phép bạn mua sau đó"}
                            </div>
                          </div>
                        )}

                        {/* checked */}
                        {bag.checked?.included ? (
                          <div className="d-flex gap-2 small">
                            <span>🧳</span>
                            <div>
                              <div className="fw-semibold">
                                {bag.checked?.count || 1}{" "}
                                {bag.checked?.label || "hành lý ký gửi"}
                              </div>
                              <div className="text-success">Đã bao gồm</div>
                              <div className="text-muted">
                                {bag.checked?.desc}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex gap-2 small">
                            <span>🧳</span>
                            <div className="text-muted">
                              {bag.checked?.notIncludedText ||
                                "Không thể thêm hành lý ký gửi cho đơn đặt này, nhưng có thể hãng hàng không sẽ cho phép bạn mua sau đó"}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chính sách linh động (chỉ khi vé linh hoạt) */}
                {fareType === "flexible" && (
                  <div className="border rounded-3 p-3 mb-3">
                    <div className="fw-bold mb-2">
                      Chính sách linh động và dịch vụ bảo hiểm
                    </div>
                    <div className="small">
                      <div className="fw-semibold">Vé linh hoạt</div>
                      <div className="text-muted">
                        Đổi ngày hoặc giờ đến 24 giờ trước thời điểm bay và chi
                        trả phần giá chênh lệch (nếu có)
                      </div>
                      <button
                        type="button"
                        className="btn btn-link p-0 mt-2 text-decoration-none"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                )}

                {/* Fast Track (chỉ khi khách chọn) */}
                {fastTrackChoice === "yes" && (
                  <div className="border rounded-3 p-3 mb-3">
                    <div className="fw-bold mb-2">Fast Track</div>
                    <div className="small text-muted mb-2">
                      Xuất trình thẻ Fast Track tại khu vực kiểm tra an ninh ở
                      sân bay để sử dụng làn ưu tiên.
                    </div>

                    {(flight?.lines || []).map((line, idx) => {
                      const h = getLineHeader(line);
                      return (
                        <div
                          key={idx}
                          className="d-flex justify-content-between small py-1"
                        >
                          <div>Chuyến bay đến {h.toCity}</div>
                          <div className="text-muted">
                            Cho {passengers.length} hành khách
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Thông tin thanh toán */}
                <div className="border rounded-3 p-3 mb-3">
                  <div className="fw-bold mb-1">
                    Thông tin thanh toán của bạn
                  </div>
                  <div className="small text-muted mb-3">
                    Đơn giản, an toàn và bảo mật.
                  </div>

                  <div className="small fw-semibold mb-2">
                    Bạn muốn thanh toán bằng cách nào?
                  </div>
                  <div className="d-flex gap-2 align-items-center mb-3 small text-muted">
                    <span className="border rounded px-2 py-1">VISA</span>
                    <span className="border rounded px-2 py-1">Mastercard</span>
                    <span className="border rounded px-2 py-1">JCB</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Tên chủ thẻ *
                    </label>
                    <input
                      className="form-control"
                      value={payName}
                      onChange={(e) => setPayName(e.target.value)}
                      placeholder="Ví dụ: Cong Tuan Le"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Số thẻ *
                    </label>
                    <input
                      className="form-control"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">
                        Ngày hết hạn *
                      </label>
                      <input
                        className="form-control"
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">
                        CVC *
                      </label>
                      <input
                        className="form-control"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                <div className="small text-muted mb-3">
                  Bằng cách nhấn "Thanh toán ngay", bạn đồng ý điều khoản, điều
                  kiện và chính sách bảo mật của GoTripViet
                </div>

                <div className="d-flex align-items-center justify-content-between">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none"
                    onClick={() => setStep(4)}
                  >
                    ‹ Quay lại
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePayNow}
                  >
                    Thanh toán ngay
                  </button>
                </div>
              </div>
            )}
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

              <hr />

              {step >= 3 ? (
                <>
                  <div className="fw-bold mt-2">Dịch vụ bổ sung</div>

                  {/* 1) Loại vé (luôn có khi đã sang step 3) */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="fw-semibold">{fareLabel}</div>
                    <div className="d-flex align-items-center gap-2">
                      <div>{formatVND(fareFee)}</div>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        onClick={() => toggleAddon("fare")}
                      >
                        <i
                          className={`bi ${
                            addonOpen.fare ? "bi-chevron-up" : "bi-chevron-down"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <Collapse in={addonOpen.fare}>
                    <div className="mt-2 small text-muted">
                      <div className="d-flex justify-content-between">
                        <div>Giá cơ bản</div>
                        <div>{formatVND(fareFee)}</div>
                      </div>

                      {/* nếu sau này có discount thì thêm dòng này */}
                      {/* <div className="d-flex justify-content-between">
          <div>Sự kiện giảm giá</div>
          <div>-{formatVND(50000)}</div>
        </div> */}
                    </div>
                  </Collapse>

                  {/* 2) Fast Track (chỉ show khi khách chọn "Thêm Fast Track") */}
                  {fastTrackChoice === "add" ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="fw-semibold">Fast Track</div>
                        <div className="d-flex align-items-center gap-2">
                          <div>{formatVND(FASTTRACK_PRICE)}</div>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            onClick={() => toggleAddon("fasttrack")}
                          >
                            <i
                              className={`bi ${
                                addonOpen.fasttrack
                                  ? "bi-chevron-up"
                                  : "bi-chevron-down"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <Collapse in={addonOpen.fasttrack}>
                        <div className="mt-2 small text-muted">
                          <div className="d-flex justify-content-between">
                            <div>Giá cơ bản</div>
                            <div>{formatVND(FASTTRACK_PRICE)}</div>
                          </div>
                          {/* discount demo */}
                          <div className="d-flex justify-content-between">
                            <div>Sự kiện giảm giá</div>
                            <div>-{formatVND(100000)}</div>
                          </div>
                        </div>
                      </Collapse>
                    </>
                  ) : null}
                  {/* 3) Seats (chỉ show từ step 4 và khi có chọn ghế) */}
                  {step >= 4 && seatsTotal > 0 ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="fw-semibold">
                          Chỗ ngồi (
                          {seatSelection.outbound.length +
                            seatSelection.inbound.length}
                          )
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <div>{formatVND(seatsTotal)}</div>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            onClick={() => toggleAddon("seat")}
                          >
                            <i
                              className={`bi ${
                                addonOpen.seat
                                  ? "bi-chevron-up"
                                  : "bi-chevron-down"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <Collapse in={addonOpen.seat}>
                        <div className="mt-2 small text-muted">
                          <div className="d-flex justify-content-between">
                            <div>Giá cơ bản</div>
                            <div>{formatVND(seatsTotal)}</div>
                          </div>

                          {/* nếu sau này có discount thì mở dòng này */}
                          {/* <div className="d-flex justify-content-between">
          <div>Sự kiện giảm giá</div>
          <div>-{formatVND(50000)}</div>
        </div> */}
                        </div>
                      </Collapse>
                    </>
                  ) : null}

                  <hr className="mt-3" />
                </>
              ) : null}

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
