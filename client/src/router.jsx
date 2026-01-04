import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Layout
import UserLayout from "./layouts/UserLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import SearchPage from "./pages/SearchPage.jsx";
// Pages
import OrderDetail from "./pages/OrderDetail.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Home from "./pages/Home.jsx";
import ListingHotel from "./pages/ListingHotel.jsx";
import HotelDetail from "./pages/HotelDetail.jsx";
import Order from "./pages/Order.jsx";
import ConfirmOrder from "./pages/ConfirmOrder.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OtpVerify from "./pages/OtpVerify.jsx";
import ListingCities from "./pages/ListingCities.jsx";
import ListingFlights from "./pages/ListingFlights.jsx";
import OrderFlight from "./pages/OrderFlight.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import Profile from "./pages/Profile.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import PaymentPage from "./pages/PaymentPage";
import BookingSuccess from "./pages/BookingSuccess";

/**
 * Trang Home được bọc trong UserLayout,
 * và có onNavigateToHotels để chuyển sang /hotels.
 */
const HomePage = ({ activeCategoryIndex, onCategoryChange }) => {
  const navigate = useNavigate();

  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <Home
        activeCategoryIndex={activeCategoryIndex}
        onNavigateToHotels={(q) => {
          const query = (q || "").trim();
          navigate(
            query ? `/hotels?q=${encodeURIComponent(query)}` : "/hotels"
          );
        }}
        onNavigateToCities={(q) => {
          const query = (q || "").trim();
          navigate(
            query ? `/cities?q=${encodeURIComponent(query)}` : "/cities"
          );
        }}
      />
    </UserLayout>
  );
};

const BookingSuccessPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout activeCategoryIndex={activeCategoryIndex} onCategoryChange={onCategoryChange}>
      <BookingSuccess />
    </UserLayout>
  );
};

const SearchPageWrapper = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <SearchPage />
    </UserLayout>
  );
};

const PaymentPageWrapper = ({ activeCategoryIndex, onCategoryChange }) => (
  <UserLayout activeCategoryIndex={activeCategoryIndex} onCategoryChange={onCategoryChange}>
    <PaymentPage />
  </UserLayout>
);

const ForgotPasswordPage = () => {
  return <ForgotPassword />;
};

/**
 * Trang ListingHotel trong layout,
 * khi click “Xem chỗ trống” thì đi tới /hotel-detail.
 */
const ListingHotelPage = ({ activeCategoryIndex, onCategoryChange }) => {
  const navigate = useNavigate();

  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <ListingHotel onNavigateToHotelDetail={() => navigate("/hotel-detail")} />
    </UserLayout>
  );
};

const HotelDetailPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <HotelDetail />
    </UserLayout>
  );
};

const ListingCitiesPage = ({ activeCategoryIndex, onCategoryChange }) => {
  const location = useLocation();
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <ListingCities key={location.search} />
    </UserLayout>
  );
};

const ListingFlightsPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <ListingFlights />
    </UserLayout>
  );
};

const OrderPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <Order />
    </UserLayout>
  );
};

const ProductDetailPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout activeCategoryIndex={activeCategoryIndex} onCategoryChange={onCategoryChange}>
      <ProductDetail />
    </UserLayout>
  );
};

const ConfirmOrderPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <ConfirmOrder />
    </UserLayout>
  );
};

const OrderFlightPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <OrderFlight />
    </UserLayout>
  );
};

const OrderSuccessPage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <OrderSuccess />
    </UserLayout>
  );
};

const ProfilePage = ({ activeCategoryIndex, onCategoryChange }) => {
  return (
    <UserLayout
      activeCategoryIndex={activeCategoryIndex}
      onCategoryChange={onCategoryChange}
    >
      <Profile />
    </UserLayout>
  );
};

/**
 *
 * Trang Register cũng KHÔNG bọc UserLayout
 */
const RegisterPage = () => {
  return <Register />;
};

/**
 * Login KHÔNG bọc UserLayout
 * -> chỉ render nội dung Login + AuthHeader bên trong trang.
 */
