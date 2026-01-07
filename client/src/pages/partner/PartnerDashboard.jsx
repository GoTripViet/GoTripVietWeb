import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/partner/PartnerDashboard.css";

export default function PartnerDashboard() {
  const navigate = useNavigate();

  // Mock data thống kê (Sau này thay bằng API)
  const stats = [
    { label: "Doanh thu tháng này", value: "12.500.000 ₫", icon: "bi-cash-stack", color: "success", trend: "+15%" },
    { label: "Booking mới", value: "8", icon: "bi-ticket-perforated", color: "primary", trend: "+2" },
    { label: "Tour đang chạy", value: "3", icon: "bi-geo-alt", color: "info", trend: "Ổn định" },
    { label: "Đánh giá trung bình", value: "4.8 ⭐", icon: "bi-star", color: "warning", trend: "Cao" },
  ];

  const menuItems = [
    {
      title: "Quản lý Tour",
      icon: "bi-map",
      desc: "Đăng tour mới, cập nhật lịch trình & giá",
      link: "/partner/tours",
      color: "#0b5fff",
      bg: "#eff6ff"
    },
    {
      title: "Quản lý Đơn hàng",
      icon: "bi-receipt",
      desc: "Xử lý booking và danh sách khách hàng",
      link: "/partner/orders",
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      title: "Ví Doanh Thu",
      icon: "bi-wallet2",
      desc: "Lịch sử giao dịch và yêu cầu rút tiền",
      link: "/partner/wallet",
      color: "#10b981",
      bg: "#ecfdf5"
    },
    {
      title: "Hồ sơ & Cài đặt",
      icon: "bi-gear",
      desc: "Thông tin doanh nghiệp và liên hệ",
      link: "/profile",
      color: "#6b7280",
      bg: "#f3f4f6"
    },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* --- HEADER SECTION --- */}
      <div className="dashboard-header py-5 mb-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bolder text-dark mb-1">Xin chào, Đối tác! 👋</h2>
              <p className="text-muted mb-0">Đây là tổng quan tình hình kinh doanh hôm nay.</p>
            </div>
            <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate('/partner/tours/create')}>
              + Đăng Tour Mới
            </Button>
          </div>

          {/* Stats Row */}
          <Row className="g-3">
            {stats.map((stat, idx) => (
              <Col md={6} lg={3} key={idx}>
                <Card className="border-0 shadow-sm rounded-4 h-100 stat-card">
                  <Card.Body className="d-flex align-items-center p-3">
                    <div className={`icon-box bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-3 me-3`}>
                      <i className={`bi ${stat.icon} fs-4`}></i>
                    </div>
                    <div>
                      <p className="text-muted small mb-1 fw-semibold">{stat.label}</p>
                      <h5 className="fw-bold mb-0 text-dark">{stat.value}</h5>
                      <small className="text-success fw-bold" style={{fontSize: 11}}>{stat.trend}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* --- MENU GRID --- */}
      <Container className="pb-5">
        <h5 className="fw-bold mb-3 text-secondary px-2">Truy cập nhanh</h5>
        <Row className="g-4">
          {menuItems.map((item, idx) => (
            <Col md={6} lg={3} key={idx}>
              <Card
                className="h-100 border-0 shadow-sm rounded-4 menu-card"
                onClick={() => navigate(item.link)}
              >
                <Card.Body className="p-4 d-flex flex-column align-items-center text-center">
                  <div 
                    className="menu-icon mb-3"
                    style={{ color: item.color, backgroundColor: item.bg }}
                  >
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <h6 className="fw-bold mb-2 text-dark">{item.title}</h6>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </Card.Body>
                <div className="card-footer bg-white border-0 pt-0 pb-4">
                    <small className="text-primary fw-bold" style={{fontSize: 12}}>Truy cập &rarr;</small>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}