// src/components/Header.tsx
import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import "../styles/home.css";
import flagVN from "../assets/flags/flag_vn.png";
import flagEN from "../assets/flags/flag_en.png";

export type TopLink = { icon?: React.ReactNode; label: string; href?: string };
export type CategoryLink = { icon?: React.ReactNode; label: string; href?: string };

export type HeaderProps = {
  logoSrc: string;
  onLogin?: () => void;
  onRegister?: () => void;
  language?: "VI" | "EN";
  onChangeLanguage?: (lang: "VI" | "EN") => void;
  topLinks?: TopLink[];
  categories?: CategoryLink[];
  activeCategoryIndex?: number;
  onCategoryChange?: (index: number) => void;
};

const DEFAULT_TOPLINKS: TopLink[] = [
  { icon: <i className="bi bi-tag-fill" />, label: "Khuyến mãi", href: "#" },
  { label: "Hỗ trợ", href: "#" },
  { label: "Hợp tác với chúng tôi", href: "#" },
  { label: "Mở ứng dụng", href: "#" },
];

const DEFAULT_CATEGORIES: CategoryLink[] = [
  { label: "Lưu trú", icon: <i className="bi bi-building" /> },
  { label: "Chuyến bay", icon: <i className="bi bi-airplane" /> },
  { label: "Chuyến bay & Khách sạn", icon: <i className="bi bi-briefcase" /> },
  { label: "Taxi sân bay", icon: <i className="bi bi-taxi-front" /> },
  { label: "Thuê xe", icon: <i className="bi bi-car-front" /> },
  { label: "Hoạt động", icon: <i className="bi bi-stars" /> },
];

export default function Header({...props}: HeaderProps) {
  const {
    logoSrc, onLogin, onRegister,
    language = "VI", onChangeLanguage,
    topLinks = DEFAULT_TOPLINKS,
    categories = DEFAULT_CATEGORIES,
    activeCategoryIndex = 0,
  } = props;

  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="gv-header gv-header--blue">
      <Navbar expand="lg" className="py-3">
        <Container>
          <Navbar.Brand href="#" className="me-4">
            <img src={logoSrc} alt="GoTripViet" className="gv-brand" />
          </Navbar.Brand>

          {/* topLinks desktop */}
          <Nav className="ms-auto align-items-center gap-3 d-none d-lg-flex text-white">
            <Dropdown align="end">
              <Dropdown.Toggle size="sm" className="bg-transparent border-0 text-white px-2 d-flex align-items-center gap-2">
                <img src={language === "EN" ? flagEN : flagVN} alt="" width={18} height={18} style={{objectFit:"cover", borderRadius:4}} />
                {language}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => onChangeLanguage?.("VI")} className="d-flex align-items-center gap-2">
                  <img src={flagVN} alt="" width={18} height={18} style={{objectFit:"cover", borderRadius:4}} />
                  Tiếng Việt
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onChangeLanguage?.("EN")} className="d-flex align-items-center gap-2">
                  <img src={flagEN} alt="" width={18} height={18} style={{objectFit:"cover", borderRadius:4}} />
                  English
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {topLinks.map((l: TopLink, idx: number) => (
              <a key={idx} className="text-decoration-none text-white opacity-85 hover-underline d-flex align-items-center gap-1" href={l.href || "#"}>
                {l.icon}{l.label}
              </a>
            ))}

            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-light" size="sm" onClick={onLogin}>
                <i className="bi bi-person me-2" /> Đăng nhập
              </Button>
              <Button variant="light" size="sm" className="text-primary fw-semibold" onClick={onRegister}>
                Đăng ký
              </Button>
            </div>
          </Nav>

          {/* nút hamburger cho mobile */}
          <button
            type="button"
            className="gv-hamburger d-lg-none"
            aria-label="Mở menu"
            onClick={() => setShowMenu(true)}
          >
            <i className="bi bi-list"></i>
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
              className={`gv-cat-pill d-flex align-items-center gap-2 ${idx === activeCategoryIndex ? "active" : ""}`}
              onClick={(e) => { e.preventDefault(); props.onCategoryChange?.(idx); }} // <--- thêm
              role="button"
            >
              {c.icon} <span>{c.label}</span>
            </a>
          ))}
        </Container>
      </div>

      {/* Offcanvas (mobile toplinks) */}
      <Offcanvas placement="end" show={showMenu} onHide={() => setShowMenu(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Language */}
          <div className="mb-3">
            <div className="text-muted small mb-2">Ngôn ngữ</div>
            <div className="d-flex gap-2">
              <Button variant={language === "VI" ? "primary" : "outline-primary"} onClick={() => onChangeLanguage?.("VI")} className="d-flex align-items-center gap-2">
                <img src={flagVN} width={18} height={18} style={{borderRadius:4, objectFit:"cover"}} alt="VI" /> Tiếng Việt
              </Button>
              <Button variant={language === "EN" ? "primary" : "outline-primary"} onClick={() => onChangeLanguage?.("EN")} className="d-flex align-items-center gap-2">
                <img src={flagEN} width={18} height={18} style={{borderRadius:4, objectFit:"cover"}} alt="EN" /> English
              </Button>
            </div>
          </div>

          {/* Top links */}
          <div className="list-group mb-3">
            {topLinks.map((l: TopLink, i: number) => (
              <a key={i} href={l.href || "#"} className="list-group-item list-group-item-action d-flex align-items-center gap-2">
                {l.icon}<span>{l.label}</span>
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="d-flex gap-2">
            <Button variant="outline-primary" className="flex-fill" onClick={onLogin}>
              <i className="bi bi-person me-2" /> Đăng nhập
            </Button>
            <Button variant="primary" className="flex-fill" onClick={onRegister}>
              Đăng ký
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}
