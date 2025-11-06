import { useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { requestOtp, verifyOtp } from "./api";

function Shell({ children }) {
  return (
    <div>
      <div className="auth-hero"></div>
      <div className="container py-5">
        <div className="auth-card">
          {children}
          <div className="text-center mt-4 small auth-muted">
            Bằng việc đăng nhập hoặc tạo tài khoản, bạn xác nhận đã đọc và đồng
            ý với{" "}
            <a href="#" className="fw-semibold link-dangerish">
              Điều khoản & Điều kiện
            </a>{" "}
            cùng{" "}
            <a href="#" className="fw-semibold link-dangerish">
              Chính sách An toàn & Bảo mật
            </a>
            .<div className="mt-3">Bản quyền — GoTripViet</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await requestOtp(email);
      if (res.ok)
        navigate("../otp?email=" + encodeURIComponent(email), {
          replace: true,
        });
      else setError("Không gửi được mã. Vui lòng thử lại.");
    } catch (err) {
      setError("Có lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <h1 className="h3 mb-3">Đăng nhập hoặc tạo tài khoản</h1>
      <p className="auth-muted">
        Hãy đăng nhập bằng tài khoản GoTripViet để trải nghiệm trọn vẹn dịch vụ.
      </p>

      <form onSubmit={onSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Địa chỉ email</label>
          <input
            type="email"
            className="form-control form-control-lg"
            placeholder="Nhập địa chỉ email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button
          className="btn btn-brand btn-lg w-100"
          disabled={!email || loading}
        >
          {loading ? "Đang gửi mã…" : "Tiếp tục"}
        </button>
      </form>

      <div className="auth-sep my-4 text-center">
        <span>hoặc sử dụng một trong các lựa chọn này</span>
      </div>

      <div className="d-grid gap-2 d-md-flex">
        <button
          type="button"
          className="btn btn-outline-secondary flex-fill"
          onClick={() => alert("TODO: Google OAuth")}
        >
          Đăng nhập với Google
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary flex-fill"
          onClick={() => alert("TODO: Facebook OAuth")}
        >
          Đăng nhập với Facebook
        </button>
      </div>
    </Shell>
  );
}
function OtpBox({ length = 6, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(""));
  const refs = useRef(Array.from({ length }, () => null));

  function handleChange(idx, val) {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[idx] = v;
    setValues(next);
    if (v && idx < length - 1) refs.current[idx + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!text) return;
    const next = text.split("").concat(Array(length).fill("")).slice(0, length);
    setValues(next);
    if (next.every((d) => d !== "")) onComplete(next.join(""));
    refs.current[Math.min(text.length, length) - 1]?.focus();
  }

  return (
    <div className="otp-grid" onPaste={handlePaste}>
      {values.map((val, i) => (
        <input
          key={i}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="otp-input"
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          ref={(el) => (refs.current[i] = el)}
          maxLength={1}
        />
      ))}
    </div>
  );
}

function OtpPage() {
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const RESEND_TIMEOUT = 60; // giây
  const [remain, setRemain] = useState(RESEND_TIMEOUT);

  useEffect(() => {
    const t = setInterval(() => setRemain((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  async function onVerify(c) {
    const final = c || code;
    if (final.length < 6) return;
    setLoading(true);
    setError("");
    const res = await verifyOtp(email, final);
    setLoading(false);
    if (res.ok) {
      // Lưu token (demo) rồi redirect
      sessionStorage.setItem("auth_token", res.token);
      navigate("../success", { replace: true });
    } else {
      setError("Mã OTP không đúng, vui lòng thử lại.");
    }
  }

  async function resend() {
    if (remain > 0) return;
    setRemain(RESEND_TIMEOUT);
    await requestOtp(email);
  }

  return (
    <Shell>
      <h1 className="h3 mb-2">Kiểm tra hộp thư của bạn</h1>
      <p className="auth-muted">
        Mã xác minh đã được gửi đến <strong>{email}</strong>. Vui lòng nhập mã
        này để tiếp tục.
      </p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <OtpBox
        length={6}
        onComplete={(v) => {
          setCode(v);
          onVerify(v);
        }}
      />

      <button
        className="btn btn-brand btn-lg w-100 mt-4"
        disabled={loading || code.length < 6}
        onClick={() => onVerify()}
      >
        {loading ? "Đang xác minh…" : "Tiếp tục"}
      </button>

      <div className="text-center mt-3">
        <button
          className="btn btn-link p-0 me-3"
          disabled={remain > 0}
          onClick={resend}
        >
          {remain > 0 ? `Yêu cầu mã mới (sau ${remain}s)` : "Yêu cầu mã mới"}
        </button>
        <Link to="../login" className="btn btn-link p-0">
          Quay lại trang đăng nhập
        </Link>
      </div>
    </Shell>
  );
}

function Success() {
  return (
    <Shell>
      <div className="text-center py-5">
        <h1 className="h3">Đăng nhập thành công!</h1>
        <p className="auth-muted">
          Bạn có thể đóng trang này hoặc quay lại ứng dụng.
        </p>
      </div>
    </Shell>
  );
}

// export default function App() {
//   return (
//     <Routes>
//       <Route index element={<EmailLogin />} /> {/* /auth */}
//       <Route path="login" element={<EmailLogin />} /> {/* /auth/login */}
//       <Route path="otp" element={<OtpPage />} /> {/* /auth/otp */}
//       <Route path="success" element={<Success />} /> {/* /auth/success */}
//       <Route path="*" element={<Navigate to="login" replace />} />
//     </Routes>
//   );
// }
export default function App() {
  return (
    <div className="container py-4">
      <h1>Container OK</h1>
      <Routes>
        <Route path="/auth/*" element={<AuthApp />} />
        <Route path="/" element={<div>Home OK</div>} />
      </Routes>
    </div>
  );
}
