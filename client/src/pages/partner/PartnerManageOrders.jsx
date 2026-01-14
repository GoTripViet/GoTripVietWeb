import React, { useEffect, useState } from "react";
import { Container, Card, Table, Badge, Button, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import bookingApi from "../../api/bookingApi"; // [CHANGED] Use bookingApi

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export default function PartnerManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getPartnerBookings();
      // Logic: backend returns { bookings: [], total: ... } or just []
      setOrders(res.bookings || res.data || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filtered = orders.filter(o => filterStatus === 'ALL' || o.status?.toUpperCase() === filterStatus);

  // Helper to render Status
  const renderStatus = (st) => {
    const s = st?.toLowerCase();
    if (s === 'pending') return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
    if (s === 'confirmed') return <Badge bg="primary">Đã xác nhận</Badge>;
    if (s === 'completed') return <Badge bg="success">Hoàn thành</Badge>;
    if (s === 'cancelled') return <Badge bg="danger">Đã hủy</Badge>;
    return <Badge bg="secondary">{st}</Badge>;
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold">Quản lý Booking</h2>
        <Button variant="outline-primary" onClick={fetchData}>↻ Tải lại</Button>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex gap-2">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(st => (
              <Button key={st} variant={filterStatus === st ? "primary" : "light"} onClick={() => setFilterStatus(st)} className="rounded-pill fw-bold text-uppercase" size="sm">
                {st === 'ALL' ? 'Tất cả' : st}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light text-secondary small">
            <tr>
              <th className="ps-4 py-3">Mã Đơn</th>
              <th>Sản phẩm</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan="7" className="text-center py-4 text-muted">Không có đơn hàng nào.</td></tr>}

            {filtered.map(booking => {
              // Booking Model has an array of items. We show the first one.
              const firstItem = booking.items?.[0];
              const title = firstItem?.snapshot?.title || "Sản phẩm đã xóa";
              const itemCount = booking.items?.length || 0;
              const customerName = booking.customer_details?.fullName || "Khách vãng lai";
              const customerPhone = booking.customer_details?.phone || "";

              return (
                <tr key={booking._id}>
                  <td className="ps-4 fw-bold text-primary">#{booking._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="fw-bold text-dark">{title}</div>
                    {itemCount > 1 && <small className="text-muted">+ {itemCount - 1} sản phẩm khác</small>}
                  </td>
                  <td>
                    <div>{customerName}</div>
                    <small className="text-muted">{customerPhone}</small>
                  </td>
                  <td>{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="fw-bold">{formatCurrency(booking.pricing?.final_price || 0)}</td>
                  <td>{renderStatus(booking.status)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="light"
                      className="text-primary fw-bold"
                      onClick={() => navigate(`/partner/orders/${booking._id}`)}
                    >
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}