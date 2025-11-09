import React from "react";
import AuthHeader from "./components/AuthHeader.tsx";
import Login from "./pages/Login.tsx";

export default function App() {
  return (
    <>
      <AuthHeader onHelpClick={() => alert("Hướng dẫn sẽ hiển thị ở đây")} />
      <Login />
    </>
  );
}
