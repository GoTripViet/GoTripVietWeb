import React, { useEffect, useState } from "react";
import authApi from "../../api/authApi";
// Tận dụng CSS của AdminProfile hoặc tạo file mới
import "../../styles/admin/AdminProfile.css"; 

export default function PartnerProfile() {
  const [me, setMe] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState({
    company_name: "",
    business_license: "", // Mã số thuế
    contact_phone: "",
    website: ""
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authApi.getProfile();
      setMe(data);
      // Nếu user có partner_details, map vào state
      if (data.partner_details) {
        setPartnerInfo({
          company_name: data.partner_details.company_name || "",
          business_license: data.partner_details.business_license || "",
          contact_phone: data.partner_details.contact_phone || "",
          website: data.partner_details.website || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePartnerInfo = async (e) => {
    e.preventDefault();
    try {
      // Giả sử có API update partner info riêng hoặc dùng chung updateProfile
      // Payload: { partner_details: { ... } }
      await authApi.updateProfile({ partner_details: partnerInfo });
      setMsg("Cập nhật thông tin doanh nghiệp thành công! ✅");
      setTimeout(() => setMsg(""), 3000);
    } catch (error) {
      setMsg("Lỗi: " + error.message);
    }
  };

  if (loading) return <div>Đang tải hồ sơ...</div>;

  const isApproved = me?.partner_details?.is_approved;

  return (
    <div className="profile-container" style={{maxWidth: 800, margin: '0 auto'}}>
      <div className="profile-header" style={{display:'flex', gap: 20, alignItems:'center', marginBottom: 30}}>
        <div className="avatar-placeholder" style={{width: 80, height: 80, background: '#0b5fff', color: '#fff', borderRadius: '50%', display:'grid', placeItems:'center', fontSize: 32, fontWeight: 'bold'}}>
           {me?.fullName?.charAt(0) || "P"}
        </div>
        <div>
           <h1 style={{margin:0, fontSize: 24}}>{me?.fullName}</h1>
           <p style={{color: '#666', margin: '5px 0'}}>{me?.email}</p>
           {/* Badge trạng thái */}
           <span style={{
               padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold',
               background: isApproved ? '#dcfce7' : '#fef9c3',
               color: isApproved ? '#166534' : '#854d0e'
           }}>
              {isApproved ? "✔ Đã được duyệt đăng bài" : "⏳ Đang chờ duyệt"}
           </span>
        </div>
      </div>

      <div className="profile-grid" style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
        {/* Cột Trái: Thông tin tài khoản */}
        <div className="card-box" style={{background:'#fff', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb'}}>
            <h3 style={{marginTop:0}}>Thông tin đăng nhập</h3>
            <div className="field-group">
                <label>Họ tên người đại diện</label>
                <input className="input-field" disabled value={me?.fullName || ""} />
            </div>
            <div className="field-group">
                <label>Email</label>
                <input className="input-field" disabled value={me?.email || ""} />
            </div>
            <div className="field-group">
                <label>Số điện thoại cá nhân</label>
                <input className="input-field" disabled value={me?.phone || ""} />
            </div>
            <p style={{fontSize: 12, color: '#888', fontStyle: 'italic'}}>*Để thay đổi thông tin đăng nhập, vui lòng liên hệ Admin.</p>
        </div>

        {/* Cột Phải: Thông tin doanh nghiệp (Editable) */}
        <div className="card-box" style={{background:'#fff', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb'}}>
            <h3 style={{marginTop:0}}>Hồ sơ doanh nghiệp</h3>
            <form onSubmit={handleUpdatePartnerInfo}>
                <div className="field-group">
                    <label>Tên Công ty / Thương hiệu <span style={{color:'red'}}>*</span></label>
                    <input 
                        className="input-field" 
                        required
                        value={partnerInfo.company_name} 
                        onChange={(e) => setPartnerInfo({...partnerInfo, company_name: e.target.value})}
                        placeholder="VD: Công ty Du lịch Việt..."
                    />
                </div>
                <div className="field-group">
                    <label>Mã số thuế / GPKD <span style={{color:'red'}}>*</span></label>
                    <input 
                        className="input-field" 
                        required
                        value={partnerInfo.business_license} 
                        onChange={(e) => setPartnerInfo({...partnerInfo, business_license: e.target.value})}
                    />
                </div>
                <div className="field-group">
                    <label>Hotline liên hệ khách hàng</label>
                    <input 
                        className="input-field" 
                        value={partnerInfo.contact_phone} 
                        onChange={(e) => setPartnerInfo({...partnerInfo, contact_phone: e.target.value})}
                    />
                </div>
                
                {msg && <div style={{color: msg.includes('Lỗi') ? 'red' : 'green', margin: '10px 0', fontWeight: 'bold'}}>{msg}</div>}

                <button type="submit" className="btn-save" style={{
                    width: '100%', padding: 12, background: '#0b5fff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', marginTop: 10
                }}>
                    Lưu thông tin doanh nghiệp
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}