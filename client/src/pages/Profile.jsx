// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import authApi from "../api/authApi";

export default function Profile() {
  const [user, setUser] = useState(null); // Dữ liệu gốc từ API
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "" // Email thường chỉ để xem, không sửa
  });
  
  const [loading, setLoading] = useState(true); // Loading khi mới vào trang
  const [updating, setUpdating] = useState(false); // Loading khi bấm Lưu
  const [message, setMessage] = useState({ type: "", content: "" }); // Thông báo xanh/đỏ

  // 1. Lấy thông tin user khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await authApi.getProfile();
        setUser(userData);
        setFormData({
          fullName: userData.fullName || "",
          phone: userData.phone || "",
          email: userData.email || ""
        });
      } catch (error) {
        setMessage({ type: "danger", content: "Không thể tải thông tin hồ sơ." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Xử lý khi nhập liệu
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Xử lý khi bấm Lưu thay đổi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", content: "" });

    try {
      // Gọi API cập nhật
      const updatedUser = await authApi.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone
      });

      // Cập nhật lại state và localStorage để Header hiển thị tên mới ngay lập tức
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setMessage({ type: "success", content: "Cập nhật hồ sơ thành công!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "danger", content: error.response?.data?.message || "Có lỗi xảy ra khi cập nhật." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Đang tải thông tin...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="fw-bold mb-4">Hồ sơ cá nhân</h2>

      {message.content && (
        <Alert variant={message.type} onClose={() => setMessage({ type: "", content: "" })} dismissible>
          {message.content}
        </Alert>
      )}

      <Row className="g-4">
        {/* CỘT TRÁI: AVATAR & TÓM TẮT */}
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body className="py-5">
              <div 
                className="mx-auto bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: 100, height: 100, fontSize: "2.5rem" }}
              >
                {/* Lấy chữ cái đầu của tên */}
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <h5 className="fw-bold">{formData.fullName || "Người dùng"}</h5>
              <p className="text-muted small mb-1">{formData.email}</p>
              <div className="mt-3">
                 <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                    Tài khoản khách hàng
                 </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        <Col md={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">Thông tin chi tiết</h5>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">Địa chỉ Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={formData.email} 
                    disabled 
                    className="bg-light"
                  />
                  <Form.Text className="text-muted small">
                    Email không thể thay đổi.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">Họ và tên</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="fullName"
                    value={formData.fullName} 
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ tên của bạn"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small text-muted">Số điện thoại</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="phone"
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={updating}
                    className="px-4 fw-semibold"
                  >
                    {updating ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}