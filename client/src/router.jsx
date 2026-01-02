import React, { useState } from "react";
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
import SearchPage from "./pages/SearchPage.jsx";
// Pages
import ProductDetail from "./pages/ProductDetail.jsx";
import Home from "./pages/Home.jsx";
import ListingHotel from "./pages/ListingHotel.jsx";
import HotelDetail from "./pages/HotelDetail.jsx";
import Order from "./pages/Order.jsx";
import ConfirmOrder from "./pages/ConfirmOrder.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OtpVerify from "./pages/OtpVerify.jsx";
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
        onNavigateToHotels={() => navigate("/hotels")}
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
    <UserLayout activeCategoryIndex={activeCategoryIndex} onCategoryChange={onCategoryChange}>
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

/**
 * Component Router chính – dùng trong main.jsx
 */
const AppRouter = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  return (
    <BrowserRouter>
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

        {/* Login – KHÔNG dùng UserLayout */}
        <Route path="/login" element={<LoginPage />} />
        {/* Register – KHÔNG dùng UserLayout */}
        <Route path="/register" element={<RegisterPage />} />
        {/* OTP – KHÔNG dùng UserLayout */}
        <Route path="/otp-verify" element={<OtpVerifyPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
