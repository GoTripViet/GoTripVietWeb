import React, { useEffect, useState } from "react";
import CrudTable from "../../components/admin/CrudTable";
import {
  STORE_KEY,
  getList,
  addItem,
  updateItem,
  deleteItem,
  setList,
} from "../../data/adminStore";

export default function ManagePartnerHotels() {
  const [rows, setRows] = useState([]);

  const reload = () => setRows(getList(STORE_KEY.partner_hotels));
  useEffect(() => reload(), []);

  const syncFromHotels = () => {
    const listing = getList(STORE_KEY.hotel_listing_hotels);
    const names = Array.from(
      new Set(listing.map((x) => x.title).filter(Boolean))
    );

    const current = getList(STORE_KEY.partner_hotels);
    const byName = new Map(
      current.map((p) => [String(p.name || "").trim(), p])
    );

    const next = names.map((name, idx) => {
      const key = String(name).trim();
      const old = byName.get(key);
      return (
        old || {
          id: `ph_${Date.now()}_${idx}`,
          name: key,
          contactEmail: "",
          contactPhone: "",
          address: "",
          commissionRate: 0,
          createdAt: new Date().toISOString().slice(0, 10),
          note: "",
          status: "ACTIVE",
        }
      );
    });

    setList(STORE_KEY.partner_hotels, next);
    reload();
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            Manage Partner Hotels
          </div>
          <div style={{ color: "#6b7280" }}>
            Mỗi <b>hotel title</b> là 1 đối tác khách sạn.
          </div>
        </div>

        <button
          onClick={syncFromHotels}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Đồng bộ từ Hotels
        </button>
      </div>

      <CrudTable
        title="Danh sách đối tác khách sạn"
        data={rows}
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "name", label: "Tên khách sạn", type: "text" },
          { key: "contactEmail", label: "Email", type: "text" },
          { key: "contactPhone", label: "SĐT", type: "text" },
          { key: "address", label: "Địa chỉ", type: "text" },
          { key: "commissionRate", label: "Hoa hồng (%)", type: "number" },
          { key: "note", label: "Ghi chú", type: "text" },
          { key: "createdAt", label: "Ngày tạo", type: "text" },
        ]}
        onAdd={(item) => {
          addItem(STORE_KEY.partner_hotels, item);
          reload();
        }}
        onUpdate={(id, patch) => {
          updateItem(STORE_KEY.partner_hotels, id, patch);
          reload();
        }}
        onDelete={(id) => {
          deleteItem(STORE_KEY.partner_hotels, id);
          reload();
        }}
        onToggleStatus={(id, current) => {
          updateItem(STORE_KEY.partner_hotels, id, {
            status: current === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          });
          reload();
        }}
      />
    </div>
  );
}
