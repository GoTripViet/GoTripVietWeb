import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;
const DEMO_OTP = "123456";

const Order = () => {
  const navigate = useNavigate();
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState(null);
  const inputRefs = useRef([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowOtp(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 0);
  };

  const handleChangeEmail = (value) => {
    setEmail(value);
  };

  const handleChangeOtp = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);
    setOtpError(null);

    if (value && index < OTP_LENGTH - 1) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDownOtp = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const isOtpComplete = otp.join("").length === OTP_LENGTH;

  const handleVerifyEmail = () => {
    const enteredOtp = otp.join("");
    if (!isOtpComplete) return;

    if (enteredOtp === DEMO_OTP) {
      setOtpError(null);
      setShowOtp(false);
      navigate("/confirm-order");
    } else {
      setOtpError("Mã OTP không đúng. Vui lòng thử lại (mã demo: 123456).");
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Bước đặt phòng */}
      <div className="border-bottom bg-white">
        <div className="container py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <span className="fw-semibold small text-muted">
              Lựa chọn của bạn
            </span>
            <span className="small text-primary">Thông tin của bạn</span>
            <span className="small text-muted">Hoàn tất đặt phòng</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Genius</span>
          </div>
        </div>
      </div>

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
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Mã bưu chính</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">
                        Quốc gia / Khu vực{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <select className="form-select" defaultValue="">
                        <option value="" disabled>
                          Chọn quốc gia
                        </option>
                        <option value="VN">Việt Nam</option>
                        <option value="US">Hoa Kỳ</option>
                        <option value="FR">Pháp</option>
                      </select>
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
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
          <div
            className="bg-white rounded-3 shadow p-4"
            style={{ maxWidth: 420, width: "100%" }}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h5 className="mb-0">Xác minh địa chỉ email của bạn</h5>
              <button
                type="button"
                className="btn btn-sm btn-link text-muted text-decoration-none"
                onClick={() => setShowOtp(false)}
              >
                ✕
              </button>
            </div>

            <p className="small mb-3">
              Chúng tôi đã gửi mã xác minh demo đến{" "}
              <strong>{email || "email của bạn"}</strong>. <br />
              Vui lòng nhập mã <strong>{DEMO_OTP}</strong> để test hệ thống.
            </p>

            <div className="d-flex justify-content-between mb-2">
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="form-control text-center fs-4"
                  style={{ width: 48, height: 56 }}
                  value={otp[index]}
                  onChange={(e) => handleChangeOtp(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDownOtp(index, e)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                />
              ))}
            </div>

            {otpError && <p className="small text-danger mb-2">{otpError}</p>}

            <button
              type="button"
              className="btn w-100 mb-2"
              style={{ backgroundColor: "#e7e9ee", color: "#a0a3ad" }}
              disabled={!isOtpComplete}
              onClick={handleVerifyEmail}
            >
              Xác minh email
            </button>

            <p className="small text-muted mb-1">
              Bạn chưa nhận được email? Vì đây là mã demo, hãy nhập trực tiếp{" "}
              <strong>{DEMO_OTP}</strong> để tiếp tục.
            </p>

            <button
              type="button"
              className="btn btn-link w-100 mt-2 p-0"
              onClick={() => setShowOtp(false)}
            >
              Để sau
            </button>

            <hr className="mt-3" />
            <p className="small text-muted mb-0">
              Qua việc đăng nhập hoặc tạo tài khoản, bạn đồng ý với các Điều
              khoản và Điều kiện cũng như Chính sách An toàn và Bảo mật của
              chúng tôi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
