import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bookingApi from "../../api/bookingApi";
import "../../styles/partner/PartnerManageOrders.css"; // Sử dụng file CSS mới

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export default function PartnerManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getPartnerBookings();
      setOrders(res.bookings || res.data || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic Lọc
  const filtered = useMemo(() => {
    return orders.filter(o => filterStatus === 'ALL' || o.status?.toUpperCase() === filterStatus);
  }, [orders, filterStatus]);

  // Logic Thống kê
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed' || o.status === 'confirmed')
      .reduce((acc, curr) => acc + (curr.pricing?.final_price || 0), 0);
    return { totalOrders, pendingOrders, totalRevenue };
  }, [orders]);

  // Render Badge trạng thái
  const renderStatus = (st) => {
    const s = st?.toLowerCase();
    let badgeClass = "pmo-badge";
    let label = st;

    if (s === 'pending') { badgeClass += " pmo-badge-pending"; label = "⏳ Chờ xác nhận"; }
    else if (s === 'confirmed') { badgeClass += " pmo-badge-confirmed"; label = "✅ Đã xác nhận"; }
    else if (s === 'completed') { badgeClass += " pmo-badge-completed"; label = "🏁 Hoàn thành"; }
    else if (s === 'cancelled') { badgeClass += " pmo-badge-cancelled"; label = "❌ Đã hủy"; }
    else { badgeClass += " pmo-badge-pending"; }

    return <span className={badgeClass}>{label}</span>;
  };

  return (
    <div className="pmo-container">
      
      {/* 1. HEADER */}
      <div className="pmo-header">
        <div>
          <h1 className="pmo-title">Quản lý Đơn hàng</h1>
          <div className="pmo-subtitle">Theo dõi và xử lý booking từ khách hàng</div>
        </div>
        <button className="pmo-btn-refresh" onClick={fetchData}>
          <span>↻</span> Tải lại dữ liệu
        </button>
      </div>

      {/* 2. STATS GRID (KHỐI THỐNG KÊ) */}
      <div className="pmo-stats-grid">
        <div className="pmo-stat-card">
          <div className="pmo-stat-label">Tổng đơn hàng</div>
          <div className="pmo-stat-value">{stats.totalOrders}</div>
        </div>
        <div className="pmo-stat-card orange">
          <div className="pmo-stat-label">Chờ xử lý</div>
          <div className="pmo-stat-value">{stats.pendingOrders}</div>
        </div>
        <div className="pmo-stat-card green">
          <div className="pmo-stat-label">Doanh thu tạm tính</div>
          <div className="pmo-stat-value">{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div>
        <div className="pmo-tabs-wrapper">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING', label: 'Chờ xác nhận' },
            { key: 'CONFIRMED', label: 'Đã xác nhận' },
            { key: 'COMPLETED', label: 'Hoàn thành' },
            { key: 'CANCELLED', label: 'Đã hủy' }
          ].map(tab => (
            <button 
              key={tab.key} 
              className={`pmo-tab ${filterStatus === tab.key ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. TABLE */}
      <div className="pmo-table-card">
        <table className="pmo-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>Mã Đơn / Ngày</th>
              <th>Sản phẩm</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Đang tải dữ liệu...</td></tr>
            )}
            
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="pmo-empty">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 40, opacity: 0.5 }}>📭</div>
                    <div>Chưa có đơn hàng nào ở trạng thái này.</div>
                  </div>
                </td>
              </tr>
            )}

            {filtered.map(booking => {
              const firstItem = booking.items?.[0];
              const title = firstItem?.snapshot?.title || "Sản phẩm không khả dụng";
              const itemCount = booking.items?.length || 0;
              const customerName = booking.customer_details?.fullName || "Khách vãng lai";
              const customerPhone = booking.customer_details?.phone || "";

              return (
                <tr key={booking._id}>
                  <td style={{ paddingLeft: 24 }}>
                    <div className="pmo-code">#{booking._id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
                      {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <div className="pmo-product-name" title={title}>{title}</div>
                    {itemCount > 1 && <div style={{ fontSize: 12, color: '#0b5fff', fontWeight: 600 }}>+ {itemCount - 1} dịch vụ khác</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{customerName}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{customerPhone}</div>
                  </td>
                  <td>
                    <div className="pmo-price">
                      {formatCurrency(booking.pricing?.final_price || 0)}
                    </div>
                  </td>
                  <td>
                    {renderStatus(booking.status)}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <button 
                      className="pmo-btn-detail"
                      onClick={() => navigate(`/partner/orders/${booking._id}`)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}