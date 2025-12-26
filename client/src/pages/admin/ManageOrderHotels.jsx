import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CrudTable from "../../components/admin/CrudTable";
import {
  STORE_KEY,
  getList,
  addItem,
  updateItem,
  deleteItem,
} from "../../data/adminStore";

const cycleStatus = (s) => {
  const order = ["PENDING", "PAID", "CONFIRMED", "CANCELLED"];
  const i = Math.max(0, order.indexOf(String(s || "PENDING")));
  return order[(i + 1) % order.length];
};

export default function ManageOrderHotels() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);

  const reload = () => setRows(getList(STORE_KEY.orders_hotels));
  useEffect(() => reload(), []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Đơn khách sạn</div>
          <div style={{ color: "#6b7280" }}>bấm “Xem” để vào chi tiết</div>
        </div>
      </div>

      <CrudTable
        title="Orders Hotels"
        data={rows}
        schema={[
          { key: "id", label: "Order ID", type: "text" },
          { key: "contactEmail", label: "Email", type: "text" },
          { key: "contactPhone", label: "SĐT", type: "text" },
          { key: "hotelName", label: "Hotel", type: "text" },
          { key: "checkInDate", label: "Check-in", type: "text" },
          { key: "checkOutDate", label: "Check-out", type: "text" },
          { key: "totalAmount", label: "Tổng tiền", type: "number" },
          { key: "paymentStatus", label: "Payment", type: "text" },
          { key: "createdAt", label: "Ngày tạo", type: "text" },
        ]}
        statusKey="status"
        renderRowActions={(row) => (
          <button
            onClick={() => nav(`/admin/manage/orders/hotels/${row.id}`)}
            style={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "8px 10px",
              cursor: "pointer",
              background: "#fff",
              fontWeight: 800,
            }}
          >
            Xem
          </button>
        )}
        onAdd={(item) => {
          addItem(STORE_KEY.orders_hotels, {
            ...item,
            type: "HOTEL",
            paymentStatus: item.paymentStatus || "UNPAID",
            status: item.status || "PENDING",
            createdAt: item.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString().slice(0, 10),
          });
          reload();
        }}
        onUpdate={(id, patch) => {
          updateItem(STORE_KEY.orders_hotels, id, {
            ...patch,
            updatedAt: new Date().toISOString().slice(0, 10),
          });
          reload();
        }}
        onDelete={(id) => {
          deleteItem(STORE_KEY.orders_hotels, id);
          reload();
        }}
        onToggleStatus={(id, current) => {
          updateItem(STORE_KEY.orders_hotels, id, {
            status: cycleStatus(current),
            updatedAt: new Date().toISOString().slice(0, 10),
          });
          reload();
        }}
      />
    </div>
  );
}
