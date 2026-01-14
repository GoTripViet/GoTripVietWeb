import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import catalogApi from "../../api/catalogApi"; 
import "../../styles/admin/ManageTours.css"; 

// --- HELPERS (Giữ nguyên) ---
function pickFirstImage(images) {
  if (!images) return "https://via.placeholder.com/80?text=No+Img";
  if (typeof images === "string") return images.split(",")[0]?.trim() || "";
  if (Array.isArray(images)) {
    const first = images[0];
    if (!first) return "https://via.placeholder.com/80?text=No+Img";
    return typeof first === "string" ? first : (first.url || "");
  }
  return "";
}

function normalizeListResponse(res) {
  const a = res?.data ?? res;
  const b = a?.data ?? a;
  if (Array.isArray(b)) return b;
  if (Array.isArray(b?.items)) return b.items;
  return [];
}

export default function PartnerManageTours() {
  const nav = useNavigate();

  // State
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Load Data
  const loadMyTours = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await catalogApi.getPartnerTours({ limit: 100 }); 
      setItems(normalizeListResponse(res));
    } catch (e) {
      console.error(e);
      setErr("Không thể tải danh sách tour của bạn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTours();
  }, []);

  // Filter Logic
  const filtered = useMemo(() => {
    let result = items;
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      result = result.filter(x => !!x.is_active === isActive);
    }
    const keyword = q.trim().toLowerCase();
    if (keyword) {
      result = result.filter((x) => {
        const hay = [x.product_code, x.title].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(keyword);
      });
    }
    return result;
  }, [items, q, filterStatus]);

  // Actions
  const createTour = () => nav("/partner/tours/create");
  const openDetail = (id) => nav(`/partner/tours/${id}`);

  // 👇 [UPDATE] Nút này sẽ dẫn sang trang PartnerInventory.jsx bạn vừa tạo
  const openInventory = (id) => nav(`/partner/tours/${id}/inventory`);

  const deleteTour = async (id, title) => {
    if (!window.confirm(`Bạn muốn gỡ bỏ tour: "${title}"?`)) return;
    try {
      await catalogApi.remove(id);
      loadMyTours();
    } catch (e) {
      alert("Xóa thất bại: " + e.message);
    }
  };

  return (
    <div className="mt-container">
      {/* HEADER */}
      <div className="mt-header">
        <div className="mt-title-group">
          <h1>Tour Của Tôi</h1>
          <p>Quản lý các tour du lịch mà doanh nghiệp bạn đang cung cấp.</p>
        </div>
        <button className="mt-btn-create" onClick={createTour}>
          <span>+</span> Đăng Tour Mới
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="mt-toolbar">
        <div className="mt-search-box">
          <span className="mt-search-icon">🔍</span>
          <input
            className="mt-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên tour, mã tour..."
          />
        </div>

        <select className="mt-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang mở bán</option>
          <option value="inactive">Đang đóng</option>
        </select>

        <button className="mt-btn-icon" onClick={loadMyTours} title="Tải lại">↻</button>
      </div>

      {/* TABLE */}
      {err && <div className="error-box">{err}</div>}
      
      <div className="mt-table-wrapper">
        <table className="mt-table">
          <thead>
            <tr>
              <th style={{width: '45%'}}>Tour</th>
              <th>Giá niêm yết</th>
              <th>Trạng thái</th>
              <th style={{textAlign: 'right'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="4" className="text-center">Đang tải...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan="4" className="mt-empty">Bạn chưa đăng tour nào.</td></tr>}

            {filtered.map((tour) => {
              const id = tour._id || tour.id;
              const img = pickFirstImage(tour.images);
              const isActive = !!tour.is_active;
              const price = Number(tour.base_price || 0).toLocaleString('vi-VN');

              return (
                <tr key={id}>
                  <td>
                    <div className="mt-tour-info">
                      <img src={img} alt="thumb" className="mt-thumb" />
                      <div>
                        <span className="mt-tour-name">{tour.title}</span>
                        <div style={{fontSize: 12, color: '#666'}}>
                            Mã: {tour.product_code} • {tour.tour_details?.duration_days} ngày
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span className="mt-price">{price} ₫</span></td>
                  <td>
                    <span className={`mt-badge ${isActive ? 'mt-badge-active' : 'mt-badge-inactive'}`}>
                      {isActive ? 'Đang bán' : 'Tạm ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="mt-actions">
                      {/* 👇 Nút dẫn sang trang Inventory */}
                      <button 
                        className="mt-btn-action" 
                        onClick={() => openInventory(id)} 
                        style={{color: '#0b5fff', background: '#eff6ff', border: '1px solid #bfdbfe'}}
                        title="Quản lý lịch khởi hành & Số chỗ"
                      >
                        📦 Lịch & Chỗ
                      </button>
                      <button className="mt-btn-action" onClick={() => openDetail(id)}>Sửa</button>
                      <button className="mt-btn-action mt-btn-danger" onClick={() => deleteTour(id, tour.title)}>Gỡ</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}