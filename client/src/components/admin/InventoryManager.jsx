import React, { useEffect, useState } from "react";
import inventoryApi from "../../api/inventoryApi";

export default function InventoryManager({ tourId, basePrice }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- FORM STATE ---
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState(20);
  const [price, setPrice] = useState(basePrice || 0); // Backend yêu cầu Price
  const [departTime, setDepartTime] = useState("08:00"); // Giờ đi
  
  const [adding, setAdding] = useState(false);

  // --- LOAD DATA ---
  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getByProductId(tourId);
      // Backend trả về mảng trực tiếp hoặc { data: [...] }
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      
      // Sắp xếp ngày tăng dần
      list.sort((a, b) => {
        const dateA = a.tour_details?.date ? new Date(a.tour_details.date) : new Date();
        const dateB = b.tour_details?.date ? new Date(b.tour_details.date) : new Date();
        return dateA - dateB;
      });
      
      setItems(list);
    } catch (e) {
      console.error("Lỗi load inventory:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tourId) {
      loadInventory();
      // Reset giá về giá gốc của tour khi load
      if(basePrice) setPrice(basePrice);
    }
  }, [tourId, basePrice]);

  // --- SUBMIT HANDLE ---
  const handleAdd = async () => {
    // Validate cơ bản
    if (!date) return alert("Vui lòng chọn ngày khởi hành!");
    if (slots <= 0) return alert("Số chỗ phải > 0");
    if (price < 0) return alert("Giá không hợp lệ");

    setAdding(true);
    try {
      // [QUAN TRỌNG] Cấu trúc Payload khớp với Inventory Service
      const payload = {
        product_id: tourId,
        product_type: 'tour',
        price: Number(price), // Backend Model yêu cầu field này ở root
        is_active: true,
        
        // Chi tiết Tour nằm trong object tour_details
        tour_details: {
          date: date, // YYYY-MM-DD
          total_slots: Number(slots),
          transport_schedule: {
            departure_time: departTime // Giờ đi
          }
        }
      };

      await inventoryApi.create(payload);
      
      alert("Thêm lịch thành công!");
      // Reset form nhưng giữ lại giá & giờ cho tiện nhập tiếp
      setDate(""); 
      loadInventory(); 
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || e.message;
      alert("Lỗi thêm lịch: " + msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa ngày này?")) return;
    try {
      await inventoryApi.remove(id);
      loadInventory();
    } catch (e) {
      alert("Không thể xóa (có thể đã có đơn đặt).");
    }
  };

  // --- STYLES ---
  const s = {
    card: { marginTop: 20, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" },
    head: { padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: "800", color: "#111827", fontSize: 15 },
    body: { padding: 20 },
    
    // Form Styles
    formRow: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", paddingBottom: 20, borderBottom: "1px solid #f3f4f6", marginBottom: 20 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 12, fontWeight: 700, color: "#4b5563" },
    input: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, outline: "none", fontSize: 14, minWidth: 100 },
    btn: { padding: "9px 16px", background: "#0b5fff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "700", fontSize: 14, height: 38 },
    
    // List Styles
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 },
    item: (full) => ({
      border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, position: "relative",
      background: full ? "#fef2f2" : "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
    }),
    date: { fontWeight: "800", fontSize: 14, color: "#111827", marginBottom: 4 },
    info: { fontSize: 12, color: "#6b7280", marginBottom: 2 },
    status: (full) => ({ fontSize: 12, fontWeight: "700", color: full ? "#dc2626" : "#059669", marginTop: 6 }),
    price: { fontWeight: "700", color: "#0b5fff" },
    delBtn: { position: "absolute", top: 8, right: 8, cursor: "pointer", color: "#9ca3af", fontSize: 16, lineHeight: 0.5 }
  };

  return (
    <div style={s.card}>
      <div style={s.head}>📅 Quản lý Lịch Khởi Hành & Tồn Kho</div>
      
      <div style={s.body}>
        {/* Form thêm mới */}
        <div style={s.formRow}>
          <div style={s.field}>
            <label style={s.label}>Ngày khởi hành <span style={{color:'red'}}>*</span></label>
            <input type="date" style={s.input} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          
          <div style={s.field}>
            <label style={s.label}>Giá vé ngày này</label>
            <input type="number" style={{...s.input, width: 120}} value={price} onChange={e => setPrice(e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Số chỗ mở bán</label>
            <input type="number" style={{...s.input, width: 80}} value={slots} onChange={e => setSlots(e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Giờ đi</label>
            <input type="time" style={s.input} value={departTime} onChange={e => setDepartTime(e.target.value)} />
          </div>

          <button style={s.btn} onClick={handleAdd} disabled={adding}>
            {adding ? "Đang xử lý..." : "+ Thêm Lịch"}
          </button>
        </div>

        {/* Danh sách Inventory */}
        {loading && <div style={{color:'#6b7280', fontSize: 13}}>Đang tải dữ liệu...</div>}
        {!loading && items.length === 0 && <div style={{color:'#9ca3af', fontSize: 13, fontStyle:'italic'}}>Chưa có lịch nào được tạo.</div>}

        <div style={s.grid}>
          {items.map(item => {
            // Mapping dữ liệu từ Backend
            const details = item.tour_details || {};
            const total = details.total_slots || 0;
            const booked = details.booked_slots || 0;
            const avail = total - booked;
            const isFull = avail <= 0;
            const itemPrice = item.price || 0;
            const time = details.transport_schedule?.departure_time || "—";

            return (
              <div key={item._id} style={s.item(isFull)}>
                <div style={s.date}>
                  {details.date ? new Date(details.date).toLocaleDateString('vi-VN') : "Lỗi ngày"}
                </div>
                
                <div style={s.info}>Giờ đi: <b>{time}</b></div>
                <div style={s.info}>Giá: <span style={s.price}>{itemPrice.toLocaleString()}₫</span></div>
                
                <div style={{marginTop: 6, borderTop:'1px dashed #e5e7eb', paddingTop: 6}}>
                   <div style={s.info}>Tổng chỗ: <b>{total}</b></div>
                   <div style={s.info}>Đã đặt: <b>{booked}</b></div>
                </div>

                <div style={s.status(isFull)}>
                  {isFull ? "HẾT CHỖ" : `✅ Còn ${avail} chỗ`}
                </div>

                {/* Chỉ cho xóa nếu chưa có ai đặt */}
                {booked === 0 && (
                  <div 
                    style={s.delBtn} 
                    onClick={() => handleRemove(item._id)}
                    title="Xóa lịch này"
                  >
                    &times;
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}