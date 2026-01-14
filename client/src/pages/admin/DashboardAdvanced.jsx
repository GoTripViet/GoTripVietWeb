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
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '100%', height: '100%' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  </IconWrapper>
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

export default function DashboardAdvanced() {
  const [stats, setStats] = useState({
    totalVolume: 0,
    adminProfit: 0,
    partnerPayout: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await paymentApi.getSystemStats();
        if (res) {
          // ⚠️ IMPORTANT: Recalculate stats on Frontend to ensure we ONLY count COMPLETED transactions
          // This creates a "Safe View" even if backend sends everything
          let safeTotalVolume = 0;
          let safeAdminProfit = 0;
          let safePartnerPayout = 0;

          res.transactions.forEach(tx => {
            if(tx.status === 'COMPLETED') { // Only count confirmed money
               if(tx.type === 'INCOME') safeTotalVolume += tx.amount;
               if(tx.type === 'COMMISSION') safeAdminProfit += Math.abs(tx.amount);
            }
          });
          safePartnerPayout = safeTotalVolume - safeAdminProfit;

          setStats({
            totalVolume: safeTotalVolume,
            adminProfit: safeAdminProfit,
            partnerPayout: safePartnerPayout
          });
          
          setTransactions(res.transactions);
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
    transactions.forEach((tx) => {
      // Only chart confirmed income
      if (tx.type === "INCOME" && tx.status === "COMPLETED") {
        const dateKey = new Date(tx.createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        if (!revenueByDate[dateKey]) revenueByDate[dateKey] = 0;
        revenueByDate[dateKey] += tx.amount;
      }
    });
    return Object.keys(revenueByDate).map((date) => ({ date, revenue: revenueByDate[date] })).reverse();
  }, [transactions]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      Loading...
    </div>
  );

  // --- STYLES OBJECTS ---
  const cardStyle = {
    flex: 1,
    minWidth: '280px',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
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
    <div style={{ 
      backgroundColor: '#fff', 
      borderRadius: '24px', 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
      border: '1px solid #f3f4f6', 
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* --- HEADER --- */}
      <div style={{ padding: '32px', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(to right, #f9fafb, #ffffff)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1f2937', margin: 0 }}>
              Quản Lý Doanh Thu
            </h1>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px' }}>Theo dõi dòng tiền và lịch sử chia sẻ lợi nhuận</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #e5e7eb', 
              borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold', color: '#4b5563', 
              cursor: 'pointer' 
            }}
          >
            <RefreshIcon /> Làm mới
          </button>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        
        {/* --- STATS CARDS --- */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
          
          {/* Card 1 */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)' }}>
            <div style={decorationCircle}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 10 }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}><MoneyIcon /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dbeafe' }}>Tổng Doanh Số</span>
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', position: 'relative', zIndex: 10 }}>{formatCurrency(stats.totalVolume)}</div>
          </div>

          {/* Card 2 */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}>
            <div style={decorationCircle}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 10 }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}><TrendingUpIcon /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1fae5' }}>Lợi Nhuận Admin</span>
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', position: 'relative', zIndex: 10 }}>{formatCurrency(stats.adminProfit)}</div>
          </div>

          {/* Card 3 */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}>
            <div style={decorationCircle}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 10 }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}><HandshakeIcon /></div>
              <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffedd5' }}>Đã Trả Partner</span>
            </div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', position: 'relative', zIndex: 10 }}>{formatCurrency(stats.partnerPayout)}</div>
          </div>
        </div>

        {/* --- CHART SECTION --- */}
        <div style={{ marginBottom: '40px', padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '24px', backgroundColor: '#6366f1', borderRadius: '9999px', display: 'inline-block' }}></span>
            Biểu Đồ Tăng Trưởng
          </h3>
          
          <div style={{ width: "100%", height: 400 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                <p>Chưa đủ dữ liệu để vẽ biểu đồ</p>
              </div>
            )}
          </div>
        </div>

        {/* --- TABLE HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '9999px', display: 'inline-block' }}></span>
            Lịch Sử Giao Dịch
          </h3>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #e5e7eb' }}>
            {transactions.length} giao dịch
          </span>
        </div>

        {/* --- TABLE --- */}
        <div style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mã GD</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loại</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Số Tiền</th>
                  {/* 👇 ADDED STATUS HEADER 👇 */}
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Trạng Thái</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '500', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          #{tx._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      
                      <td style={{ padding: '16px 24px' }}>
                        {tx.type === "INCOME" ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                            Doanh Thu Gốc
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                            Phí Sàn (15%)
                          </span>
                        )}
                      </td>
                      
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>
                        {tx.booking_id ? tx.booking_id.slice(-6).toUpperCase() : "N/A"}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: tx.type === "INCOME" ? '#059669' : '#2563eb' }}>
                          {tx.type === "INCOME" ? "+" : ""}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* 👇 ADDED STATUS COLUMN 👇 */}
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                         {tx.status === 'COMPLETED' ? (
                           <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                             Đã thanh toán
                           </span>
                         ) : (
                           <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ca8a04', backgroundColor: '#fef9c3', padding: '4px 10px', borderRadius: '6px' }}>
                             Đang xử lý
                           </span>
                         )}
                      </td>

                      <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                        {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                      Chưa có dữ liệu giao dịch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}