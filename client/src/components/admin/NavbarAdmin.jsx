import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
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

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  const a = parts[0][0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] || "" : "";
  return (a + b).toUpperCase();
}

export default function NavbarAdmin() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const profile = await authApi.getProfile(); // GET /users/me
        if (alive) setMe(profile);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          nav("/login");
          return;
        }
        console.error("Load admin profile failed:", err);
      }
    })();

    return () => {
      alive = false;
    };
  }, [nav]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  const onOpenProfile = () => nav("/admin/profile");

  const avatarNode = me?.avatar ? (
    <img
      src={me.avatar}
      alt="admin"
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        objectFit: "cover",
      }}
    />
  ) : (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: "#e5e7eb",
        fontWeight: 900,
      }}
      title={me?.fullName || "Admin"}
    >
      {getInitials(me?.fullName || me?.email || "Admin")}
    </div>
  );

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
        <NavLink to="/admin/manage/locations" style={linkStyle}>
          Quản lý địa điểm
        </NavLink>
        <NavLink to="/admin/manage/categories" style={linkStyle}>
          Quản lý danh mục
        </NavLink>
        <NavLink to="/admin/manage/tours" style={linkStyle}>
          Quản lý Tour
        </NavLink>
        <NavLink to="/admin/manage/promotions" style={linkStyle}>
          Quản lý khuyến mãi
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
        <NavLink to="/admin/manage/partners" style={linkStyle}>
          Quản lý đối tác
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
          {avatarNode}
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              {me?.fullName || "Admin"}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {me?.email || ""}
            </div>
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
