import React, { useMemo, useState } from "react";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const emailValid = useMemo(() => isEmail(email), [email]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;
    // TODO: call API /auth/magic-link hoặc chuyển sang bước kế tiếp
    alert(`Email: ${email}`);
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="fw-bold mb-3">Đăng nhập hoặc tạo tài khoản</h1>
          <p className="text-muted mb-4">
            Hãy đăng nhập bằng tài khoản GoTripViet để trải nghiệm trọn vẹn dịch vụ.
          </p>

          <form onSubmit={submit} className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Địa chỉ email</label>
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
              Địa chỉ email
            </button>
          </form>

          <div className="text-divider my-4">
            hoặc sử dụng một trong các lựa chọn này
          </div>

          <div className="d-flex flex-column gap-3">
            <button className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-google"></i>
              Đăng nhập với Google
            </button>
            <button className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-facebook"></i>
              Đăng nhập với Facebook
            </button>
          </div>

          <p className="text-center small mt-4">
            Bằng việc đăng nhập hoặc tạo tài khoản, bạn xác nhận đã đọc và đồng ý với{" "}
            <a href="#" className="fw-bold link-danger text-decoration-none">Điều khoản &amp; Điều kiện</a>{" "}
            cùng{" "}
            <a href="#" className="fw-bold link-danger text-decoration-none">Chính sách An toàn &amp; Bảo mật</a>.
          </p>

          <p className="text-center text-muted mt-4">Bản quyền – GoTripViet</p>
        </div>
      </div>
    </div>
  );
}
