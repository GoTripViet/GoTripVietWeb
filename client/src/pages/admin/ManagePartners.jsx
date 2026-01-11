import React, { useEffect, useState, useMemo } from "react";
import userApi from "../../api/userApi";
import { Badge, Button, Card, Table, Spinner, Form, InputGroup } from "react-bootstrap";

export default function ManagePartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // ID đang xử lý
  const [searchTerm, setSearchTerm] = useState(""); // [MỚI] State tìm kiếm

  // --- 1. TẢI DỮ LIỆU ---
  const loadPartners = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách user
      const res = await userApi.getAllPartners({ limit: 1000 }); // Lấy nhiều để client filter
      const list = res.users || res.data || [];
      
      // Lọc lấy role 'partner'
      const partnerList = list.filter(u => u.roles?.includes('partner'));
      setPartners(partnerList);
    } catch (error) {
      console.error("Lỗi tải partner:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // --- 2. XỬ LÝ DUYỆT ---
  const handleApprove = async (id) => {
    if (!window.confirm("Xác nhận duyệt quyền đăng bài cho đối tác này?")) return;
    
    setProcessing(id);
    try {
      await userApi.approvePartner(id);
      // alert("Đã duyệt thành công!"); // Có thể bỏ alert nếu muốn UX mượt hơn
      await loadPartners(); // Reload lại danh sách để cập nhật trạng thái
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(null);
    }
  };

  // --- 3. LOGIC LỌC & SẮP XẾP (MEMO) ---
  const filteredPartners = useMemo(() => {
    let result = [...partners];

    // a. Lọc theo từ khóa
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => {
        const company = p.partner_details?.company_name?.toLowerCase() || "";
        const email = p.email?.toLowerCase() || "";
        const name = p.fullName?.toLowerCase() || "";
        return company.includes(lowerTerm) || email.includes(lowerTerm) || name.includes(lowerTerm);
      });
    }

    // b. Sắp xếp: Chưa duyệt lên đầu, Đã duyệt xuống dưới
    result.sort((a, b) => {
      const aApproved = a.partner_details?.is_approved ? 1 : 0;
      const bApproved = b.partner_details?.is_approved ? 1 : 0;
      // 0 (chưa duyệt) - 1 (đã duyệt) => âm => lên đầu
      if (aApproved !== bApproved) return aApproved - bApproved;
      
      // Nếu cùng trạng thái, cái nào mới đăng ký lên đầu
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [partners, searchTerm]);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Quản lý Đối tác (Partner)</h2>
        <Button variant="outline-primary" size="sm" onClick={loadPartners}>
          <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
        </Button>
      </div>

      {/* --- THANH TÌM KIẾM --- */}
      <Card className="shadow-sm border-0 rounded-4 mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control 
              placeholder="Tìm kiếm theo tên công ty, email, người đại diện..." 
              className="border-start-0 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>
      
      {/* --- BẢNG DANH SÁCH --- */}
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="py-3 ps-4">Công ty / Thương hiệu</th>
                <th>Người đại diện</th>
                <th>Liên hệ</th>
                <th>Trạng thái</th>
                <th>Ngày đăng ký</th>
                <th className="text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2 small">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox display-4 d-block mb-2 opacity-50"></i>
                    Không tìm thấy đối tác nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => {
                  const details = p.partner_details || {};
                  const isApproved = details.is_approved;

                  return (
                    <tr key={p._id || p.id} className={!isApproved ? "bg-warning bg-opacity-10" : ""}>
                      <td className="ps-4">
                        <div className="fw-bold text-primary">{details.company_name || "Chưa cập nhật"}</div>
                        <div className="small text-muted">
                          <i className="bi bi-card-heading me-1"></i> MST: {details.business_license || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{p.fullName}</div>
                        <div className="small text-muted">ID: {(p._id || p.id).slice(-6).toUpperCase()}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column small">
                          <span><i className="bi bi-envelope me-1"></i> {p.email}</span>
                          <span className="text-muted"><i className="bi bi-telephone me-1"></i> {details.contact_phone || p.phone}</span>
                        </div>
                      </td>
                      <td>
                        {isApproved ? (
                          <Badge bg="success" pill className="px-3 py-2">
                            <i className="bi bi-check-circle-fill me-1"></i> Đã duyệt
                          </Badge>
                        ) : (
                          <Badge bg="warning" text="dark" pill className="px-3 py-2">
                            <i className="bi bi-hourglass-split me-1"></i> Chờ duyệt
                          </Badge>
                        )}
                      </td>
                      <td className="text-muted small">
                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="text-end pe-4">
                        {!isApproved ? (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-pill px-4 fw-bold shadow-sm"
                            onClick={() => handleApprove(p._id || p.id)}
                            disabled={processing === (p._id || p.id)}
                          >
                            {processing === (p._id || p.id) ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              <>
                                <i className="bi bi-check-lg me-1"></i> Duyệt
                              </>
                            )}
                          </Button>
                        ) : (
                           <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 opacity-75" disabled>
                             Đã kích hoạt
                           </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}