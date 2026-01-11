import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import categoryApi from "../../api/categoryApi"; 

export default function CategoryRequestModal({ show, onHide, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await categoryApi.requestNew({ name });
      const newCat = res.data || res;
      onSuccess(newCat);
      setName("");
      onHide();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi gửi yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Đề xuất Danh mục mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="text-muted small">
          Danh mục mới (VD: Camping, Glamping...) sẽ ở trạng thái <b className="text-warning">Chờ duyệt</b>.
        </p>
        <Form.Group>
          <Form.Label className="fw-bold">Tên Danh mục</Form.Label>
          <Form.Control 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Du lịch tâm linh, Hiking..." 
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Hủy</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading || !name.trim()}>
          {loading ? "Đang gửi..." : "Gửi đề xuất"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}