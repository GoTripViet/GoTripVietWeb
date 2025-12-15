import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingStepper from "../components/order/stepper";
import EmailOtpModal from "../components/EmailOtpModal";

const OTP_LENGTH = 6;
const DEMO_OTP = "123456";

const Order = () => {
  const navigate = useNavigate();
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("VN");
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [provinceCode, setProvinceCode] = useState("");

  const [cityProvince, setCityProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [countriesError, setCountriesError] = useState(null);
  const [provincesError, setProvincesError] = useState(null);

  const [reloadCountriesKey, setReloadCountriesKey] = useState(0);
  const [reloadProvincesKey, setReloadProvincesKey] = useState(0);

  const retryLoadCountries = () => setReloadCountriesKey((k) => k + 1);
  const retryLoadProvinces = () => setReloadProvincesKey((k) => k + 1);

  // load countries
  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setCountriesLoading(true);
      setCountriesError(null);

      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=cca2,name",
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`countries http ${res.status}`);
        }

        const data = await res.json();

        const list = (Array.isArray(data) ? data : [])
          .map((c) => ({
            code: c?.cca2,
            name: c?.name?.common,
          }))
          .filter((x) => x.code && x.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(list);
      } catch (err) {
        // nếu component unmount / effect đổi -> abort thì bỏ qua
        if (controller.signal.aborted) return;
        console.error(err);
        // lỗi thật
        setCountries([]);
        setCountriesError(
          "Không tải được danh sách quốc gia. Bạn thử lại giúp mình nhé."
        );
        // (giữ countries = [] để UI fallback VN/US/FR vẫn chạy)
      } finally {
        if (!controller.signal.aborted) setCountriesLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [reloadCountriesKey]);

  // load provinces when VN
  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setProvincesError(null);

      if (country !== "VN") {
        setProvinces([]);
        setProvinceCode("");
        return;
      }

      setProvincesLoading(true);

      try {
        const res = await fetch(
          "https://provinces.open-api.vn/api/v1/?depth=1",
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`provinces http ${res.status}`);
        }

        const data = await res.json();

        const list = (Array.isArray(data) ? data : [])
          .map((p) => ({ code: p?.code, name: p?.name }))
          .filter((x) => x.code && x.name);

        setProvinces(list);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setProvinces([]);
        setProvinceCode("");
        setProvincesError(
          "Không tải được danh sách tỉnh/thành. Bạn bấm thử lại giúp mình nhé."
        );
      } finally {
        if (!controller.signal.aborted) setProvincesLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [country, reloadProvincesKey]);

  // optional: try to auto-fill city by postal code (non-VN)
  const handlePostalBlur = async () => {
    const c = (country || "").toLowerCase();
    if (!postalCode || !c || c === "vn") return;

    try {
      const res = await fetch(
        `https://api.zippopotam.us/${c}/${encodeURIComponent(postalCode)}`
      );
      if (!res.ok) return;

      const data = await res.json();
      const place = data?.places?.[0];
      const placeName = place?.["place name"] || "";

      if (placeName && !cityProvince) setCityProvince(placeName);
    } catch (err) {
      // có thể bị CORS tuỳ môi trường -> nếu vậy thì proxy qua backend
      console.error("auto-fill city by postal code failed", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowOtp(true);
  };

  const handleChangeEmail = (value) => {
    setEmail(value);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Bước đặt phòng */}
      <BookingStepper currentStep={2} />

      {/* Nội dung chính */}
      <div className="container my-4 flex-grow-1">
        <div className="row g-4">
          {/* Cột trái: tóm tắt đặt phòng */}
          <div className="col-lg-4">
            {/* Chi tiết đặt phòng */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title mb-3">Chi tiết đặt phòng</h6>

                <div className="d-flex justify-content-between small mb-2">
                  <div>
                    <div className="text-muted">Nhận phòng</div>
                    <div className="fw-semibold">Thứ 2, 17 Thg 11, 2025</div>
                    <div className="text-muted">Từ 14:00</div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted">Trả phòng</div>
                    <div className="fw-semibold">Thứ 3, 18 Thg 11, 2025</div>
                    <div className="text-muted">Đến 12:00</div>
                  </div>
                </div>

                <hr />

                <div className="small">
                  <div className="fw-semibold mb-1">
                    1 đêm, 1 phòng cho 2 người lớn
                  </div>
                  <div className="text-muted">1 phòng giường đôi</div>
                </div>
              </div>
            </div>

            {/* Tóm tắt giá */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title mb-3">Tóm tắt giá</h6>
                <div className="d-flex justify-content-between align-items-end mb-2">
                  <div className="small text-muted">Tổng cộng</div>
                  <div className="h4 mb-0">$177.20</div>
                </div>
                <div className="small text-muted">
                  Đã bao gồm thuế và phí. Bạn sẽ thanh toán bằng đơn vị tiền tệ
                  của chỗ nghỉ.
                </div>
              </div>
            </div>

            {/* Lịch thanh toán */}
            <div className="card mb-3">
              <div className="card-body small">
                <h6 className="card-title mb-3">Lịch thanh toán</h6>
                <p className="mb-1">
                  Sau khi đặt, bạn sẽ bị trừ trước 50% tổng giá.
                </p>
                <p className="mb-0 text-muted">
                  Phần còn lại sẽ thanh toán trực tiếp tại chỗ nghỉ.
                </p>
              </div>
            </div>

            {/* Chính sách huỷ */}
            <div className="card mb-3">
              <div className="card-body small">
                <h6 className="card-title mb-3">Hủy phòng sẽ tốn bao nhiêu?</h6>
                <p className="mb-0 text-muted">
                  Miễn phí huỷ đến 23:59, 15 Thg 11 2025. Sau thời gian đó, nếu
                  huỷ bạn sẽ phải trả 50% tổng giá.
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: form thông tin */}
          <div className="col-lg-8">
            <form onSubmit={handleSubmit}>
              {/* Nhập thông tin của bạn */}
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title mb-3">Nhập thông tin của bạn</h5>
                  <p className="small text-muted mb-3">
                    Gần xong rồi! Hãy điền những thông tin bắt buộc bên dưới.
                  </p>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small">
                        Tên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tên"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">
                        Họ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Họ"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">
                        Địa chỉ email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="ban@example.com"
                        required
                        value={email}
                        onChange={(e) => handleChangeEmail(e.target.value)}
                      />
                      <div className="form-text small">
                        Email xác nhận đặt phòng sẽ được gửi đến địa chỉ này.
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Số điện thoại</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+84..."
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small">
                        Địa chỉ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Số nhà, tên đường"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small">
                        Thành phố / Tỉnh <span className="text-danger">*</span>
                      </label>

                      {country === "VN" ? (
                        <select
                          className="form-select"
                          value={provinceCode}
                          onChange={(e) => {
                            const code = e.target.value;
                            setProvinceCode(code);
                            const selected = provinces.find(
                              (p) => String(p.code) === String(code)
                            );
                            setCityProvince(selected?.name || "");
                          }}
                          required
                          disabled={provincesLoading}
                        >
                          <option value="" disabled>
                            {provincesLoading
                              ? "Đang tải..."
                              : "Chọn tỉnh/thành"}
                          </option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={cityProvince}
                          onChange={(e) => setCityProvince(e.target.value)}
                          placeholder="Ví dụ: Paris"
                        />
                      )}
                      {provincesError && (
                        <div className="form-text text-danger d-flex align-items-center justify-content-between">
                          <span>{provincesError}</span>
                          <button
                            type="button"
                            className="btn btn-link p-0 ms-2"
                            onClick={retryLoadProvinces}
                          >
                            Thử lại
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small">Mã bưu chính</label>
                      <input
                        type="text"
                        className="form-control"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        onBlur={handlePostalBlur}
                        placeholder="Ví dụ: 90210"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small">
                        Quốc gia / Khu vực{" "}
                        <span className="text-danger">*</span>
                      </label>

                      <select
                        className="form-select"
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          setCityProvince("");
                          setPostalCode("");
                        }}
                        required
                      >
                        <option value="" disabled>
                          {countriesLoading ? "Đang tải..." : "Chọn quốc gia"}
                        </option>

                        {/* fallback nhanh nếu chưa load kịp */}
                        {countries.length === 0 ? (
                          <>
                            <option value="VN">Việt Nam</option>
                            <option value="US">Hoa Kỳ</option>
                            <option value="FR">Pháp</option>
                          </>
                        ) : (
                          countries.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))
                        )}
                      </select>
                      {countriesError && (
                        <div className="form-text text-danger d-flex align-items-center justify-content-between">
                          <span>{countriesError}</span>
                          <button
                            type="button"
                            className="btn btn-link p-0 ms-2"
                            onClick={retryLoadCountries}
                          >
                            Thử lại
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label small">
                        Bạn đặt phòng cho ai?
                      </label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="bookingFor"
                          id="bookingForMe"
                          defaultChecked
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="bookingForMe"
                        >
                          Tôi là khách chính
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="bookingFor"
                          id="bookingForSomeone"
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="bookingForSomeone"
                        >
                          Tôi đặt giúp người khác
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small">
                        Mục đích chuyến đi?
                      </label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="bookingReason"
                          id="bookingLeisure"
                          defaultChecked
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="bookingLeisure"
                        >
                          Du lịch / nghỉ dưỡng
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="bookingReason"
                          id="bookingBusiness"
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="bookingBusiness"
                        >
                          Công tác
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin cần biết */}
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="card-title mb-2">Thông tin cần biết</h6>
                  <p className="small mb-0 text-muted">
                    Bạn đang đặt phòng giường đôi không hoàn tiền, có tầm nhìn
                    ra biển. Hãy kiểm tra kỹ ngày tháng và thông tin trước khi
                    hoàn tất đặt phòng.
                  </p>
                </div>
              </div>

              {/* Chi tiết phòng */}
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="card-title mb-2">Phòng giường đôi</h6>
                  <ul className="small mb-0 ps-3">
                    <li>Có phục vụ bữa sáng (tùy chọn)</li>
                    <li>1 giường đôi</li>
                    <li>Diện tích phòng: 18 m²</li>
                    <li>Tầm nhìn thành phố / biển</li>
                  </ul>
                </div>
              </div>

              {/* Thêm dịch vụ cho kỳ nghỉ */}
              <div className="card mb-3">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="card-title mb-0">Thêm vào kỳ nghỉ</h6>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success small">
                      Tùy chọn
                    </span>
                  </div>

                  <div className="small">
                    <div className="form-check border rounded-3 p-3 mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="airportTransfer"
                      />
                      <label
                        className="form-check-label d-block"
                        htmlFor="airportTransfer"
                      >
                        <div className="fw-semibold">
                          Sắp xếp đón tại sân bay
                        </div>
                        <div className="text-muted">
                          Chúng tôi sẽ giúp bạn gửi yêu cầu dịch vụ đưa đón sân
                          bay đến chỗ nghỉ.
                        </div>
                      </label>
                    </div>

                    <div className="form-check border rounded-3 p-3 mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="lateCheckin"
                      />
                      <label
                        className="form-check-label d-block"
                        htmlFor="lateCheckin"
                      >
                        <div className="fw-semibold">Nhận phòng trễ</div>
                        <div className="text-muted">
                          Thông báo cho chỗ nghỉ nếu bạn đến sau 22:00.
                        </div>
                      </label>
                    </div>

                    <div className="form-check border rounded-3 p-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="parking"
                      />
                      <label
                        className="form-check-label d-block"
                        htmlFor="parking"
                      >
                        <div className="fw-semibold">Chỗ đậu xe</div>
                        <div className="text-muted">
                          Giữ chỗ đậu xe tại chỗ nghỉ (nếu còn chỗ trống).
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yêu cầu đặc biệt */}
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="card-title mb-2">Yêu cầu đặc biệt</h6>
                  <p className="small text-muted">
                    Chỗ nghỉ sẽ cố gắng đáp ứng các yêu cầu của bạn nhưng không
                    thể đảm bảo 100%.
                  </p>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Viết yêu cầu của bạn bằng tiếng Việt hoặc tiếng Anh (không bắt buộc)"
                  />
                </div>
              </div>

              {/* Giờ đến */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title mb-2">Giờ đến của bạn</h6>
                  <p className="small text-muted mb-2">
                    Phòng của bạn sẽ sẵn sàng nhận từ 14:00.
                  </p>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small">
                        Thời gian dự kiến đến (không bắt buộc)
                      </label>
                      <select className="form-select" defaultValue="">
                        <option value="">Chưa biết</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                        <option value="18:00">18:00</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thanh dưới cùng */}
              <div className="border-top bg-white py-3 position-sticky bottom-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="small text-muted">
                    Chúng tôi đảm bảo giá tốt
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-4">
                      Tiếp tục: Thông tin cuối cùng
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Popup OTP */}
      {showOtp && (
        <EmailOtpModal
          key="email-otp"
          email={email}
          otpLength={6}
          demoOtp="123456"
          onClose={() => setShowOtp(false)}
          onVerified={() => {
            setShowOtp(false);
            navigate("/confirm-order");
          }}
        />
      )}
    </div>
  );
};

export default Order;
