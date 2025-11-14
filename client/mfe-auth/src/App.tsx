import React, { useState } from "react";
import AuthHeader from "./components/AuthHeader.tsx";
import Login from "./pages/Login.tsx";
import OtpVerify from "./pages/OtpVerify.tsx";

export default function App() {
  // chỉ dùng để test standalone tại :4001
  const [view, setView] = useState<"login" | "otp">("login");
  const [email, setEmail] = useState("");

  return (
    <>
      <AuthHeader onHelpClick={() => alert("Trợ giúp")} />
      {view === "login" ? (
        <Login
          onNext={(em) => {
            setEmail(em);
            setView("otp");
          }}
        />
      ) : (
        <OtpVerify
          email={email}
          onBackToLogin={() => setView("login")}
          onResend={() => console.log("resend to", email)}
          onSubmit={(code) => console.log("verify:", email, code)}
        />
      )}
    </>
  );
}
