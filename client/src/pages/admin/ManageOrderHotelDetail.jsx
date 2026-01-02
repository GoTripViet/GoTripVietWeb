import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { STORE_KEY, getList, updateItem } from "../../data/adminStore";

export default function ManageOrderHotelDetail() {
  const nav = useNavigate();
  const { id } = useParams();

  const order = useMemo(() => {
    const list = getList(STORE_KEY.orders_hotels);
    return list.find((x) => String(x.id) === String(id));
  }, [id]);

  if (!order) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 14,
        }}
      >
        <div style={{ fontWeight: 900 }}>Không tìm thấy order</div>
        <button onClick={() => nav("/admin/manage/orders/hotels")} style={btn}>
          Quay lại
        </button>
      </div>
    );
  }

  const setStatus = (next) => {
    updateItem(STORE_KEY.orders_hotels, order.id, {
      status: next,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    nav(0);
  };

  const setPayment = (next) => {
    updateItem(STORE_KEY.orders_hotels, order.id, {
      paymentStatus: next,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    nav(0);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            Chi tiết đơn khách sạn
          </div>
          <div style={{ color: "#6b7280" }}>{order.id}</div>
        </div>
        <button onClick={() => nav("/admin/manage/orders/hotels")} style={btn}>
          ← Danh sách
        </button>
      </div>

      <Card title="Thông tin khách">
        <Row k="Email" v={order.contactEmail} />
        <Row k="SĐT" v={order.contactPhone} />
      </Card>

      <Card title="Thông tin booking">
        <Row k="Hotel" v={order.hotelName} />
        <Row k="Check-in" v={order.checkInDate} />
        <Row k="Check-out" v={order.checkOutDate} />
        <Row k="Số phòng" v={order.roomsCount} />
        <Row k="Người lớn" v={order.adultsCount} />
        <Row k="Trẻ em" v={order.childrenCount} />
        <Row k="Promo" v={order.promoCode || "—"} />
      </Card>

      <Card title="Thanh toán">
        <Row
          k="Tổng tiền"
          v={Number(order.totalAmount || 0).toLocaleString("vi-VN")}
        />
        <Row k="Payment status" v={order.paymentStatus} />
        <Row k="Order status" v={order.status} />

        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
        >
          <button onClick={() => setPayment("PAID")} style={btnPrimary}>
            Set PAID
          </button>
          <button onClick={() => setPayment("UNPAID")} style={btn}>
            Set UNPAID
          </button>

          <button onClick={() => setStatus("PENDING")} style={btn}>
            PENDING
          </button>
          <button onClick={() => setStatus("CONFIRMED")} style={btn}>
            CONFIRMED
          </button>
          <button onClick={() => setStatus("CANCELLED")} style={btn}>
            CANCELLED
          </button>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div style={{ width: 160, color: "#6b7280", fontWeight: 800 }}>{k}</div>
      <div style={{ fontWeight: 800 }}>{String(v ?? "—")}</div>
    </div>
  );
}

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

const btnPrimary = { ...btn, border: 0, background: "#0b5fff", color: "#fff" };
