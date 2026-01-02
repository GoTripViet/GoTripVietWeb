import React from "react";
export default function DashboardAdvanced() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 22 }}>Dashboard nâng cao</div>
      <div style={{ color: "#6b7280", marginTop: 6 }}>
        Ở đây bạn có thể show số lượng flights/hotels/users, top deals...
      </div>
    </div>
  );
}