const LoginPage = () => {
  const navigate = useNavigate();

  const handleNext = async (email) => {
    // truyền email qua state để OTP screen đọc lại
    navigate("/otp-verify", { state: { email } });
  };

  return <Login onNext={handleNext} />;
};

/**
 * OtpVerify KHÔNG bọc UserLayout
 * -> dùng AuthHeader riêng, giống Login.
 */
const OtpVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <OtpVerify
      email={email}
      onSubmit={() => {
        // sau khi xác minh xong, tạm thời cho về trang chủ
        navigate("/");
      }}
      onResend={() => {
        console.log("Resend OTP");
      }}
      onBackToLogin={() => navigate("/login")}
      resendSeconds={60}
    />
  );
};



const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname, search]);

  return null;
};

const RequireAdmin = ({ children }) => {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = roles.map((r) => String(r).toLowerCase()).includes("admin");

  if (!token) {
    // chưa login -> đá về login và nhớ URL đang muốn vào
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    // login rồi nhưng không phải admin -> đá về home (hoặc /403)
    return <Navigate to="/" replace />;
  }

  return children;
};

const OrderDetailPage = ({ activeCategoryIndex, onCategoryChange }) => (
  <UserLayout activeCategoryIndex={activeCategoryIndex} onCategoryChange={onCategoryChange}>
    <OrderDetail />
  </UserLayout>
);

/**
 * Component Router chính – dùng trong main.jsx
 */
const AppRouter = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Trang chủ */}
        <Route
          path="/"
          element={
            <HomePage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        {/* Trang danh sách khách sạn */}
        <Route
          path="/hotels"
          element={
            <ListingHotelPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        {/* Trang chi tiết khách sạn */}
        <Route
          path="/hotel-detail"
          element={
            <HotelDetailPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        <Route
          path="/search"
          element={
            <SearchPageWrapper
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        {/* Trang điền thông tin đặt phòng */}
        <Route
          path="/order"
          element={
            <OrderPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />





        {/* Trang xác nhận đặt phòng */}
        <Route
          path="/confirm-order"
          element={
            <ConfirmOrderPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />
        <Route
          path="/payment"
          element={<PaymentPageWrapper activeCategoryIndex={activeCategoryIndex} onCategoryChange={setActiveCategoryIndex} />}
        />

        <Route
          path="/booking-success"
          element={<BookingSuccessPage activeCategoryIndex={activeCategoryIndex} onCategoryChange={setActiveCategoryIndex} />}
        />

        {/* Trang danh sách thành phố */}
        <Route
          path="/cities"
          element={
            <ListingCitiesPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        {/* Trang danh sách chuyến bay */}
        <Route
          path="/flights"
          element={
            <ListingFlightsPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        {/* Trang đặt chuyến bay */}
        <Route
          path="/order-flight"
          element={
            <OrderFlightPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        <Route
          path="/order-success"
          element={
            <OrderSuccessPage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        <Route
          path="/order-detail/:id" // [THÊM] Route mới có tham số id
          element={<OrderDetailPage activeCategoryIndex={activeCategoryIndex} onCategoryChange={setActiveCategoryIndex} />}
        />

        {/* Login – KHÔNG dùng UserLayout */}
        <Route path="/login" element={<LoginPage />} />
        {/* Register – KHÔNG dùng UserLayout */}
        <Route path="/register" element={<RegisterPage />} />
        {/* OTP – KHÔNG dùng UserLayout */}
        <Route path="/otp-verify" element={<OtpVerifyPage />} />

        {/* Admin layout */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        />

        {/* Fallback: route lạ -> về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/profile"
          element={
            <ProfilePage
              activeCategoryIndex={activeCategoryIndex}
              onCategoryChange={setActiveCategoryIndex}
            />
          }
        />

        <Route
          path="/product/:id"
          element={<ProductDetailPage activeCategoryIndex={activeCategoryIndex} onCategoryChange={setActiveCategoryIndex} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
