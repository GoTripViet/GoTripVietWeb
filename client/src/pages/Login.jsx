import React, { useMemo, useState } from "react";
import AuthHeader from "../components/AuthHeader.jsx";

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Login({ onNext }) {
  const [email, setEmail] = useState("");
  const emailValid = useMemo(() => isEmail(email), [email]);

  const submit = async (e) => {
    e.preventDefault();
    if (!emailValid) return;
    if (onNext) {
      await onNext(email);
    }
  };

  return (
    <>
      {/* Header auth dùng chung */}
      <AuthHeader onHelpClick={() => console.log("Help clicked from Login")} />

      {/* Nội dung trang login */}
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <h1 className="fw-bold mb-3">Đăng nhập hoặc tạo tài khoản</h1>
            <p className="text-muted mb-4">
              Hãy đăng nhập bằng tài khoản GoTripViet để trải nghiệm trọn vẹn
              dịch vụ.
            </p>

            <form onSubmit={submit} className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Địa chỉ email
              </label>
              <input
                id="email"
                type="email"
                className="form-control form-control-lg"
                placeholder="Nhập địa chỉ email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                className="btn btn-teal btn-lg w-100 mt-3"
                disabled={!emailValid}
              >
                Tiếp tục với email
              </button>
            </form>

            <div className="text-divider my-4">
              hoặc sử dụng một trong các lựa chọn này
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <button className="btn btn-outline-secondary btn-lg w-100 d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-google"></i>
                  <span className="fs-6">Đăng nhập với Google</span>
                </button>
              </div>
              <div className="col-12 col-md-6">
                <button className="btn btn-outline-secondary btn-lg w-100 d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-facebook"></i>
                  <span className="fs-6">Đăng nhập với Facebook</span>
                </button>
              </div>
            </div>

            <p className="text-center small mt-4">
              Bằng việc đăng nhập hoặc tạo tài khoản, bạn xác nhận đã đọc và
              đồng ý với{" "}
              <a href="#" className="fw-bold link-danger text-decoration-none">
                Điều khoản &amp; Điều kiện
              </a>{" "}
              cùng{" "}
              <a href="#" className="fw-bold link-danger text-decoration-none">
                Chính sách An toàn &amp; Bảo mật
              </a>
              .
            </p>

            <p className="text-center text-muted mt-4">
              Bản quyền - GoTripViet
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
