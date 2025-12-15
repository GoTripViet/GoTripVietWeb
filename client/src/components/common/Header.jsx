// src/components/Header.jsx
import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/layout.css";
import flagVN from "../../assets/flags/flag_vn.png";
import flagEN from "../../assets/flags/flag_en.png";

const DEFAULT_TOPLINKS = [
  { icon: <i className="bi bi-tag-fill" />, label: "Khuyến mãi", href: "#" },
  { label: "Hỗ trợ", href: "#" },
  { label: "Hợp tác với chúng tôi", href: "#" },
  { label: "Mở ứng dụng", href: "#" },
];

const DEFAULT_CATEGORIES = [
  { label: "Lưu trú", icon: <i className="bi bi-building" /> },
  { label: "Chuyến bay", icon: <i className="bi bi-airplane" /> },
  { label: "Chuyến bay & Khách sạn", icon: <i className="bi bi-briefcase" /> },
  { label: "Taxi sân bay", icon: <i className="bi bi-taxi-front" /> },
  { label: "Thuê xe", icon: <i className="bi bi-car-front" /> },
  { label: "Hoạt động", icon: <i className="bi bi-stars" /> },
];

export default function Header(props) {
  const {
    logoSrc,
    onLogin,
    onRegister,
    language = "VI",
    onChangeLanguage,
    topLinks = DEFAULT_TOPLINKS,
    categories = DEFAULT_CATEGORIES,
    activeCategoryIndex = 0,
    userName,
    avatarUrl,
  } = props;

  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const renderUserDesktop = () => {
    if (!userName) return null;
    return (
      <div className="d-flex align-items-center">
        <div className="bg-white text-primary rounded-pill px-2 py-1 d-flex align-items-center gap-2">
          <span className="small fw-semibold">{userName}</span>
          <div
            className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-secondary-subtle"
            style={{ width: 32, height: 32 }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <i className="bi bi-person-fill" />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUserMobile = () => {
    if (!userName) return null;
    return (
      <div className="d-flex align-items-center gap-2 mb-3">
        <div
          className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-secondary-subtle"
          style={{ width: 40, height: 40 }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <i className="bi bi-person-fill fs-5" />
          )}
        </div>
        <div>
          <div className="small text-muted">Đã đăng nhập</div>
          <div className="fw-semibold">{userName}</div>
        </div>
      </div>
    );
  };

  const isLoggedIn = !!userName;

  return (
    <header className="gv-header gv-header--blue">
      <Navbar expand="lg" className="py-3">
        <Container>
          <Navbar.Brand
            href="/"
            className="me-4"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              setShowMenu(false);
            }}
          >
            <img src={logoSrc} alt="GoTripViet" className="gv-brand" />
          </Navbar.Brand>

          {/* topLinks desktop */}
          <Nav className="ms-auto align-items-center gap-3 d-none d-lg-flex text-white">
            <Dropdown align="end">
              <Dropdown.Toggle
                size="sm"
                className="bg-transparent border-0 text-white px-2 d-flex align-items-center gap-2"
              >
                <img
                  src={language === "EN" ? flagEN : flagVN}
                  alt=""
                  width={18}
                  height={18}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
                {language}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => onChangeLanguage && onChangeLanguage("VI")}
                  className="d-flex align-items-center gap-2"
                >
                  <img
                    src={flagVN}
                    alt=""
                    width={18}
                    height={18}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                  Tiếng Việt
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => onChangeLanguage && onChangeLanguage("EN")}
                  className="d-flex align-items-center gap-2"
                >
                  <img
                    src={flagEN}
                    alt=""
                    width={18}
                    height={18}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                  English
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {topLinks.map((l, idx) => (
              <a
                key={idx}
                className="text-decoration-none text-white opacity-85 hover-underline d-flex align-items-center gap-1"
                href={l.href || "#"}
              >
                {l.icon}
                {l.label}
              </a>
            ))}

            {/* Auth / User desktop */}
            <div className="d-flex align-items-center gap-2">
              {isLoggedIn ? (
                renderUserDesktop()
              ) : (
                <>
                  <Button variant="outline-light" size="sm" onClick={onLogin}>
                    <i className="bi bi-person me-2" /> Đăng nhập
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    className="text-primary fw-semibold"
                    onClick={onRegister}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </Nav>

          {/* nút hamburger cho mobile */}
          <button
            type="button"
            className="gv-hamburger d-lg-none"
            aria-label="Mở menu"
            onClick={() => setShowMenu(true)}
          >
            <i className="bi bi-list" />
          </button>
        </Container>
      </Navbar>

      {/* Hàng dưới: dải danh mục dạng pill viền trắng */}
      <div className="gv-header-cats">
        <Container className="py-2 d-flex flex-wrap align-items-center gap-3">
          {categories.map((c, idx) => (
            <a
              key={idx}
              href={c.href || "#"}
              className={`gv-cat-pill d-flex align-items-center gap-2 ${
                idx === activeCategoryIndex ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();

                // đổi tab đang active
                props.onCategoryChange?.(idx);

                // nếu đang ở trang khác (listing, detail, order...) thì về Home để render đúng tab
                if (location.pathname !== "/") {
                  navigate("/");
                }

                // đóng menu mobile nếu đang mở
                setShowMenu(false);
              }}
              role="button"
            >
              {c.icon} <span>{c.label}</span>
            </a>
          ))}
        </Container>
      </div>

      {/* Offcanvas (mobile toplinks) */}
      <Offcanvas
        placement="end"
        show={showMenu}
        onHide={() => setShowMenu(false)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* User info mobile (nếu đã đăng nhập) */}
          {renderUserMobile()}

          {/* Language */}
          <div className="mb-3">
            <div className="text-muted small mb-2">Ngôn ngữ</div>
            <div className="d-flex gap-2">
              <Button
                variant={language === "VI" ? "primary" : "outline-primary"}
                onClick={() => onChangeLanguage && onChangeLanguage("VI")}
                className="d-flex align-items-center gap-2"
              >
                <img
                  src={flagVN}
                  width={18}
                  height={18}
                  style={{ borderRadius: 4, objectFit: "cover" }}
                  alt="VI"
                />{" "}
                Tiếng Việt
              </Button>
              <Button
                variant={language === "EN" ? "primary" : "outline-primary"}
                onClick={() => onChangeLanguage && onChangeLanguage("EN")}
                className="d-flex align-items-center gap-2"
              >
                <img
                  src={flagEN}
                  width={18}
                  height={18}
                  style={{ borderRadius: 4, objectFit: "cover" }}
                  alt="EN"
                />{" "}
                English
              </Button>
            </div>
          </div>

          {/* Top links */}
          <div className="list-group mb-3">
            {topLinks.map((l, i) => (
              <a
                key={i}
                href={l.href || "#"}
                className="list-group-item list-group-item-action d-flex align-items-center gap-2"
              >
                {l.icon}
                <span>{l.label}</span>
              </a>
            ))}
          </div>

          {/* Auth buttons / user mobile */}
          {!isLoggedIn && (
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                className="flex-fill"
                onClick={onLogin}
              >
                <i className="bi bi-person me-2" /> Đăng nhập
              </Button>
              <Button
                variant="primary"
                className="flex-fill"
                onClick={onRegister}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}
