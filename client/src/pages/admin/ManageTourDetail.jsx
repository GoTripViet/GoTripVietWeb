import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import catalogApi from "../../api/catalogApi";
import locationApi from "../../api/locationApi";
import categoryApi from "../../api/categoryApi";
import "../../styles/admin/CreateTour.css" // [QUAN TRỌNG] Import file CSS


export default function ManageTourDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // State form (Khởi tạo null để check loading ban đầu)
  const [form, setForm] = useState(null);

  // --- LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tourRes, locRes, catRes] = await Promise.all([
          catalogApi.getById(id),
          locationApi.getAll(),
          categoryApi.getAll()
        ]);

        // 1. Normalize Tour Data
        const t = tourRes.data?.product || tourRes.data || tourRes;
        
        // 2. Map dữ liệu từ API vào State Form (Flatten các object lồng nhau để dễ bind vào input)
        setForm({
          _id: t._id || t.id,
          title: t.title || "",
          product_code: t.product_code || "",
          base_price: t.base_price || 0,
          sustainability_score: t.sustainability_score || 0,
          is_active: !!t.is_active,
          
          description_short: t.description_short || "",
          description_long: t.description_long || "",
          images: t.images || [], // {url, public_id}
          tags: (t.tags || []).join(", "), // Chuyển mảng thành chuỗi để hiển thị
          
          location_ids: t.location_ids?.map(l => l._id || l.id || l) || [],
          category_ids: t.category_ids?.map(c => c._id || c.id || c) || [],

          // Tour Details
          duration_days: t.tour_details?.duration_days || 1,
          start_point: t.tour_details?.start_point || "",
          transport_type: t.tour_details?.transport_type || "Xe du lịch",
          hotel_rating: t.tour_details?.hotel_rating || 0,
          hotel_name: t.tour_details?.hotel_name || "",
          
          itinerary: t.tour_details?.itinerary || [],
          policies: t.tour_details?.policy_notes || [],
          
          // Trip Highlights
          highlight_attractions: t.tour_details?.trip_highlights?.attractions || "",
          highlight_cuisine: t.tour_details?.trip_highlights?.cuisine || "",
          highlight_suitable: t.tour_details?.trip_highlights?.suitable_for || "",
          highlight_ideal_time: t.tour_details?.trip_highlights?.ideal_time || "",
        });

        // 3. Normalize Select Options
        const locData = locRes.data || locRes;
        const catData = catRes.data || catRes;
        setLocations(Array.isArray(locData) ? locData : (locData.data || []));
        setCategories(Array.isArray(catData) ? catData : (catData.data || []));

      } catch (err) {
        console.error(err);
        alert("Không tải được thông tin tour. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleMultiSelect = (e, field) => {
    const opts = Array.from(e.target.selectedOptions, o => o.value);
    setForm(prev => ({ ...prev, [field]: opts }));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setSaving(true); // Tạm dùng biến saving để hiện loading
    try {
      const uploads = await Promise.all(files.map(f => {
        const fd = new FormData(); fd.append("file", f);
        return catalogApi.uploadTourImage(fd);
      }));
      const newImgs = uploads.map(r => ({ url: r.url || r.data.url, public_id: r.public_id || r.data.public_id }));
      setForm(prev => ({ ...prev, images: [...prev.images, ...newImgs] }));
    } catch (e) { alert("Lỗi upload: " + e.message); } 
    finally { setSaving(false); }
  };

  // Itinerary Logic
  const addItineraryDay = () => {
    setForm(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: "", details: "", meals: [], accommodation: "" }]
    }));
  };
  const updateItinerary = (idx, f, v) => {
    const next = [...form.itinerary]; next[idx][f] = v;
    setForm(p => ({...p, itinerary: next}));
  };

  // Policy Logic
  const addPolicy = () => {
    setForm(prev => ({ ...prev, policies: [...prev.policies, { title: "", content: "" }] }));
  };
  const updatePolicy = (idx, f, v) => {
    const next = [...form.policies]; next[idx][f] = v;
    setForm(p => ({...p, policies: next}));
  };

  // --- SAVE ---
  const handleSave = async () => {
    if (!form.title.trim()) return alert("Tên tour không được để trống");
    
    setSaving(true);
    try {
      // Convert lại payload đúng chuẩn Model
      const payload = {
        title: form.title,
        product_code: form.product_code,
        base_price: Number(form.base_price),
        sustainability_score: Number(form.sustainability_score),
        is_active: form.is_active,
        
        description_short: form.description_short,
        description_long: form.description_long,
        images: form.images,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        
        location_ids: form.location_ids,
        category_ids: form.category_ids,
        
        tour_details: {
          start_point: form.start_point,
          duration_days: Number(form.duration_days),
          transport_type: form.transport_type,
          hotel_rating: Number(form.hotel_rating),
          hotel_name: form.hotel_name,
          
          itinerary: form.itinerary,
          policy_notes: form.policies,
          
          trip_highlights: {
            attractions: form.highlight_attractions,
            cuisine: form.highlight_cuisine,
            suitable_for: form.highlight_suitable,
            ideal_time: form.highlight_ideal_time
          }
        }
      };

      await catalogApi.update(id, payload);
      alert("Cập nhật tour thành công!");
    } catch (e) {
      console.error(e);
      alert("Lỗi cập nhật: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div style={{padding: 20}}>Đang tải dữ liệu tour...</div>;

  // --- RENDER CONTENT TABS ---
  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="ct-card">
            <div className="ct-section-title">Thông tin cơ bản</div>
            <div className="ct-field"><div className="ct-label">Tên Tour</div><input className="ct-input" name="title" value={form.title} onChange={handleChange} /></div>
            <div className="ct-grid-2">
                <div className="ct-field"><div className="ct-label">Mã Tour</div><input className="ct-input" name="product_code" value={form.product_code} onChange={handleChange} /></div>
                <div className="ct-field"><div className="ct-label">Giá (VND)</div><input type="number" className="ct-input" name="base_price" value={form.base_price} onChange={handleChange} /></div>
            </div>
            <div className="ct-grid-3">
              <div className="ct-field"><div className="ct-label">Điểm bền vững</div><input type="number" min={0} max={5} className="ct-input" name="sustainability_score" value={form.sustainability_score} onChange={handleChange} /></div>
              <div className="ct-field"><div className="ct-label">Trạng thái</div>
                <select className="ct-select" name="is_active" value={String(form.is_active)} onChange={(e) => setForm({...form, is_active: e.target.value === 'true'})}>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              </div>
              <div className="ct-field"><div className="ct-label">Tags</div><input className="ct-input" name="tags" value={form.tags} onChange={handleChange} /></div>
            </div>
            <div className="ct-grid-2">
              <div className="ct-field">
                <div className="ct-label">Địa điểm (Ctrl+Click)</div>
                <select multiple className="ct-select" style={{height: 120}} value={form.location_ids} onChange={(e) => handleMultiSelect(e, 'location_ids')}>
                  {locations.map(l => <option key={l._id || l.id} value={l._id || l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="ct-field">
                <div className="ct-label">Danh mục (Ctrl+Click)</div>
                <select multiple className="ct-select" style={{height: 120}} value={form.category_ids} onChange={(e) => handleMultiSelect(e, 'category_ids')}>
                  {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="ct-field"><div className="ct-label">Mô tả ngắn</div><textarea className="ct-textarea" style={{minHeight: 80}} name="description_short" value={form.description_short} onChange={handleChange} /></div>
            <div className="ct-field"><div className="ct-label">Mô tả chi tiết</div><textarea className="ct-textarea" name="description_long" value={form.description_long} onChange={handleChange} /></div>
          </div>
        );

      case "operation":
        return (
          <div className="ct-card">
             <div className="ct-section-title">Vận hành & Lưu trú</div>
             <div className="ct-grid-3">
                <div className="ct-field"><div className="ct-label">Điểm khởi hành</div><input className="ct-input" name="start_point" value={form.start_point} onChange={handleChange} /></div>
                <div className="ct-field"><div className="ct-label">Thời lượng (ngày)</div><input type="number" className="ct-input" name="duration_days" value={form.duration_days} onChange={handleChange} /></div>
                <div className="ct-field"><div className="ct-label">Phương tiện</div>
                  <select className="ct-select" name="transport_type" value={form.transport_type} onChange={handleChange}>
                    <option value="Xe du lịch">Xe du lịch</option>
                    <option value="Máy bay">Máy bay</option>
                    <option value="Tàu hỏa">Tàu hỏa</option>
                    <option value="Du thuyền">Du thuyền</option>
                    <option value="Tự túc">Tự túc</option>
                  </select>
                </div>
             </div>
             <div className="ct-grid-2">
                <div className="ct-field"><div className="ct-label">Khách sạn (Sao)</div>
                  <select className="ct-select" name="hotel_rating" value={form.hotel_rating} onChange={handleChange}>
                    <option value="0">Không có</option>
                    <option value="1">1 Sao</option>
                    <option value="2">2 Sao</option>
                    <option value="3">3 Sao</option>
                    <option value="4">4 Sao</option>
                    <option value="5">5 Sao</option>
                  </select>
                </div>
                <div className="ct-field"><div className="ct-label">Tên khách sạn</div><input className="ct-input" name="hotel_name" value={form.hotel_name} onChange={handleChange} /></div>
             </div>
             
             <div style={{marginTop: 20}} className="ct-section-title">Highlights</div>
             <div className="ct-grid-2">
                <div className="ct-field"><div className="ct-label">Điểm tham quan</div><input className="ct-input" name="highlight_attractions" value={form.highlight_attractions} onChange={handleChange} /></div>
                <div className="ct-field"><div className="ct-label">Ẩm thực</div><input className="ct-input" name="highlight_cuisine" value={form.highlight_cuisine} onChange={handleChange} /></div>
                <div className="ct-field"><div className="ct-label">Đối tượng</div><input className="ct-input" name="highlight_suitable" value={form.highlight_suitable} onChange={handleChange} /></div>
                <div className="ct-field"><div className="ct-label">Thời gian lý tưởng</div><input className="ct-input" name="highlight_ideal_time" value={form.highlight_ideal_time} onChange={handleChange} /></div>
             </div>
          </div>
        );

      case "itinerary":
        return (
          <div className="ct-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
              <div className="ct-section-title">Lịch trình ({form.itinerary.length} ngày)</div>
              <button className="ct-btn ct-btn-sm" onClick={addItineraryDay}>+ Thêm ngày</button>
            </div>
            {form.itinerary.map((day, idx) => (
              <div key={idx} className="ct-list-box">
                 <div className="ct-list-header">
                    <span>Ngày {day.day}</span>
                    <button className="ct-btn-danger" onClick={() => setForm(p=>({...p, itinerary: p.itinerary.filter((_,i)=>i!==idx)}))} style={{border:'none', cursor:'pointer'}}>Xóa</button>
                 </div>
                 <div className="ct-field"><div className="ct-label">Tiêu đề ngày</div>
                   <input className="ct-input" value={day.title} onChange={e=>updateItinerary(idx, 'title', e.target.value)} />
                 </div>
                 <div className="ct-field"><div className="ct-label">Chi tiết</div>
                   <textarea className="ct-textarea" style={{minHeight:60}} value={day.details} onChange={e=>updateItinerary(idx, 'details', e.target.value)} />
                 </div>
                 <div className="ct-grid-2">
                    <div className="ct-field"><div className="ct-label">Ăn uống</div><input className="ct-input" value={day.meals?.join(", ")} onChange={e=>updateItinerary(idx, 'meals', e.target.value.split(","))} placeholder="Sáng, Trưa" /></div>
                    <div className="ct-field"><div className="ct-label">Nơi nghỉ</div><input className="ct-input" value={day.accommodation} onChange={e=>updateItinerary(idx, 'accommodation', e.target.value)} /></div>
                 </div>
              </div>
            ))}
          </div>
        );

      case "policies":
        return (
          <div className="ct-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
              <div className="ct-section-title">Chính sách</div>
              <button className="ct-btn ct-btn-sm" onClick={addPolicy}>+ Thêm mục</button>
            </div>
            {form.policies.map((pol, idx) => (
              <div key={idx} className="ct-list-box">
                <div className="ct-field"><div className="ct-label">Tiêu đề</div><input className="ct-input" value={pol.title} onChange={e=>updatePolicy(idx, 'title', e.target.value)} /></div>
                <div className="ct-field"><div className="ct-label">Nội dung</div><textarea className="ct-textarea" style={{minHeight:60}} value={pol.content} onChange={e=>updatePolicy(idx, 'content', e.target.value)} /></div>
                <button className="ct-btn-danger" onClick={() => setForm(s => ({...s, policies: s.policies.filter((_, i) => i !== idx)}))} style={{border:'none', cursor:'pointer', fontSize:12}}>Xóa mục này</button>
              </div>
            ))}
          </div>
        );

      case "media":
        return (
          <div className="ct-card">
            <div className="ct-section-title">Hình ảnh ({form.images.length})</div>
            <div className="ct-upload-box">
              <p>Kéo thả hoặc bấm để chọn ảnh</p>
              <input type="file" multiple accept="image/*" onChange={handleUpload} style={{display:'none'}} id="upload-btn" />
              <label htmlFor="upload-btn" className="ct-btn-primary" style={{display: 'inline-block', marginTop: 10, cursor:'pointer'}}>Chọn ảnh</label>
            </div>
            <div className="ct-img-grid">
              {form.images.map((img, idx) => (
                <div key={idx} className="ct-img-wrapper">
                  <img src={img.url} alt="Tour" className="ct-img-thumb" />
                  <button onClick={() => setForm(s => ({...s, images: s.images.filter((_, i) => i !== idx)}))} className="ct-img-remove">x</button>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="create-tour-container">
      {/* Header */}
      <div className="ct-header">
        <div>
          <h1 className="ct-h1">Chi tiết Tour</h1>
          <div className="ct-sub">ID: <span style={{fontFamily:'monospace'}}>{id}</span></div>
        </div>
        <div style={{display:'flex', gap: 10}}>
            <button className="ct-btn" onClick={() => nav("/admin/manage/tours")}>Quay lại</button>
            
            {/* Nút Inventory màu xanh nhạt */}
            <button 
                className="ct-btn" 
                style={{borderColor: '#0b5fff', color: '#0b5fff', background: '#eff6ff'}}
                onClick={() => nav(`/admin/manage/tours/${id}/inventory`)}
            >
                📦 Quản lý Tồn kho
            </button>
            
            <button className="ct-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ct-tabs">
        <div className={`ct-tab ${activeTab==='general'?'active':''}`} onClick={()=>setActiveTab("general")}>1. Tổng quan</div>
        <div className={`ct-tab ${activeTab==='operation'?'active':''}`} onClick={()=>setActiveTab("operation")}>2. Vận hành</div>
        <div className={`ct-tab ${activeTab==='itinerary'?'active':''}`} onClick={()=>setActiveTab("itinerary")}>3. Lịch trình</div>
        <div className={`ct-tab ${activeTab==='policies'?'active':''}`} onClick={()=>setActiveTab("policies")}>4. Chính sách</div>
        <div className={`ct-tab ${activeTab==='media'?'active':''}`} onClick={()=>setActiveTab("media")}>5. Hình ảnh</div>
      </div>

      {renderContent()}
    </div>
  );
}