import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";

const AuthApp = lazy(() => import("auth/App"));
const DashboardApp = lazy(() => import("dashboard/App"));
const BookingApp = lazy(() => import("booking/App"));

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          GoTripViet
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarsExample"
          aria-controls="navbarsExample"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="navbarsExample" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard">
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/booking">
                Booking
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/auth">
                Auth
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="container py-5">
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Micro‑Frontend Shell</h1>
          <p className="col-md-8 fs-5">
            React + Bootstrap + Module Federation. Use the navbar to load
            remotes.
          </p>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<div className="container py-5">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/*" element={<AuthApp />} />
          <Route path="/dashboard/*" element={<DashboardApp />} />
          <Route path="/booking/*" element={<BookingApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
