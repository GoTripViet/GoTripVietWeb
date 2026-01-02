// src/pages/Order.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import "../styles/booking-process.css"; 
import { formatCurrency } from "../utils/formatData";
import inventoryApi from "../api/inventoryApi";
import bookingApi from "../api/bookingApi";

// Component con: Thanh tiến trình
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

export default function Order() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. NHẬN DỮ LIỆU TỪ TRANG TRƯỚC
    const productData = location.state?.product;

    // --- STATE KIỂM TRA ĐĂNG NHẬP ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // --- KIỂM TRA AN TOÀN ---
    useEffect(() => {
        if (!productData) {
            alert("Không tìm thấy thông tin chuyến đi. Vui lòng chọn tour lại!");
            navigate("/"); 
        }

        const token = localStorage.getItem("token"); 
        setIsLoggedIn(!!token); 

    }, [productData, navigate]);

    if (!productData) return null;

    const { transportInfo } = productData;

    // --- STATES ---
    const initialCounts = productData.bookingInfo ? {
        adult: productData.bookingInfo.adults || 1,
        child: productData.bookingInfo.children || 0,
        toddler: 0,
        infant: 0
    } : { adult: 1, child: 0, toddler: 0, infant: 0 };

    const [counts, setCounts] = useState(initialCounts);

    const [contactInfo, setContactInfo] = useState({
        fullName: "", phone: "", email: "", address: "", note: ""
    });

    const [passengers, setPassengers] = useState([]);
    const [useSingleRoom, setUseSingleRoom] = useState(false);
    const SINGLE_ROOM_PRICE = 1400000; 

    // States cho Mã giảm giá
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState("");

    // --- EFFECT: CẬP NHẬT DANH SÁCH KHÁCH ---
    useEffect(() => {
        let newPassengers = [];
        for (let i = 0; i < counts.adult; i++) newPassengers.push({ type: 'adult', label: 'Người lớn', index: i, gender: 'Nam' });
        for (let i = 0; i < counts.child; i++) newPassengers.push({ type: 'child', label: 'Trẻ em', index: i, gender: 'Nam' });
        for (let i = 0; i < counts.toddler; i++) newPassengers.push({ type: 'toddler', label: 'Trẻ nhỏ', index: i, gender: 'Nam' });
        for (let i = 0; i < counts.infant; i++) newPassengers.push({ type: 'infant', label: 'Em bé', index: i, gender: 'Nam' });

        setPassengers(prev => {
            return newPassengers.map((p, idx) => {
                if (prev[idx] && prev[idx].type === p.type) {
                    return { ...p, ...prev[idx], index: idx };
                }
                return p;
            });
        });
    }, [counts]);

    const handlePassengerChange = (index, field, value) => {
        setPassengers(prev => {
            const updated = [...prev];
            if (!updated[index]) return prev;
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // --- TÍNH TOÁN GIÁ ---
    const calculateTotal = () => {
        let total = 0;
        const basePrice = productData.basePrice || 0;

        total += counts.adult * basePrice;
        total += counts.child * (basePrice * 0.8);
        total += counts.toddler * (basePrice * 0.5);
        total += counts.infant * (basePrice * 0.1);

        if (useSingleRoom) total += SINGLE_ROOM_PRICE;

        const subTotalBeforeDiscount = total;

        let promoDiscount = 0;
        if (appliedPromo) {
            if (appliedPromo.type === 'percentage') {
                promoDiscount = subTotalBeforeDiscount * (appliedPromo.value / 100);
            } else if (appliedPromo.type === 'fixed_amount') {
                promoDiscount = appliedPromo.value;
            }
            if (promoDiscount > subTotalBeforeDiscount) {
                promoDiscount = subTotalBeforeDiscount;
            }
        }

        const final = total - promoDiscount;
        return {
            subTotal: total,
            promoDiscount,
            final: final > 0 ? final : 0
        };
    };

    const { subTotal, promoDiscount, final } = calculateTotal();

    // --- XỬ LÝ SỰ KIỆN ---
    const handleCountChange = (type, delta) => {
        setCounts(prev => {
            const newVal = prev[type] + delta;
            if (newVal < 0) return prev;
            if (type === 'adult' && newVal < 1) return prev;
            return { ...prev, [type]: newVal };
        });
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setPromoError("");
        try {
            const res = await inventoryApi.checkPromotion(promoCode);
            const promo = res.data || res;

            if (promo.rules && promo.rules.min_spend > subTotal) {
                setPromoError(`Đơn hàng phải từ ${formatCurrency(promo.rules.min_spend)} mới được dùng mã này.`);
                setAppliedPromo(null);
                return;
            }
            setAppliedPromo(promo);
            alert("Áp dụng mã giảm giá thành công!");
        } catch (error) {
            console.error(error);
            setAppliedPromo(null);
            setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        }
    };

    const handleSubmit = async () => {
        if (!contactInfo.fullName || !contactInfo.phone || !contactInfo.email) {
            alert("Vui lòng điền đầy đủ thông tin liên hệ.");
            return;
        }
        for (const p of passengers) {
            if (!p.fullName) {
                alert(`Vui lòng nhập tên cho hành khách: ${p.label} ${p.index + 1}`);
                return;
            }
        }

        try {
            const departDate = transportInfo?.details?.depart?.date 
                               || productData.bookingInfo?.date 
                               || "Chưa xác định";

            const payload = {
                items: [{
                    productId: productData.id,
                    inventoryId: productData.bookingInfo?.inventoryId,
                    productType: 'tour',
                    quantity: counts.adult + counts.child + counts.toddler + counts.infant,
                    unitPrice: productData.basePrice,
                    productTitle: productData.title,
                    image: productData.image,
                    detailsText: `Ngày đi: ${departDate}`
                }],
                promotionCode: appliedPromo ? appliedPromo.code : null,
                passengers: passengers,
                contactInfo: contactInfo
            };

            const res = await bookingApi.createBooking(payload);
            const bookingId = res.data?.bookingId || res.bookingId;

            if (bookingId) {
                navigate("/payment", { state: { bookingId: bookingId } });
            } else {
                throw new Error("Không nhận được Booking ID.");
            }
        } catch (error) {
            console.error("Lỗi đặt tour:", error);
            const msg = error.response?.data?.message || error.message;
            alert("Lỗi đặt tour: " + msg);
        }
    };

    // --- HÀM RENDER THÔNG TIN VẬN CHUYỂN ---
    const renderTransportInfo = () => {
        if (!transportInfo || transportInfo.type === 'other') {
            return (
                <div className="p-3 border-bottom bg-light bg-opacity-50 text-muted small fst-italic">
                    <i className="bi bi-info-circle me-1"></i> 
                    Phương tiện: {transportInfo?.details?.vehicle || "Theo lịch trình tour"}
                </div>
            );
        }

        const details = transportInfo.details || {};
        const depart = details.depart || {};
        const isFlight = transportInfo.type === 'flight';

        return (
            <div className="p-3 border-bottom bg-light bg-opacity-50">
                <div className="fw-bold small mb-2 text-primary">
                    {isFlight ? <><i className="bi bi-airplane me-1"></i> THÔNG TIN CHUYẾN BAY</> 
                             : <><i className="bi bi-bus-front me-1"></i> THÔNG TIN DI CHUYỂN</>}
                </div>
                
                <div className="mb-2 fw-bold text-dark">
                    {isFlight ? details.airline : details.vehicle}
                </div>

                <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Khởi hành - {depart.date}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold small">
                        <span>{depart.time}</span>
                        <span>{isFlight ? depart.code : (depart.location || "Điểm hẹn")}</span>
                    </div>
                </div>

                {isFlight && details.return && (
                    <div>
                        <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>Chiều về - {details.return.date}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold small">
                            <span>{details.return.time}</span>
                            <span>{details.return.code}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Container className="my-5">
            <BookingStepper step={1} />

            <Row className="g-4">
                {/* Cột Trái: Form */}
                <Col lg={8}>
                    {/* 1. LIÊN LẠC */}
                    <h5 className="fw-bold mb-3 text-uppercase">Thông tin liên lạc</h5>
                    <div className="bg-light p-3 rounded mb-4 border">
                        {!isLoggedIn && (
                            <div className="bg-white p-2 mb-3 rounded border border-info text-primary d-flex align-items-center gap-2">
                                <i className="bi bi-person-circle fs-5"></i>
                                <span><strong>Đăng nhập</strong> để nhận ưu đãi và quản lý đơn hàng!</span>
                            </div>
                        )}
                        
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small">Họ tên <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Nhập họ tên liên hệ" value={contactInfo.fullName} onChange={e => setContactInfo({ ...contactInfo, fullName: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small">Điện thoại <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="Nhập số điện thoại" value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small">Email <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="email" placeholder="Nhập email" value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold small">Địa chỉ</Form.Label>
                                    <Form.Control type="text" placeholder="Nhập địa chỉ" value={contactInfo.address} onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* 2. SỐ LƯỢNG */}
                    <h5 className="fw-bold mb-3 text-uppercase">Hành khách</h5>
                    <Row className="g-3 mb-4">
                        {[
                            { key: 'adult', label: 'Người lớn', sub: 'Từ 12 tuổi lên', min: 1 },
                            { key: 'child', label: 'Trẻ em', sub: 'Từ 5 - 11 tuổi', min: 0 },
                            { key: 'toddler', label: 'Trẻ nhỏ', sub: 'Từ 2 - 4 tuổi', min: 0 },
                            { key: 'infant', label: 'Em bé', sub: 'Dưới 2 tuổi', min: 0 },
                        ].map((item) => (
                            <Col md={6} key={item.key}>
                                <div className="qty-box bg-white h-100 p-3 border rounded d-flex justify-content-between align-items-center shadow-sm">
                                    <div>
                                        <div className="fw-bold">{item.label}</div>
                                        <div className="small text-muted">{item.sub}</div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <Button variant="outline-secondary" size="sm" onClick={() => handleCountChange(item.key, -1)} disabled={counts[item.key] <= item.min}>-</Button>
                                        <span className="fw-bold fs-5">{counts[item.key]}</span>
                                        <Button variant="outline-primary" size="sm" onClick={() => handleCountChange(item.key, 1)}>+</Button>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    {/* 3. CHI TIẾT KHÁCH */}
                    <h5 className="fw-bold mb-3 text-uppercase">Thông tin hành khách</h5>
                    <div className="bg-white border rounded p-3 mb-4">
                        {passengers.map((p, idx) => (
                            <div key={idx} className={`mb-3 ${idx < passengers.length - 1 ? "border-bottom pb-3" : ""}`}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className="bi bi-person-fill text-muted"></i>
                                    <span className="fw-bold">{p.label} {p.index + 1}</span>
                                </div>
                                <Row className="g-2">
                                    <Col md={4}>
                                        <Form.Control size="sm" placeholder="Họ tên *" required value={p.fullName || ''} onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)} />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Select size="sm" value={p.gender || 'Nam'} onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Control size="sm" type="date" placeholder="Ngày sinh *" value={p.dateOfBirth || ''} onChange={(e) => handlePassengerChange(idx, 'dateOfBirth', e.target.value)} />
                                    </Col>
                                    {/* {p.type === 'adult' && p.index === 0 && (
                                        <Col md={2} className="d-flex align-items-center justify-content-end">
                                            <Form.Check type="switch" id="single-room" label="Phòng đơn" className="small" checked={useSingleRoom} onChange={(e) => setUseSingleRoom(e.target.checked)} />
                                        </Col>
                                    )} */}
                                </Row>
                            </div>
                        ))}
                    </div>

                    {/* 4. GHI CHÚ */}
                    <h5 className="fw-bold mb-3 text-uppercase">Ghi chú</h5>
                    <div className="bg-white border rounded p-3 mb-4">
                        <Form.Control as="textarea" rows={3} placeholder="Nội dung lời nhắn..." value={contactInfo.note} onChange={(e) => setContactInfo({ ...contactInfo, note: e.target.value })} />
                    </div>
                </Col>

                {/* Cột Phải: Tóm tắt */}
                <Col lg={4}>
                    <div className="summary-card bg-white overflow-hidden shadow rounded border">
                        <div className="p-3 border-bottom">
                            <h6 className="fw-bold mb-2">TÓM TẮT CHUYẾN ĐI</h6>
                            <div className="d-flex gap-2">
                                <img src={productData.image} className="rounded" style={{ width: 80, height: 60, objectFit: 'cover' }} alt="Tour" />
                                <div>
                                    <div className="fw-bold small text-truncate-2-lines">{productData.title}</div>
                                    <div className="small text-muted">Mã: {productData.code}</div>
                                </div>
                            </div>
                        </div>

                        {renderTransportInfo()}

                        <div className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold">TẠM TÍNH</span>
                                <span className="fw-bold text-danger fs-5">{formatCurrency(subTotal)}</span>
                            </div>

                            {/* --- [ĐÃ SỬA] HIỂN THỊ ĐỦ CÁC LOẠI KHÁCH --- */}
                            
                            <div className="small mb-1 d-flex justify-content-between">
                                <span>Người lớn</span>
                                <span>{counts.adult} x {formatCurrency(productData.basePrice)}</span>
                            </div>

                            {counts.child > 0 && (
                                <div className="small mb-1 d-flex justify-content-between">
                                    <span>Trẻ em (5-11t)</span>
                                    <span>{counts.child} x {formatCurrency(productData.basePrice * 0.8)}</span>
                                </div>
                            )}

                            {/* 🔥 MỚI THÊM: Trẻ nhỏ */}
                            {counts.toddler > 0 && (
                                <div className="small mb-1 d-flex justify-content-between">
                                    <span>Trẻ nhỏ (2-4t)</span>
                                    <span>{counts.toddler} x {formatCurrency(productData.basePrice * 0.5)}</span>
                                </div>
                            )}

                            {/* 🔥 MỚI THÊM: Em bé */}
                            {counts.infant > 0 && (
                                <div className="small mb-1 d-flex justify-content-between">
                                    <span>Em bé (&lt;2t)</span>
                                    <span>{counts.infant} x {formatCurrency(productData.basePrice * 0.1)}</span>
                                </div>
                            )}

                            {/* {useSingleRoom && (
                                <div className="small mb-1 d-flex justify-content-between">
                                    <span>Phụ thu phòng đơn</span>
                                    <span>{formatCurrency(SINGLE_ROOM_PRICE)}</span>
                                </div>
                            )} */}

                            {/* Mã giảm giá */}
                            <hr className="my-2" />
                            <div className="mt-3 bg-light p-3 rounded border border-dashed">
                                <div className="fw-bold small text-primary mb-2"><i className="bi bi-tag-fill"></i> MÃ GIẢM GIÁ</div>
                                <div className="input-group mb-2">
                                    <Form.Control type="text" placeholder="Nhập mã" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} disabled={!!appliedPromo} size="sm" />
                                    {appliedPromo ? (
                                        <Button variant="outline-danger" size="sm" onClick={() => { setAppliedPromo(null); setPromoCode(""); }}>Xóa</Button>
                                    ) : (
                                        <Button variant="primary" size="sm" onClick={handleApplyPromo}>Áp dụng</Button>
                                    )}
                                </div>
                                {promoError && <div className="text-danger small fst-italic">{promoError}</div>}
                                {appliedPromo && (
                                    <div className="d-flex justify-content-between text-success small fw-bold">
                                        <span><i className="bi bi-check-circle"></i> {appliedPromo.code}</span>
                                        <span>-{formatCurrency(promoDiscount)}</span>
                                    </div>
                                )}
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="fw-bold fs-5">TỔNG CỘNG</span>
                                <span className="fw-bold text-danger fs-4">{formatCurrency(final)}</span>
                            </div>

                            <Button variant="danger" size="lg" className="w-100 fw-bold shadow hover-scale" onClick={handleSubmit}>
                                TIẾP TỤC THANH TOÁN
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}