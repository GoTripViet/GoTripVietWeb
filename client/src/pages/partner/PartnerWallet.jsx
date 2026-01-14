import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Modal, Form } from "react-bootstrap";
import authApi from "../../api/authApi";
import paymentApi from "../../api/paymentApi";
import { formatCurrency } from "../../utils/formatData";

export default function PartnerWallet() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for Withdrawal Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankInfo, setBankInfo] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Get User Profile (to get basic info)
      const userData = await authApi.getProfile();
      setUser(userData);

      // 2. Get Wallet & Transactions (Real API)
      const res = await paymentApi.getWalletTransactions();

      // Handle response structure
      // Case A: Backend returns { balance: 100, transactions: [...] }
      if (res.transactions) {
        setTransactions(res.transactions);
        setWalletBalance(res.balance || 0);
      }
      // Case B: Backend returns just array of transactions
      else if (Array.isArray(res)) {
        setTransactions(res);
        setWalletBalance(userData.wallet_balance || 0); // Fallback to user profile balance
      }
      // Case C: Backend returns { data: ... }
      else if (res.data) {
        setTransactions(res.data.transactions || []);
        setWalletBalance(res.data.balance || 0);
      }

    } catch (error) {
      console.error("Error loading wallet:", error);
      // alert("Could not load wallet history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE WITHDRAWAL ---
  const handleWithdrawSubmit = async () => {
    const amount = Number(withdrawAmount);

    // Validation
    if (!amount || amount <= 0) return alert("Please enter a valid amount.");
    if (amount > walletBalance) return alert("Insufficient balance.");
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
      return alert("Please fill in all bank details.");
    }

    try {
      setWithdrawLoading(true);

      // Call Real API
      await paymentApi.requestPayout(amount, bankInfo);

      alert("Withdrawal request submitted successfully!");
      setShowWithdrawModal(false);
      setWithdrawAmount("");

      // Reload data to update balance
      fetchData();

    } catch (error) {
      console.error(error);
      alert("Withdrawal failed: " + (error.response?.data?.message || error.message));
    } finally {
      setWithdrawLoading(false);
    }
  };

  // --- 3. UI HELPERS ---
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED') return <Badge bg="success">Hoàn thành</Badge>;
    if (s === 'PENDING') return <Badge bg="warning" text="dark">Đang xử lý</Badge>;
    if (s === 'FAILED' || s === 'REJECTED') return <Badge bg="danger">Thất bại</Badge>;
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getAmountColor = (type, amount) => {
    if (type === 'INCOME') return "text-success fw-bold";
    if (type === 'WITHDRAWAL' || type === 'COMMISSION') return "text-danger fw-bold";
    return "text-dark fw-bold";
  };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Ví Doanh Thu</h2>
          <p className="text-muted">Quản lý dòng tiền và rút doanh thu về ngân hàng</p>
        </div>
        <Button variant="outline-primary" onClick={fetchData}>
          <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
        </Button>
      </div>

      {/* CARDS */}
      <Row className="g-4 mb-5">
        {/* BALANCE CARD */}
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 bg-primary text-white h-100 bg-gradient">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="opacity-75 mb-1 text-uppercase small fw-bold">Số dư khả dụng</div>
                <div className="display-5 fw-bold">{formatCurrency(walletBalance)}</div>
              </div>
              <div className="mt-4 pt-3 border-top border-white border-opacity-25">
                <Button
                  variant="light"
                  className="text-primary fw-bold w-100 rounded-pill shadow-sm"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  <i className="bi bi-bank me-2"></i> Yêu cầu Rút tiền
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* PENDING INCOME CARD */}
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="text-muted text-uppercase small fw-bold mb-1">Doanh thu chờ duyệt</div>
              <div className="fs-3 fw-bold text-warning mb-3">
                {/* Calculate pending income locally */}
                {formatCurrency(
                  transactions
                    .filter(t => t.status === 'PENDING' && t.type === 'INCOME')
                    .reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </div>
              <small className="text-muted">
                * Số tiền này sẽ được cộng vào số dư sau khi tour hoàn thành (Completed).
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* HISTORY TABLE */}
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
                    <td className="ps-4 font-monospace text-muted small">
                      #{tx._id ? tx._id.slice(-6).toUpperCase() : '---'}
                    </td>
                    <td>
                      {tx.type === 'INCOME' && <Badge bg="success-subtle" text="success">Thu nhập</Badge>}
                      {tx.type === 'WITHDRAWAL' && <Badge bg="secondary-subtle" text="dark">Rút tiền</Badge>}
                      {tx.type === 'COMMISSION' && <Badge bg="danger-subtle" text="danger">Phí sàn</Badge>}
                    </td>
                    <td>{tx.description}</td>
                    <td className={getAmountColor(tx.type, tx.amount)}>
                      {tx.type === 'INCOME' ? '+' : ''}{formatCurrency(tx.amount)}
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

      {/* --- WITHDRAWAL MODAL --- */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Yêu cầu Rút tiền</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Số tiền muốn rút (VND)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ví dụ: 1000000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <Form.Text className="text-muted">
                Số dư khả dụng: <strong>{formatCurrency(walletBalance)}</strong>
              </Form.Text>
            </Form.Group>

            <h6 className="fw-bold mt-4 mb-2">Thông tin nhận tiền</h6>
            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Tên Ngân hàng (VD: Vietcombank)"
                value={bankInfo.bankName}
                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Số tài khoản"
                value={bankInfo.accountNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Tên chủ tài khoản (Viết hoa không dấu)"
                value={bankInfo.accountName}
                onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value.toUpperCase() })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleWithdrawSubmit} disabled={withdrawLoading}>
            {withdrawLoading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}