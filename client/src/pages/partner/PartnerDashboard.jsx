import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/partner/PartnerDashboard.css";

export default function PartnerDashboard() {
  const navigate = useNavigate();

  // Mock Stats
  const stats = [
    { label: "Doanh thu tháng", value: "12.500.000 ₫", icon: "bi-wallet2", color: "#10b981", bg: "#d1fae5", trend: "+15% so với tháng trước" },
    { label: "Đơn hàng mới", value: "8", icon: "bi-ticket-perforated", color: "#3b82f6", bg: "#dbeafe", trend: "+2 hôm nay" },
    { label: "Tour đang chạy", value: "3", icon: "bi-map", color: "#f59e0b", bg: "#fef3c7", trend: "Hoạt động ổn định" },
    { label: "Đánh giá", value: "4.8 ⭐", icon: "bi-star-fill", color: "#8b5cf6", bg: "#ede9fe", trend: "Tuyệt vời" },
  ];

  const menuItems = [
    {
      title: "Đăng Tour Mới",
      icon: "bi-plus-lg",
      desc: "Tạo sản phẩm du lịch mới để tiếp cận khách hàng.",
      link: "/partner/tours/create",
      color: "#ffffff",
      bg: "#0b5fff" // Primary Action
    },
    {
      title: "Quản lý Tour",
      icon: "bi-list-ul",
      desc: "Chỉnh sửa, cập nhật giá và lịch trình tour.",
      link: "/partner/tours",
      color: "#0b5fff",
      bg: "#eff6ff"
    },
    {
      title: "Đơn hàng Booking",
      icon: "bi-receipt",
      desc: "Xử lý đơn đặt chỗ và thông tin khách hàng.",
      link: "/partner/orders",
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      title: "Ví & Doanh thu",
      icon: "bi-cash-coin",
      desc: "Xem lịch sử thu nhập và yêu cầu rút tiền.",
      link: "/partner/wallet",
      color: "#10b981",
      bg: "#ecfdf5"
    },
  ];

  return (
    <div className="partner-dash">
      {/* HERO SECTION */}
      <div className="dash-hero">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="dash-title">Xin chào, Đối tác! 👋</h1>
              <div className="dash-subtitle">Chúc bạn một ngày kinh doanh hiệu quả và nhiều booking.</div>
            </div>
            {/* Optional: Add Date or Quick Notification Bell here */}
          </div>
        </Container>
      </div>

      <Container>
        {/* STATS ROW (Overlapping Hero) */}
        <Row className="g-4">
          {stats.map((item, idx) => (
            <Col md={6} lg={3} key={idx}>
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ color: item.color, backgroundColor: item.bg }}>
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <div className="stat-content">
                  <div className="stat-label">{item.label}</div>
                  <h3>{item.value}</h3>
                  <div className="stat-trend text-success">
                    <i className="bi bi-graph-up-arrow"></i> {item.trend}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* QUICK MENU */}
        <div className="menu-grid">
          {menuItems.map((item, idx) => (
            <div key={idx} className="menu-card" onClick={() => navigate(item.link)}>
              <div
                className="menu-icon-box"
                style={{
                  color: item.color,
                  backgroundColor: item.bg,
                  boxShadow: idx === 0 ? "0 4px 10px rgba(11, 95, 255, 0.3)" : "none" // Highlight first item
                }}
              >
                <i className={`bi ${item.icon}`}></i>
              </div>
              <div className="menu-title">{item.title}</div>
              <div className="menu-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}