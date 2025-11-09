import React from "react";
import logoUrl from "../assets/logos/logo_border.png";
import flagViUrl from "../assets/flags/flag_vn.png";
import "../styles/auth.css";

type AuthHeaderProps = {
  onHelpClick?: () => void;
};

export default function AuthHeader({ onHelpClick }: AuthHeaderProps) {
  return (
    <nav className="navbar auth-navbar">
      <div className="container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <img src={logoUrl} alt="GoTripViet" height={36} />
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Language */}
          <div className="dropdown">
            <button
              className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img src={flagViUrl} alt="Tiếng Việt" width={24} height={16} />
              <span className="d-none d-sm-inline">VI</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><button className="dropdown-item">Tiếng Việt</button></li>
              <li><button className="dropdown-item">English</button></li>
            </ul>
          </div>

          {/* Help */}
          <button
            className="btn btn-outline-dark rounded-circle"
            style={{ width: 38, height: 38 }}
            onClick={onHelpClick}
            aria-label="Trợ giúp"
            title="Trợ giúp"
          >
            ?
          </button>
        </div>
      </div>
    </nav>
  );
}
