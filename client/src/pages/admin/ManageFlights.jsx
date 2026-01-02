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

export default function ManageFlights() {
  const [rows, setRows] = useState([]);

  const reload = () => setRows(getList(STORE_KEY.flights));

  useEffect(() => reload(), []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 22 }}>Quản lý chuyến bay</div>
        <div style={{ color: "#6b7280" }}>
          CRUD từ dữ liệu DUMMY_FLIGHTS (FlightsData).
        </div>
      </div>

      <CrudTable
        title="Danh sách chuyến bay"
        data={rows}
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "price", label: "Giá", type: "number" },
          {
            key: "totalDurationHours",
            label: "Thời lượng (giờ)",
            type: "number",
          },
          { key: "stopsMax", label: "Số điểm dừng", type: "number" },
          { key: "operatedBy", label: "Hãng vận hành", type: "text" },
        ]}
        onAdd={(item) => {
          addItem(STORE_KEY.flights, item);
          reload();
        }}
        onUpdate={(id, patch) => {
          updateItem(STORE_KEY.flights, id, patch);
          reload();
        }}
        onDelete={(id) => {
          deleteItem(STORE_KEY.flights, id);
          reload();
        }}
        onToggleStatus={(id, current) => {
          updateItem(STORE_KEY.flights, id, {
            status: current === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          });
          reload();
        }}
      />

      {/* ví dụ thêm: “best/flexible” toggle nhanh */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Hành động nhanh</div>
        <button
          onClick={() => {
            const list = getList(STORE_KEY.flights);
            const next = list.map((x) => ({ ...x, best: false }));
            setList(STORE_KEY.flights, next);
            reload();
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Bỏ chọn “best” cho tất cả
        </button>
      </div>
    </div>
  );
}
