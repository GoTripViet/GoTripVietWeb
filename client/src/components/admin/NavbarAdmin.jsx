import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAdminMe } from "../../data/adminStore";
import logoOutlineBesideUrl from "../../assets/logos/logo_outline_beside.png";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "#0b5fff" : "#1f2937",
  background: isActive ? "rgba(11,95,255,0.10)" : "transparent",
  fontWeight: isActive ? 700 : 600,
});

export default function NavbarAdmin() {
  const nav = useNavigate();
  const me = useMemo(() => getAdminMe(), []);

  const onLogout = () => {
    // nếu bạn có auth token thì clear ở đây
    nav("/login");
  };

  const onOpenProfile = () => nav("/admin/profile");

  return (
    <aside
      style={{
        width: 300,
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "8px 6px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "8px 6px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src={logoOutlineBesideUrl}
            alt="GoTripViet"
            style={{
              height: 70,
              width: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <div style={{ height: 1, background: "#e5e7eb", margin: "6px 0" }} />

      {/* Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            color: "#6b7280",
            fontSize: 12,
            fontWeight: 700,
            padding: "0 6px",
          }}
        >
          Tổng quan
        </div>
        <NavLink to="/admin/dashboard/basic" style={linkStyle}>
          Dashboard cơ bản
        </NavLink>
        <NavLink to="/admin/dashboard/advanced" style={linkStyle}>
          Dashboard nâng cao
        </NavLink>

        <div
          style={{
            color: "#6b7280",
            fontSize: 12,
            fontWeight: 700,
            padding: "10px 6px 0",
          }}
        >
          Quản lý dữ liệu
        </div>
        <NavLink to="/admin/manage/home" style={linkStyle}>
          Quản lý Home
        </NavLink>
        <NavLink to="/admin/manage/flights" style={linkStyle}>
          Quản lý chuyến bay
        </NavLink>
        <NavLink to="/admin/manage/hotels" style={linkStyle}>
          Quản lý khách sạn
        </NavLink>
        <NavLink to="/admin/manage/events" style={linkStyle}>
          Quản lý events
        </NavLink>
        <NavLink to="/admin/manage/orders" style={linkStyle}>
          Quản lý đơn hàng
        </NavLink>

        <div
          style={{
            color: "#6b7280",
            fontSize: 12,
            fontWeight: 700,
            padding: "10px 6px 0",
          }}
        >
          Tài khoản
        </div>
        <NavLink to="/admin/manage/users" style={linkStyle}>
          Quản lý người dùng
        </NavLink>
        <NavLink to="/admin/manage/admins" style={linkStyle}>
          Quản lý admin
        </NavLink>
        <NavLink to="/admin/manage/partner-airports" style={linkStyle}>
          Đối tác hãng bay
        </NavLink>
        <NavLink to="/admin/manage/partner-hotels" style={linkStyle}>
          Đối tác khách sạn
        </NavLink>

        <div
          style={{
            color: "#6b7280",
            fontSize: 12,
            fontWeight: 700,
            padding: "10px 6px 0",
          }}
        >
          Tài chính
        </div>
        <NavLink to="/admin/expenses" style={linkStyle}>
          Quản lý chi tiêu
        </NavLink>
      </div>

      <div style={{ flex: 1 }} />

      {/* Profile box + logout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: 12,
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          background: "#fafafa",
        }}
      >
        <button
          onClick={onOpenProfile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            padding: 0,
            flex: 1,
            textAlign: "left",
          }}
          title="Xem hồ sơ admin"
        >
          <img
            src={me?.avatar}
            alt="admin"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{me?.fullName}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{me?.email}</div>
          </div>
        </button>

        <button
          onClick={onLogout}
          title="Đăng xuất"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ⎋
        </button>
      </div>
    </aside>
  );
}
