import React, { useEffect, useState } from "react";
import CrudTable from "../../components/admin/CrudTable";
import {
  STORE_KEY,
  getList,
  addItem,
  updateItem,
  deleteItem,
} from "../../data/adminStore";

export default function ManageAdmins() {
  const [rows, setRows] = useState([]);

  const reload = () => setRows(getList(STORE_KEY.admins));
  useEffect(() => reload(), []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 22 }}>Quản lý admin</div>
        <div style={{ color: "#6b7280" }}>
          CRUD + trạng thái + role (ADMIN/SUPER_ADMIN).
        </div>
      </div>

      <CrudTable
        title="Admins"
        data={rows}
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "fullName", label: "Họ tên", type: "text" },
          { key: "email", label: "Email", type: "text" },
          { key: "phone", label: "SĐT", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "createdAt", label: "Ngày tạo", type: "text" },
        ]}
        onAdd={(item) => {
          addItem(STORE_KEY.admins, { ...item, status: "ACTIVE" });
          reload();
        }}
        onUpdate={(id, patch) => {
          updateItem(STORE_KEY.admins, id, patch);
          reload();
        }}
        onDelete={(id) => {
          deleteItem(STORE_KEY.admins, id);
          reload();
        }}
        onToggleStatus={(id, current) => {
          updateItem(STORE_KEY.admins, id, {
            status: current === "ACTIVE" ? "LOCKED" : "ACTIVE",
          });
          reload();
        }}
        statusKey="status"
      />
    </div>
  );
}
