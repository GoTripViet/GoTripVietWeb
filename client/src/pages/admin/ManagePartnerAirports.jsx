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

export default function ManagePartnerAirports() {
  const [rows, setRows] = useState([]);

  const reload = () => setRows(getList(STORE_KEY.partner_airports));

  useEffect(() => reload(), []);

  const syncFromFlights = () => {
    const flights = getList(STORE_KEY.flights);
    const names = Array.from(
      new Set(flights.map((x) => x.operatedBy).filter(Boolean))
    );

    const current = getList(STORE_KEY.partner_airports);
    const byName = new Map(
      current.map((p) => [String(p.name || "").trim(), p])
    );

    const next = names.map((name, idx) => {
      const key = String(name).trim();
      const old = byName.get(key);
      return (
        old || {
          id: `pa_${Date.now()}_${idx}`,
          name: key,
          contactEmail: "",
          contactPhone: "",
          commissionRate: 0,
          createdAt: new Date().toISOString().slice(0, 10),
          note: "",
          status: "ACTIVE",
        }
      );
    });

    setList(STORE_KEY.partner_airports, next);
    reload();
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            Manage Partner Airports (Airlines)
          </div>
          <div style={{ color: "#6b7280" }}>
            Mỗi <b>operatedBy</b> trong flights là 1 đối tác hãng bay.
          </div>
        </div>

        <button
          onClick={syncFromFlights}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Đồng bộ từ Flights
        </button>
      </div>

      <CrudTable
        title="Danh sách đối tác hãng bay"
        data={rows}
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "name", label: "Tên hãng bay", type: "text" },
          { key: "contactEmail", label: "Email", type: "text" },
          { key: "contactPhone", label: "SĐT", type: "text" },
          { key: "commissionRate", label: "Hoa hồng (%)", type: "number" },
          { key: "note", label: "Ghi chú", type: "text" },
          { key: "createdAt", label: "Ngày tạo", type: "text" },
        ]}
        onAdd={(item) => {
          addItem(STORE_KEY.partner_airports, item);
          reload();
        }}
        onUpdate={(id, patch) => {
          updateItem(STORE_KEY.partner_airports, id, patch);
          reload();
        }}
        onDelete={(id) => {
          deleteItem(STORE_KEY.partner_airports, id);
          reload();
        }}
        onToggleStatus={(id, current) => {
          updateItem(STORE_KEY.partner_airports, id, {
            status: current === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          });
          reload();
        }}
      />
    </div>
  );
}
