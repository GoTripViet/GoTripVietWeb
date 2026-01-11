import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from "react-bootstrap";
import authApi from "../../api/authApi";
import paymentApi from "../../api/paymentApi"; // Đảm bảo đã cập nhật api này
import { formatCurrency } from "../../utils/formatData";

export default function PartnerWallet() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]); // Mock data nếu chưa có API
  const [loading, setLoading] = useState(true);

  // --- MOCK DATA (Dùng tạm nếu Backend chưa xong API list transaction) ---
  const MOCK_TRANSACTIONS = [
    { _id: "TX01", type: "INCOME", amount: 1500000, description: "Doanh thu đơn hàng #BK-9988", status: "COMPLETED", createdAt: "2025-11-20T10:00:00Z" },
    { _id: "TX02", type: "COMMISSION", amount: -225000, description: "Phí sàn 15% đơn #BK-9988", status: "COMPLETED", createdAt: "2025-11-20T10:00:00Z" },
    { _id: "TX03", type: "INCOME", amount: 2000000, description: "Doanh thu đơn hàng #BK-1122", status: "PENDING", createdAt: "2025-11-21T08:30:00Z" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy thông tin User (để xem số dư ví wallet_balance)
        const userData = await authApi.getProfile();
        setUser(userData);

        // 2. Lấy lịch sử giao dịch (Thử gọi API thật, nếu lỗi dùng Mock)
        try {
          const res = await paymentApi.getWalletTransactions();
          setTransactions(res.data || res);
        } catch (err) {
          console.warn("API Transaction chưa sẵn sàng, dùng Mock Data");
          setTransactions(MOCK_TRANSACTIONS);
        }

      } catch (error) {
        console.error("Lỗi tải ví:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'COMPLETED') return <Badge bg="success">Hoàn thành</Badge>;
    if (status === 'PENDING') return <Badge bg="warning" text="dark">Đang xử lý</Badge>;
    if (status === 'FAILED') return <Badge bg="danger">Thất bại</Badge>;
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getAmountColor = (type, amount) => {
    if (type === 'INCOME' && amount > 0) return "text-success fw-bold"; // + Tiền
    if (type === 'WITHDRAWAL' || type === 'COMMISSION' || amount < 0) return "text-danger fw-bold"; // - Tiền
    return "text-dark fw-bold";
  };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Ví Doanh Thu</h2>
          <p className="text-muted">Quản lý dòng tiền và rút doanh thu về ngân hàng</p>
        </div>
        <Button variant="outline-primary" onClick={() => window.location.reload()}>
          <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
        </Button>
      </div>

      {/* 1. THẺ SỐ DƯ */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 bg-primary text-white h-100 bg-gradient">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="opacity-75 mb-1 text-uppercase small fw-bold">Số dư khả dụng</div>
                <div className="display-5 fw-bold">{formatCurrency(user?.wallet_balance || 0)}</div>
              </div>
              <div className="mt-4 pt-3 border-top border-white border-opacity-25">
                <Button variant="light" className="text-primary fw-bold w-100 rounded-pill shadow-sm">
                  <i className="bi bi-bank me-2"></i> Yêu cầu Rút tiền
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="text-muted text-uppercase small fw-bold mb-1">Doanh thu chờ duyệt</div>
              {/* Giả định tính tổng các giao dịch PENDING */}
              <div className="fs-3 fw-bold text-warning mb-3">
                {formatCurrency(transactions.filter(t => t.status === 'PENDING' && t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0))}
              </div>
              <small className="text-muted">
                * Số tiền này sẽ được chuyển vào số dư khả dụng sau khi tour kết thúc 24h.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2. LỊCH SỬ GIAO DỊCH */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="bg-white py-3 border-bottom fw-bold">
          <i className="bi bi-clock-history me-2 text-primary"></i> Lịch sử biến động
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light text-secondary small">
              <tr>
                <th className="ps-4 py-3">Mã GD</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Chưa có giao dịch nào.</td></tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td className="ps-4 font-monospace text-muted small">#{tx._id.slice(-6).toUpperCase()}</td>
                    <td>
                      {tx.type === 'INCOME' && <Badge bg="success-subtle" text="success">Thu nhập</Badge>}
                      {tx.type === 'WITHDRAWAL' && <Badge bg="secondary-subtle" text="dark">Rút tiền</Badge>}
                      {tx.type === 'COMMISSION' && <Badge bg="danger-subtle" text="danger">Phí sàn</Badge>}
                    </td>
                    <td>{tx.description}</td>
                    <td className={getAmountColor(tx.type, tx.amount)}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td>{getStatusBadge(tx.status)}</td>
                    <td className="text-muted small">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}