import React, { useEffect, useState, useMemo } from "react";
import paymentApi from "../../api/paymentApi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- HELPERS ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- ICONS ---
const IconWrapper = ({ children }) => (
  <div style={{ width: "24px", height: "24px", minWidth: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {children}
  </div>
);

const RefreshIcon = () => (
  <IconWrapper>
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  </IconWrapper>
);
const MoneyIcon = () => (
  <IconWrapper>
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </IconWrapper>
);
const TrendingUpIcon = () => (
  <IconWrapper>
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  </IconWrapper>
);
const HandshakeIcon = () => (
  <IconWrapper>
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  </IconWrapper>
);

export default function DashboardAdvanced() {
  const [stats, setStats] = useState({
    totalVolume: 0,
    adminProfit: 0,
    partnerPayout: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // [NEW] Tab State: 'chart' | 'list'
  const [activeTab, setActiveTab] = useState("chart");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await paymentApi.getSystemStats();
        if (res) {
          let safeTotalVolume = 0;
          let safeAdminProfit = 0;
          let safePartnerPayout = 0;

          res.transactions.forEach(tx => {
            if (tx.status === 'COMPLETED') {
              if (tx.type === 'INCOME') safeTotalVolume += tx.amount;
              if (tx.type === 'COMMISSION') safeAdminProfit += Math.abs(tx.amount);
            }
          });
          safePartnerPayout = safeTotalVolume - safeAdminProfit;

          setStats({
            totalVolume: safeTotalVolume,
            adminProfit: safeAdminProfit,
            partnerPayout: safePartnerPayout
          });

          // Sort transactions by date (newest first)
          const sortedTxs = (res.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTransactions(sortedTxs);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- CHART LOGIC ---
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const revenueByDate = {};
    // Use reverse() copy to calculate chart from old to new
    [...transactions].reverse().forEach((tx) => {
      if (tx.type === "INCOME" && tx.status === "COMPLETED") {
        const dateKey = new Date(tx.createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        if (!revenueByDate[dateKey]) revenueByDate[dateKey] = 0;
        revenueByDate[dateKey] += tx.amount;
      }
    });
    return Object.keys(revenueByDate).map((date) => ({ date, revenue: revenueByDate[date] }));
  }, [transactions]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  // --- STYLES OBJECTS ---
  const cardStyle = {
    flex: 1,
    minWidth: '280px',
    borderRadius: '20px',
    padding: '24px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: 'transform 0.2s',
    cursor: 'default'
  };

  const decorationCircle = {
    position: 'absolute',
    top: '-20px',
    right: '-20px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 0
  };

  return (
    <div style={{
      backgroundColor: '#f6f7fb',
      minHeight: '100%',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>

      {/* --- HEADER --- */}
      <div style={{
        padding: '24px 32px',
        background: '#fff',
        borderRadius: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '14px' }}>Tổng quan hệ thống & báo cáo tài chính</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none',
            borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#4b5563',
            cursor: 'pointer', transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
          onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
        >
          <RefreshIcon /> Làm mới dữ liệu
        </button>
      </div>

      <div style={{ padding: '0 4px' }}>

        {/* --- STATS CARDS --- */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
          {/* Card 1 */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }}>
            <div style={decorationCircle}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '12px', backdropFilter: 'blur(4px)' }}><MoneyIcon /></div>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e0e7ff' }}>Tổng Doanh Số</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', position: 'relative', zIndex: 10 }}>{formatCurrency(stats.totalVolume)}</div>
          </div>

          {/* Card 2 */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
            <div style={decorationCircle}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '12px', backdropFilter: 'blur(4px)' }}><TrendingUpIcon /></div>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1fae5' }}>Lợi Nhuận Admin</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', position: 'relative', zIndex: 10 }}>{formatCurrency(stats.adminProfit)}</div>
          </div>

          {/* Card 3 */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)' }}>
            <div style={decorationCircle}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '12px', backdropFilter: 'blur(4px)' }}><HandshakeIcon /></div>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fce7f3' }}>Đã Trả Partner</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', position: 'relative', zIndex: 10 }}>{formatCurrency(stats.partnerPayout)}</div>
          </div>
        </div>

        {/* --- MAIN CONTENT SECTION (TABS) --- */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>

          {/* Tab Header */}
          <div style={{
            display: 'flex',
            padding: '8px',
            margin: '20px 24px 0',
            backgroundColor: '#f3f4f6',
            borderRadius: '16px',
            width: 'fit-content'
          }}>
            <button
              onClick={() => setActiveTab('chart')}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: activeTab === 'chart' ? '#fff' : 'transparent',
                color: activeTab === 'chart' ? '#4f46e5' : '#6b7280',
                boxShadow: activeTab === 'chart' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📊 Biểu đồ tăng trưởng
            </button>
            <button
              onClick={() => setActiveTab('list')}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: activeTab === 'list' ? '#fff' : 'transparent',
                color: activeTab === 'list' ? '#4f46e5' : '#6b7280',
                boxShadow: activeTab === 'list' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📜 Lịch sử giao dịch
            </button>
          </div>

          <div style={{ padding: '24px' }}>

            {/* --- TAB 1: CHART --- */}
            {activeTab === 'chart' && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px', marginLeft: '8px' }}>
                  Doanh thu theo thời gian
                </h3>
                <div style={{ width: "100%", height: 400 }}>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '16px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📉</div>
                      <p>Chưa có đủ dữ liệu để vẽ biểu đồ</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB 2: TRANSACTION LIST --- */}
            {activeTab === 'list' && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    Danh sách chi tiết
                  </h3>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '6px 16px', borderRadius: '20px' }}>
                    Tổng: {transactions.length} giao dịch
                  </span>
                </div>

                {/* SCROLLABLE TABLE CONTAINER */}
                <div style={{
                  maxHeight: '500px', // FIX HEIGHT TO PREVENT LONG PAGE
                  overflowY: 'auto',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  position: 'relative'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f9fafb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <tr>
                        <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Mã GD</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Loại</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Booking ID</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Số Tiền</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>Trạng Thái</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <tr key={tx._id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fff' }}>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '600', color: '#374151', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' }}>
                                #{tx._id.slice(-6).toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              {tx.type === "INCOME" ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>↓</div>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>Doanh Thu</span>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>%</div>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>Phí Sàn</span>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6b7280' }}>
                              {tx.booking_id ? tx.booking_id.slice(-6).toUpperCase() : "N/A"}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: tx.type === "INCOME" ? '#059669' : '#2563eb' }}>
                                {tx.type === "INCOME" ? "+" : ""}{formatCurrency(tx.amount)}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              {tx.status === 'COMPLETED' ? (
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                                  HOÀN TẤT
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#a16207', backgroundColor: '#fef9c3', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fde047' }}>
                                  ĐANG XỬ LÝ
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>
                              {new Date(tx.createdAt).toLocaleString("vi-VN")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                            Chưa có dữ liệu giao dịch nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Simple Keyframes for fade animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}