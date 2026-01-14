import React, { useEffect, useState } from "react";
import paymentApi from "../../api/paymentApi";

// --- HELPERS ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- ICONS (Wrapped & Sized to prevent breaking) ---
const IconWrapper = ({ children }) => (
  <div style={{ width: "24px", height: "24px", minWidth: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {children}
  </div>
);

const MoneyIcon = () => (
  <IconWrapper>
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '100%', height: '100%' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </IconWrapper>
);

const TrendingUpIcon = () => (
  <IconWrapper>
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '100%', height: '100%' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  </IconWrapper>
);

const HandshakeIcon = () => (
  <IconWrapper>
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '100%', height: '100%' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  </IconWrapper>
);

export default function DashboardBasic() {
  const [stats, setStats] = useState({
    totalVolume: 0,
    adminProfit: 0,
    partnerPayout: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await paymentApi.getSystemStats();
        if (res && res.stats) {
          setStats(res.stats);
        }
      } catch (error) {
        console.error("Lỗi lấy dashboard basic:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  // --- STYLES OBJECTS (No External CSS required) ---
  const containerStyle = {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const cardStyle = {
    flex: 1,
    minWidth: '280px',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  };

  const decorationCircle = {
    position: 'absolute',
    top: '-16px',
    right: '-16px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 0
  };

  return (
    <div style={containerStyle}>

      {/* Header Widget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1f2937', margin: 0, background: '-webkit-linear-gradient(135deg, #1e40af, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hiệu Suất Kinh Doanh
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            Tổng quan dòng tiền thời gian thực
          </p>
        </div>

        {/* Status Indicator */}
        <div style={{ backgroundColor: '#ecfdf5', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
            <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#4ade80', opacity: 0.75, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#22c55e' }}></span>
          </span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
        </div>
      </div>

      {/* Grid 3 Columns */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>

        {/* Card 1: Total GMV */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)' }}>
          <div style={decorationCircle}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 10 }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
              <MoneyIcon />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dbeafe' }}>Tổng GMV</span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 'bold', position: 'relative', zIndex: 10 }}>
            {formatCurrency(stats.totalVolume)}
          </div>
          <p style={{ color: '#dbeafe', fontSize: '12px', marginTop: '8px', opacity: 0.8, position: 'relative', zIndex: 10 }}>Doanh số toàn sàn</p>
        </div>

        {/* Card 2: Admin Profit */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}>
          <div style={decorationCircle}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 10 }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
              <TrendingUpIcon />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1fae5' }}>Lợi Nhuận (15%)</span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 'bold', position: 'relative', zIndex: 10 }}>
            {formatCurrency(stats.adminProfit)}
          </div>
          <p style={{ color: '#d1fae5', fontSize: '12px', marginTop: '8px', opacity: 0.8, position: 'relative', zIndex: 10 }}>Doanh thu hệ thống</p>
        </div>

        {/* Card 3: Partner Payout */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}>
          <div style={decorationCircle}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 10 }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
              <HandshakeIcon />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffedd5' }}>Trả Partner (85%)</span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 'bold', position: 'relative', zIndex: 10 }}>
            {formatCurrency(stats.partnerPayout)}
          </div>
          <p style={{ color: '#ffedd5', fontSize: '12px', marginTop: '8px', opacity: 0.8, position: 'relative', zIndex: 10 }}>Đã thanh toán đối tác</p>
        </div>

      </div>
    </div>
  );
}