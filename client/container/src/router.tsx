import React, { Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";

const Home = React.lazy(() => import("mfeHome/Home"));  
const Login = React.lazy(() => import("mfeAuth/Login"));
const OtpVerify = React.lazy(() => import("mfeAuth/OtpVerify"));
const ListingHotel = React.lazy(() => import("mfeListing/ListingHotel"));

function LoginPage() {
  const nav = useNavigate();
  return <Login onNext={(em) => nav(`/verify-otp?email=${encodeURIComponent(em)}`)} />;
}

function OtpPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const email = sp.get("email") ?? "";
  if (!email) return <Navigate to="/login" replace />;
  return (
    <OtpVerify
      email={email}
      onBackToLogin={() => nav("/login")}
      onSubmit={(code) => console.log("verify:", email, code)}
    />
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/listing/hotels" element={<ListingHotel />} />
      </Routes>
    </Suspense>
  );
}
