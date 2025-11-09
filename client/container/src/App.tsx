import React, { Suspense } from "react";

const Login = React.lazy(() => import("mfeAuth/Login"));
const AuthHeader = React.lazy(() => import("mfeAuth/AuthHeader"));

export default function App() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <AuthHeader />
      <Login />
    </Suspense>
  );
}
