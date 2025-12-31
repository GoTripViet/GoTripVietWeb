// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import catalogApi from "../api/catalogApi";

// Import component hiển thị thẻ Tour
import BigCard from "../components/home/BigCard";

// Import các hàm tiện ích xử lý format
import { 
    formatCurrency, 
    formatDuration, 
    formatDateWithWeekday,
    mapProductToCard // Hàm map dữ liệu cho BigCard
} from "../utils/formatData";

export default function ProductDetail() {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  // --- STATES ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State cho tour liên quan
  const [relatedTours, setRelatedTours] = useState([]);

  // States cho Form đặt tour
  const [selectedDate, setSelectedDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // --- 1. GỌI API LẤY CHI TIẾT ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Gọi API lấy chi tiết sản phẩm
        const res = await catalogApi.getById(id);
        const data = res.data || res; 
        setProduct(data);
        
        // Mặc định chọn ngày khởi hành đầu tiên (nếu có)
        if (data.tour_details?.departure_times?.length > 0) {
            const sorted = [...data.tour_details.departure_times].sort((a, b) => new Date(a) - new Date(b));
            setSelectedDate(sorted[0]);
        }
        
        // [QUAN TRỌNG] Cuộn lên đầu trang khi load tour mới
        window.scrollTo(0, 0);

      } catch (error) {
        console.error("Lỗi tải tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // --- 2. [MỚI] GỌI API LẤY TOUR LIÊN QUAN (CÙNG DANH MỤC) ---
  useEffect(() => {
    // Chỉ chạy khi đã có thông tin product và product có danh mục
    if (!product || !product.category_ids || product.category_ids.length === 0) return;

    const fetchRelated = async () => {
        try {
            // Lấy ID danh mục đầu tiên
            // Xử lý trường hợp category_ids là object (nếu đã populate) hoặc string
            const firstCat = product.category_ids[0];
            const categoryId = (typeof firstCat === 'object') ? firstCat._id : firstCat;

            // Gọi API lấy tour cùng danh mục
            const res = await catalogApi.getAll({ 
                category_id: categoryId, 
                limit: 5, // Lấy dư 1 chút để trừ tour hiện tại
                product_type: 'tour' 
            });

            const list = res.products || (res.data && res.data.products) || [];
            
            // Lọc bỏ tour đang xem và map dữ liệu sang format của BigCard
            const filtered = list
                .filter(p => p._id !== product._id) // Loại bỏ tour hiện tại
                .slice(0, 4) // Chỉ lấy 4 tour
                .map(p => mapProductToCard(p)); // Map dữ liệu đẹp

            setRelatedTours(filtered);
        } catch (error) {
            console.error("Lỗi tải tour liên quan:", error);
        }
    };

    fetchRelated();
  }, [product]);

  // --- 3. TÍNH TỔNG TIỀN TỰ ĐỘNG ---
  useEffect(() => {
    if (product) {
        const price = product.base_price;
        const total = (adults * price) + (children * price * 0.7);
        setTotalPrice(total);
    }
  }, [adults, children, product]);

  // --- 4. HELPER: RENDER SỐ BỮA ĂN ---
  const renderMeals = (meals) => {
      if (!meals || meals.length === 0) return "Tự túc";
      const count = String(meals.length).padStart(2, '0');
      const text = meals.join(", ").toLowerCase();
      return `${count} (${text})`;
  };

  // --- LOADING STATE ---
  if (loading) return (
      <div className="text-center py-5" style={{minHeight: '60vh'}}>
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải thông tin chi tiết...</p>
      </div>
  );

  // --- NOT FOUND STATE ---
  if (!product) return (
      <div className="text-center py-5">
          <h3>Không tìm thấy tour!</h3>
          <Button variant="primary" onClick={() => navigate('/')}>Về trang chủ</Button>
      </div>
  );

  // Rút gọn biến
  const t = product.tour_details || {};
  
  // Sắp xếp ngày khởi hành
  const sortedDates = t.departure_times 
    ? [...t.departure_times].sort((a, b) => new Date(a) - new Date(b)) 
    : [];

  // Logic chia cột cho phần "Lưu ý"
  const policies = t.policy_notes || [];
  const midIndex = Math.ceil(policies.length / 2);
  const leftPolicies = policies.slice(0, midIndex);
  const rightPolicies = policies.slice(midIndex);

  return (
    <Container className="py-5">
      {/* --- PHẦN 1: HEADER & ẢNH --- */}
      <div className="mb-4">
         <h1 className="fw-bold text-dark mb-2">{product.title}</h1>
         
         <div className="d-flex flex-wrap align-items-center gap-3 text-muted mb-3 small">
             <span><i className="bi bi-star-fill text-warning"></i> 5.0 (Tuyệt vời)</span>
             <span>|</span>
             <span><i className="bi bi-geo-alt-fill text-danger"></i> {product.location_ids?.[0]?.name || "Đang cập nhật"}</span>
             <span>|</span>
             <span className="text-primary fw-bold bg-light px-2 py-1 rounded">
                 MÃ: {product._id.slice(-6).toUpperCase()}
             </span>
         </div>
         
         <div className="rounded-4 overflow-hidden position-relative shadow-sm" style={{height: '450px'}}>
             <img 
                src={product.images?.[0] || "https://placehold.co/1200x600"} 
                alt={product.title} 
                className="w-100 h-100 object-fit-cover hover-zoom"
             />
             <div className="position-absolute bottom-0 end-0 m-3">
                 <Button variant="light" size="sm" className="fw-bold shadow">
                    <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                    Xem tất cả {product.images?.length || 0} ảnh
                 </Button>
             </div>
         </div>
      </div>

      <Row>
        {/* --- CỘT TRÁI: NỘI DUNG CHÍNH --- */}
        <Col lg={8}>
            
            {/* 1. THÔNG TIN TÓM TẮT */}
            <Card className="border-0 shadow-sm mb-5 bg-light bg-opacity-50">
                <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3 py-4">
                     <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-3 rounded-circle text-primary shadow-sm"><i className="bi bi-clock-history fs-4"></i></div>
                        <div><small className="text-muted d-block text-uppercase" style={{fontSize: '11px'}}>Thời gian</small><strong>{formatDuration(t.duration_days)}</strong></div>
                     </div>
                     <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-3 rounded-circle text-success shadow-sm"><i className="bi bi-bus-front-fill fs-4"></i></div>
                        <div><small className="text-muted d-block text-uppercase" style={{fontSize: '11px'}}>Phương tiện</small><strong>{t.transport_type}</strong></div>
                     </div>
                     <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-3 rounded-circle text-warning shadow-sm"><i className="bi bi-building-check fs-4"></i></div>
                        <div><small className="text-muted d-block text-uppercase" style={{fontSize: '11px'}}>Khách sạn</small><strong>{t.hotel_rating} sao</strong></div>
                     </div>
                     <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-3 rounded-circle text-danger shadow-sm"><i className="bi bi-geo-alt fs-4"></i></div>
                        <div><small className="text-muted d-block text-uppercase" style={{fontSize: '11px'}}>Khởi hành</small><strong>{t.start_point}</strong></div>
                     </div>
                </Card.Body>
            </Card>

            {/* 2. LỊCH KHỞI HÀNH */}
            <div className="mb-5" id="schedule-section">
                <h4 className="fw-bold mb-4 text-uppercase border-start border-4 border-primary ps-3">Lịch khởi hành & Giá vé</h4>
                
                {sortedDates.length > 0 ? (
                    <div className="table-responsive shadow-sm rounded-3 border">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-3 ps-4">Ngày khởi hành</th>
                                    <th>Giá tour</th>
                                    <th>Trạng thái</th>
                                    <th className="text-end pe-4">Chọn ngày</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedDates.map((dateStr, index) => (
                                    <tr key={index} className={selectedDate === dateStr ? "table-primary" : ""}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-primary" style={{fontSize: '1.1rem'}}>
                                                {formatDateWithWeekday(dateStr)}
                                            </div>
                                        </td>
                                        <td className="fw-bold text-danger fs-5">
                                            {formatCurrency(product.base_price)}
                                        </td>
                                        <td>
                                            <Badge bg="success" className="fw-normal px-3 py-2 rounded-pill">Đang nhận khách</Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button 
                                                variant={selectedDate === dateStr ? "primary" : "outline-primary"}
                                                size="sm"
                                                className="rounded-pill px-3 fw-bold"
                                                onClick={() => setSelectedDate(dateStr)}
                                            >
                                                {selectedDate === dateStr ? <><i className="bi bi-check2"></i> Đã chọn</> : "Chọn"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="alert alert-warning d-flex align-items-center gap-3">
                        <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                        <div>Hiện chưa có lịch khởi hành cho tour này. Vui lòng liên hệ hotline để được tư vấn!</div>
                    </div>
                )}
            </div>

            {/* 3. LỊCH TRÌNH CHI TIẾT */}
            <div className="mb-5">
                <h4 className="fw-bold mb-4 text-uppercase border-start border-4 border-primary ps-3">Lịch trình chi tiết</h4>
                
                <Accordion defaultActiveKey="0" className="shadow-sm rounded overflow-hidden custom-accordion">
                    {t.itinerary?.map((item, idx) => (
                        <Accordion.Item eventKey={idx.toString()} key={idx} className="border-bottom">
                            <Accordion.Header>
                                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                    <span className="badge bg-primary rounded-pill">Ngày {item.day}</span>
                                    <span>{item.title}</span>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body className="bg-light bg-opacity-10 pt-3 pb-4">
                                <div 
                                    className="mb-4 text-secondary ps-2 border-start border-2 border-light" 
                                    style={{whiteSpace: 'pre-line', lineHeight: '1.7', textAlign: 'justify'}}
                                >
                                    {item.details || "Thông tin lịch trình đang được cập nhật..."}
                                </div>
                                <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-white border shadow-sm">
                                    <i className="bi bi-cup-hot-fill text-warning fs-5"></i> 
                                    <span className="fw-bold text-dark small">Số bữa ăn:</span>
                                    <span className="text-muted small fw-medium">
                                        {renderMeals(item.meals)}
                                    </span>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
                
                {(!t.itinerary || t.itinerary.length === 0) && (
                    <div className="text-center text-muted py-4 bg-light rounded">Đang cập nhật lịch trình...</div>
                )}
            </div>

            {/* 4. THÔNG TIN THÊM VỀ CHUYẾN ĐI (GRID ICON) */}
            {t.trip_highlights && (
                <div className="mb-5">
                    <h4 className="text-center fw-bold mb-4 text-uppercase border-bottom pb-2">THÔNG TIN THÊM VỀ CHUYẾN ĐI</h4>
                    <Row className="g-4">
                        <Col md={4} sm={6}>
                            <div className="h-100 p-3 bg-light bg-opacity-50 rounded-3">
                                <i className="bi bi-map text-primary fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold text-dark">Điểm tham quan</h6>
                                <p className="text-muted small m-0">{t.trip_highlights.attractions || "Đang cập nhật"}</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="h-100 p-3 bg-light bg-opacity-50 rounded-3">
                                <i className="bi bi-cup-straw text-primary fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold text-dark">Ẩm thực</h6>
                                <p className="text-muted small m-0">{t.trip_highlights.cuisine || "Đang cập nhật"}</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="h-100 p-3 bg-light bg-opacity-50 rounded-3">
                                <i className="bi bi-people text-primary fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold text-dark">Đối tượng thích hợp</h6>
                                <p className="text-muted small m-0">{t.trip_highlights.suitable_for || "Mọi lứa tuổi"}</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="h-100 p-3 bg-light bg-opacity-50 rounded-3">
                                <i className="bi bi-clock-history text-primary fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold text-dark">Thời gian lý tưởng</h6>
                                <p className="text-muted small m-0">{t.trip_highlights.ideal_time || "Quanh năm"}</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="h-100 p-3 bg-light bg-opacity-50 rounded-3">
                                <i className="bi bi-car-front text-primary fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold text-dark">Phương tiện</h6>
                                <p className="text-muted small m-0">{t.trip_highlights.transport || t.transport_type}</p>
                            </div>
                        </Col>
                        <Col md={4} sm={6}>
                            <div className="h-100 p-3 bg-light bg-opacity-50 rounded-3">
                                <i className="bi bi-tag text-primary fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold text-dark">Khuyến mãi</h6>
                                <p className="text-muted small m-0">{t.trip_highlights.promotion || "Đã bao gồm trong giá"}</p>
                            </div>
                        </Col>
                    </Row>
                </div>
            )}

            {/* 5. NHỮNG THÔNG TIN CẦN LƯU Ý (Accordion 2 cột) */}
            {policies.length > 0 && (
                <div className="mb-5">
                    <h4 className="text-center fw-bold mb-4 text-uppercase border-bottom pb-2">NHỮNG THÔNG TIN CẦN LƯU Ý</h4>
                    <Row>
                        {/* Cột Trái */}
                        <Col md={6}>
                            <Accordion className="mb-3">
                                {leftPolicies.map((policy, idx) => (
                                    <Accordion.Item eventKey={`L-${idx}`} key={idx} className="mb-2 border rounded overflow-hidden">
                                        <Accordion.Header className="fw-bold small bg-white">
                                            <span className="fw-bold" style={{fontSize: '0.95rem'}}>{policy.title}</span>
                                        </Accordion.Header>
                                        <Accordion.Body className="bg-light small text-secondary">
                                            <div style={{whiteSpace: 'pre-line'}}>{policy.content}</div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Col>
                        {/* Cột Phải */}
                        <Col md={6}>
                            <Accordion>
                                {rightPolicies.map((policy, idx) => (
                                    <Accordion.Item eventKey={`R-${idx}`} key={idx} className="mb-2 border rounded overflow-hidden">
                                        <Accordion.Header className="fw-bold small bg-white">
                                            <span className="fw-bold" style={{fontSize: '0.95rem'}}>{policy.title}</span>
                                        </Accordion.Header>
                                        <Accordion.Body className="bg-light small text-secondary">
                                            <div style={{whiteSpace: 'pre-line'}}>{policy.content}</div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Col>
                    </Row>
                </div>
            )}

        </Col>

        {/* --- CỘT PHẢI: FORM ĐẶT TOUR (STICKY) --- */}
        <Col lg={4}>
            <div className="sticky-top" style={{top: '20px', zIndex: 10}}>
                <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="bg-primary text-white p-3 text-center bg-gradient">
                        <h5 className="m-0 fw-bold text-uppercase">Đặt ngay tour này</h5>
                    </div>
                    <Card.Body className="p-4">
                        {/* 1. Chọn ngày */}
                        <div className="mb-3">
                            <label className="fw-bold small mb-2 text-muted">NGÀY KHỞI HÀNH</label>
                            <Form.Select 
                                value={selectedDate} 
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="fw-bold text-primary form-select-lg border-primary bg-light"
                            >
                                <option value="" disabled>-- Chọn ngày --</option>
                                {sortedDates.map((d, i) => (
                                    <option key={i} value={d}>
                                        {formatDateWithWeekday(d)}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        
                        {/* 2. Chọn số người */}
                        <Row className="mb-4">
                            <Col xs={6}>
                                <label className="small fw-bold mb-1 text-muted">NGƯỜI LỚN</label>
                                <div className="input-group">
                                    <Form.Control 
                                        type="number" min="1" value={adults} 
                                        onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 0))} 
                                        className="text-center fw-bold"
                                    />
                                </div>
                                <div className="text-end mt-1 text-danger small fw-bold">
                                    x {formatCurrency(product.base_price)}
                                </div>
                            </Col>
                            <Col xs={6}>
                                <label className="small fw-bold mb-1 text-muted">TRẺ EM</label>
                                <div className="input-group">
                                    <Form.Control 
                                        type="number" min="0" value={children} 
                                        onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))} 
                                        className="text-center fw-bold"
                                    />
                                </div>
                                <div className="text-end mt-1 text-danger small fw-bold">
                                    x {formatCurrency(product.base_price * 0.7)}
                                </div>
                            </Col>
                        </Row>

                        <div className="border-top border-bottom py-3 mb-4 bg-light px-2 rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold text-secondary">Tổng cộng:</span>
                                <span className="fs-2 fw-bold text-danger lh-1">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>

                        {/* 3. Nút đặt */}
                        <Button 
                            variant="danger" 
                            size="lg" 
                            className="w-100 fw-bold py-3 text-uppercase shadow hover-scale"
                            onClick={() => {
                                if(!selectedDate) alert("Vui lòng chọn ngày khởi hành!");
                                else alert(`Đặt tour thành công!\n- Ngày: ${formatDateWithWeekday(selectedDate)}\n- Khách: ${adults} lớn, ${children} trẻ em\n- Tổng tiền: ${formatCurrency(totalPrice)}`);
                            }}
                        >
                            Yêu cầu đặt tour
                        </Button>
                        
                        <div className="text-center mt-3 small text-muted fst-italic">
                            * Giá đã bao gồm thuế & phí phục vụ
                        </div>
                        
                        <div className="mt-4 pt-3 border-top text-center">
                            <div className="d-flex justify-content-center gap-3">
                                <Button variant="outline-primary" size="sm" className="rounded-circle p-2" style={{width: 40, height: 40}}><i className="bi bi-telephone-fill"></i></Button>
                                <Button variant="outline-success" size="sm" className="rounded-circle p-2" style={{width: 40, height: 40}}><i className="bi bi-whatsapp"></i></Button>
                                <Button variant="outline-info" size="sm" className="rounded-circle p-2" style={{width: 40, height: 40}}><i className="bi bi-messenger"></i></Button>
                            </div>
                            <div className="mt-2 small fw-bold text-primary">Hotline hỗ trợ 24/7: 1900 1234</div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Col>
      </Row>

      {/* 🔥 [MỚI] PHẦN 6: CÁC CHƯƠNG TRÌNH KHÁC (TOUR LIÊN QUAN) 🔥 */}
      {relatedTours.length > 0 && (
          <div className="mt-5 pt-5 border-top">
              <h3 className="fw-bold mb-4 text-dark border-start border-4 border-warning ps-3">CÁC CHƯƠNG TRÌNH KHÁC</h3>
              <Row>
                  {relatedTours.map((item) => (
                      <Col key={item.id} xs={12} md={6} lg={3} className="mb-4">
                          {/* Tái sử dụng BigCard để hiển thị tour gợi ý */}
                          <BigCard 
                              {...item} 
                              onClick={() => navigate(`/product/${item.id}`)} 
                          />
                      </Col>
                  ))}
              </Row>
          </div>
      )}

    </Container>
  );
}