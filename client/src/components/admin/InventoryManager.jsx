import React, { useEffect, useState } from "react";
import inventoryApi from "../../api/inventoryApi";
import "../../styles/admin/InventoryManager.css" // [QUAN TRỌNG] Import file CSS

export default function InventoryManager({ tourId, basePrice }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);

  // --- STATE FORM ---
  const [form, setForm] = useState({
    date: "",
    price: basePrice || 0,
    slots: 20,
    // Transport Schedule
    departure_time: "08:00",
    arrival_time: "",
    return_time: "",
    return_arrival_time: "",
    airline: "",
    depart_code: "",
    return_code: "",
    pickup_location: ""
  });

  // --- LOAD DATA ---
  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getByProductId(tourId);
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      list.sort((a, b) => new Date(a.tour_details?.date) - new Date(b.tour_details?.date));
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tourId) {
      loadInventory();
      if (basePrice) setForm(prev => ({ ...prev, price: basePrice }));
    }
  }, [tourId, basePrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // --- SUBMIT ---
  const handleAdd = async () => {
    if (!form.date) return alert("Vui lòng chọn ngày khởi hành!");
    if (form.slots <= 0) return alert("Số chỗ phải > 0");

    setAdding(true);
    try {
      const payload = {
        product_id: tourId,
        product_type: 'tour',
        price: Number(form.price),
        is_active: true,
        tour_details: {
          date: form.date,
          total_slots: Number(form.slots),
          transport_schedule: {
            departure_time: form.departure_time,
            arrival_time: form.arrival_time,
            return_time: form.return_time,
            return_arrival_time: form.return_arrival_time,
            airline: form.airline,
            depart_code: form.depart_code,
            return_code: form.return_code,
            pickup_location: form.pickup_location
          }
        }
      };

      await inventoryApi.create(payload);
      alert("Thêm lịch thành công!");
      setShowModal(false);
      loadInventory();
      // Reset ngày, giữ lại giờ & giá
      setForm(prev => ({ ...prev, date: "" })); 
    } catch (e) {
      alert("Lỗi: " + (e.response?.data?.message || e.message));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Xóa lịch này?")) return;
    try {
      await inventoryApi.remove(id);
      loadInventory();
    } catch (e) {
      alert("Không thể xóa (có thể đã có đơn đặt).");
    }
  };

  return (
    <div className="im-container">
      <div className="im-header">
        <span className="im-title">📅 Lịch Khởi Hành & Tồn Kho</span>
        <button className="im-add-btn" onClick={() => setShowModal(true)}>+ Thêm Lịch Mới</button>
      </div>

      <div className="im-grid">
        {loading && <div className="im-loading">Đang tải...</div>}
        {!loading && items.length === 0 && <div className="im-empty">Chưa có lịch nào được tạo.</div>}
        
        {items.map(item => {
          const td = item.tour_details || {};
          const ts = td.transport_schedule || {};
          const avail = (td.total_slots || 0) - (td.booked_slots || 0);
          const isFull = avail <= 0;

          return (
            <div key={item._id} className={`im-item ${isFull ? 'full' : ''}`}>
              <div className="im-date">
                {new Date(td.date).toLocaleDateString('vi-VN')}
              </div>
              
              <div className="im-row">
                <span className="im-label">Giá vé:</span> 
                <span className="im-val">{item.price?.toLocaleString()}₫</span>
              </div>
              <div className="im-row">
                <span className="im-label">Tổng chỗ:</span> 
                <span className="im-val">{td.total_slots}</span>
              </div>
              <div className="im-row">
                <span className="im-label">Đã đặt:</span> 
                <span className="im-val">{td.booked_slots}</span>
              </div>
              
              {/* Thông tin vận chuyển */}
              <div className="im-transport-info">
                <div>🛫 Đi: {ts.departure_time} {ts.depart_code ? `(${ts.depart_code})` : ''}</div>
                {(ts.return_time || ts.return_code) && (
                  <div>🛬 Về: {ts.return_time || '---'} {ts.return_code ? `(${ts.return_code})` : ''}</div>
                )}
                {ts.airline && <div>✈️ {ts.airline}</div>}
                {ts.pickup_location && <div>📍 Đón: {ts.pickup_location}</div>}
              </div>

              <div className={`im-status ${isFull ? 'full' : ''}`}>
                {isFull ? "HẾT CHỖ" : `✅ Còn ${avail} chỗ`}
              </div>

              {td.booked_slots === 0 && (
                <div className="im-del-btn" onClick={() => handleRemove(item._id)} title="Xóa lịch">
                  ✕
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="im-overlay">
          <div className="im-modal">
            <div className="im-modal-title">Thêm Lịch Khởi Hành Mới</div>
            
            <div className="im-section-header">1. Thông tin cơ bản</div>
            <div className="im-grid-2">
              <div className="im-field">
                <label>Ngày khởi hành <span style={{color:'red'}}>*</span></label>
                <input type="date" className="im-input" name="date" value={form.date} onChange={handleChange} />
              </div>
              <div className="im-field">
                <label>Giá vé (VND) <span style={{color:'red'}}>*</span></label>
                <input type="number" className="im-input" name="price" value={form.price} onChange={handleChange} />
              </div>
              <div className="im-field">
                <label>Số chỗ mở bán</label>
                <input type="number" className="im-input" name="slots" value={form.slots} onChange={handleChange} />
              </div>
              <div className="im-field">
                 <label>Điểm đón (Xe/Tàu)</label>
                 <input className="im-input" name="pickup_location" value={form.pickup_location} onChange={handleChange} placeholder="VD: Nhà hát lớn" />
              </div>
            </div>

            <div className="im-section-header">2. Chi tiết chuyến đi</div>
            <div className="im-grid-2">
              <div className="im-field">
                <label>Giờ đi (Departure)</label>
                <input type="time" className="im-input" name="departure_time" value={form.departure_time} onChange={handleChange} />
              </div>
              <div className="im-field">
                <label>Giờ đến (Arrival)</label>
                <input type="time" className="im-input" name="arrival_time" value={form.arrival_time} onChange={handleChange} />
              </div>
              <div className="im-field">
                <label>Hãng bay (Nếu có)</label>
                <input className="im-input" name="airline" value={form.airline} onChange={handleChange} placeholder="VD: Vietnam Airlines" />
              </div>
              <div className="im-field">
                <label>Mã chuyến bay đi</label>
                <input className="im-input" name="depart_code" value={form.depart_code} onChange={handleChange} placeholder="VD: VN123" />
              </div>
            </div>

            <div className="im-section-header">3. Chi tiết chuyến về (Nếu có)</div>
            <div className="im-grid-2">
               <div className="im-field">
                <label>Giờ về (Return)</label>
                <input type="time" className="im-input" name="return_time" value={form.return_time} onChange={handleChange} />
              </div>
              <div className="im-field">
                <label>Giờ về đến nơi</label>
                <input type="time" className="im-input" name="return_arrival_time" value={form.return_arrival_time} onChange={handleChange} />
              </div>
              <div className="im-field">
                <label>Mã chuyến bay về</label>
                <input className="im-input" name="return_code" value={form.return_code} onChange={handleChange} placeholder="VD: VN124" />
              </div>
            </div>

            <div className="im-footer">
              <button className="im-btn im-btn-secondary" onClick={() => setShowModal(false)}>Hủy bỏ</button>
              <button className="im-btn im-btn-primary" onClick={handleAdd} disabled={adding}>
                {adding ? "Đang tạo..." : "Xác nhận thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}