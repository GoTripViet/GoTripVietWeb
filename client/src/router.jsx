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

// Pages
import Home from "./pages/Home.jsx";
import ListingHotel from "./pages/ListingHotel.jsx";
import HotelDetail from "./pages/HotelDetail.jsx";
import Order from "./pages/Order.jsx";
import ConfirmOrder from "./pages/ConfirmOrder.jsx";
import Login from "./pages/Login.jsx";
import OtpVerify from "./pages/OtpVerify.jsx";
import ListingCities from "./pages/ListingCities.jsx";
import ListingFlights from "./pages/ListingFlights.jsx";
import OrderFlight from "./pages/OrderFlight.jsx";

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

        {/* Login – KHÔNG dùng UserLayout */}
        <Route path="/login" element={<LoginPage />} />

        {/* OTP – KHÔNG dùng UserLayout */}
        <Route path="/otp-verify" element={<OtpVerifyPage />} />

        {/* Fallback: route lạ -> về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
