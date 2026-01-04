// src/pages/BookingSuccess.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import "../styles/booking-process.css";
import { formatCurrency } from "../utils/formatData";
import paymentApi from "../api/paymentApi"; // Đảm bảo đã import API

// Stepper (Bước 3 Active)
const BookingStepper = ({ step }) => (
    <div className="booking-stepper">
        <div className="step-connector"></div>
        <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <div className="step-icon"><i className="bi bi-person-lines-fill"></i></div>
            <span>NHẬP THÔNG TIN</span>
        </div>
        <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <div className="step-icon"><i className="bi bi-credit-card"></i></div>
            <span>THANH TOÁN</span>
        </div>
        <div className={`step-item ${step >= 3 ? "active" : ""}`}>
            <div className="step-icon"><i className="bi bi-check-lg"></i></div>
            <span>HOÀN TẤT</span>
        </div>
    </div>
);

export default function BookingSuccess() {
    const location = useLocation();
    const navigate = useNavigate();

    // State quản lý trạng thái hiển thị
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        // 1. Kiểm tra URL Params (Trường hợp quay về từ VNPAY)
        const params = new URLSearchParams(location.search);
        const vnpResponseCode = params.get('vnp_ResponseCode');

        // 2. Lấy data từ Mock Test (Trường hợp cũ - fallback)
        const stateBooking = location.state?.booking;

        if (vnpResponseCode) {
            // --- XỬ LÝ KẾT QUẢ TỪ VNPAY ---
            if (vnpResponseCode === '00') {
                // Gom tất cả params VNPAY trả về thành object
                const vnpParams = Object.fromEntries(params);

                // Gọi Backend để xác thực chữ ký và LẤY THÔNG TIN BOOKING
                // Thay thế đoạn logic verifyPayment cũ bằng đoạn này:

                const verifyPayment = async () => {
                    try {
                        // Gọi API
                        const response = await paymentApi.verifyVNPay(vnpParams);

                        // [FIX]: Lấy data thật sự bất kể có qua interceptor hay không
                        // Nếu response có thuộc tính .data (Axios Object) thì lấy .data
                        // Nếu không (đã qua Interceptor) thì lấy chính nó
                        const data = response.data ? response.data : response;

                        console.log("Verify Result:", data); // Log để debug nếu cần

                        // Kiểm tra kết quả từ Backend
                        if (data.status === 'success') {
                            setStatus('success');
                            // Backend trả về: { status: 'success', data: { ...booking... } }
                            // Nên booking object nằm trong data.data
                            setBooking(data.data);
                        } else {
                            console.error("Lỗi xác thực VNPAY:", data);
                            setStatus('failed');
                        }
                    } catch (error) {
                        console.error("Lỗi gọi API Verify:", error);
                        setStatus('failed');
                    }
                }; 
                verifyPayment();

            } else {
                // Mã lỗi khác 00 (Khách hủy hoặc lỗi)
                setStatus('failed');
            }
        } else if (stateBooking) {
            // --- TRƯỜNG HỢP TEST KHÔNG QUA VNPAY ---
            setStatus('success');
            setBooking(stateBooking);
        } else {
            // Không có thông tin gì -> Về trang chủ
            navigate("/");
        }
    }, [location, navigate]);

    // --- MÀN HÌNH LOADING ---
    if (status === 'loading') {
        return (
            <Container className="text-center py-5" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <h5 className="mt-3 text-primary">Đang xác thực thanh toán...</h5>
                <p className="text-muted">Hệ thống đang cập nhật trạng thái đơn hàng, vui lòng không tắt trình duyệt.</p>
            </Container>
        );
    }

    // --- MÀN HÌNH THẤT BẠI ---
    if (status === 'failed') {
        return (
            <Container className="my-5">
                <BookingStepper step={3} />
                <div className="text-center py-5">
                    <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mb-3" style={{ width: 80, height: 80 }}>
                        <i className="bi bi-x-lg display-4"></i>
                    </div>
                    <h2 className="fw-bold text-danger">Thanh toán thất bại!</h2>
                    <p className="text-muted mb-4">Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xác thực.</p>

                    <div className="d-flex justify-content-center gap-3">
                        <Button variant="secondary" onClick={() => navigate("/")}>Về trang chủ</Button>
                        <Button variant="danger" onClick={() => navigate(-1)}>Thử thanh toán lại</Button>
                    </div>
                </div>
            </Container>
        );
    }

    // --- MÀN HÌNH THÀNH CÔNG ---
    // Lấy dữ liệu an toàn từ object booking
    const firstItem = booking?.items?.[0] || {};
    const snapshot = firstItem.snapshot || {}; // Thông tin tour lưu lúc đặt
    const customer = booking?.customer_details || {};
    const pricing = booking?.pricing || {};

    return (
        <Container className="my-5">
            <BookingStepper step={3} />

            <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3" style={{ width: 80, height: 80 }}>
                    <i className="bi bi-check-lg display-4"></i>
                </div>
                <h2 className="fw-bold text-success text-uppercase">Đặt tour thành công!</h2>
                <p className="text-muted">Cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.</p>
                {customer.email && <p>Một email xác nhận đã được gửi đến <strong>{customer.email}</strong></p>}
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                        <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center bg-gradient">
                            <span className="fw-bold"><i className="bi bi-receipt"></i> MÃ ĐƠN HÀNG</span>
                            {/* Hiển thị 6 ký tự cuối của ID cho gọn */}
                            <span className="fs-5 fw-bold">{booking?._id ? booking._id.slice(-6).toUpperCase() : '...'}</span>
                        </div>
                        <Card.Body className="p-4">

                            {/* --- THÔNG TIN TOUR (Lấy từ DB) --- */}
                            {snapshot.title ? (
                                <div className="d-flex gap-3 mb-4 pb-4 border-bottom">
                                    <img
                                        src={snapshot.image || "https://placehold.co/150x100"}
                                        alt="Tour"
                                        className="rounded-3 shadow-sm"
                                        style={{ width: 120, height: 90, objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h6 className="fw-bold mb-1">{snapshot.title}</h6>
                                        {/* Hiển thị text chi tiết nếu có */}
                                        <div className="text-muted small mb-2 text-truncate-2-lines">
                                            {snapshot.details_text || snapshot.description_short || 'Thông tin chi tiết tour'}
                                        </div>
                                        <div className="badge bg-info text-dark">
                                            {firstItem.quantity || 1} Khách
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-success mb-4">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Đơn hàng của bạn đã được ghi nhận và thanh toán thành công.
                                </div>
                            )}

                            <Row className="g-3">
                                {/* --- THÔNG TIN KHÁCH HÀNG (Lấy từ DB) --- */}
                                <Col md={6}>
                                    <h6 className="fw-bold text-uppercase small text-muted mb-3">Người đặt tour</h6>
                                    {customer.fullName ? (
                                        <ul className="list-unstyled mb-0 small">
                                            <li className="mb-2"><i className="bi bi-person me-2 text-primary"></i> <strong>{customer.fullName}</strong></li>
                                            <li className="mb-2"><i className="bi bi-telephone me-2 text-primary"></i> {customer.phone}</li>
                                            <li className="mb-2"><i className="bi bi-envelope me-2 text-primary"></i> {customer.email}</li>
                                            <li><i className="bi bi-geo-alt me-2 text-primary"></i> {customer.address || 'Chưa cập nhật'}</li>
                                        </ul>
                                    ) : (
                                        <p className="small text-muted fst-italic">Thông tin đang được cập nhật...</p>
                                    )}
                                </Col>

                                {/* --- THÔNG TIN THANH TOÁN (Lấy từ DB) --- */}
                                <Col md={6}>
                                    <h6 className="fw-bold text-uppercase small text-muted mb-3">Thanh toán</h6>
                                    <div className="bg-light p-3 rounded">
                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span>Trạng thái:</span>
                                            <span className="text-success fw-bold">
                                                {booking?.payment_status === 'paid' ? 'Đã thanh toán' : 'Thành công'} <i className="bi bi-check-circle-fill"></i>
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 small">
                                            <span>Phương thức:</span>
                                            <span className="fw-bold text-primary">VNPAY QR</span>
                                        </div>

                                        {pricing.final_price && (
                                            <>
                                                <hr className="my-2" />
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold">Tổng tiền:</span>
                                                    <span className="text-danger fw-bold fs-5">{formatCurrency(pricing.final_price)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer className="bg-white p-3 text-center border-top">
                            <small className="text-muted fst-italic">
                                * Quý khách vui lòng kiểm tra email để xem chi tiết lịch trình và vé điện tử.
                                <br />Nếu cần hỗ trợ, vui lòng liên hệ hotline: <strong>1900 1234</strong>
                            </small>
                        </Card.Footer>
                    </Card>

                    <div className="d-flex gap-3 justify-content-center">
                        <Button variant="outline-primary" size="lg" onClick={() => navigate("/")}>
                            <i className="bi bi-house-door me-2"></i> Về trang chủ
                        </Button>
                        <Button variant="primary" size="lg" onClick={() => navigate("/profile")}>
                            <i className="bi bi-person-bounding-box me-2"></i> Quản lý đơn hàng
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}