import React, { useEffect, useState } from "react";
import CrudTable from "../../components/admin/CrudTable";
import {
  STORE_KEY,
  getList,
  addItem,
  updateItem,
  deleteItem,
} from "../../data/adminStore";

export default function ManageUsers() {
  const [rows, setRows] = useState([]);

  const reload = () => setRows(getList(STORE_KEY.users));
  useEffect(() => reload(), []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 22 }}>Quản lý người dùng</div>
        <div style={{ color: "#6b7280" }}>CRUD + khóa/mở tài khoản.</div>
      </div>

      <CrudTable
        title="Users"
        data={rows}
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "fullName", label: "Họ tên", type: "text" },
          { key: "email", label: "Email", type: "text" },
          { key: "phone", label: "SĐT", type: "text" },
          { key: "createdAt", label: "Ngày tạo", type: "text" },
        ]}
        onAdd={(item) => {
          addItem(STORE_KEY.users, { ...item, status: "ACTIVE" });
          reload();
        }}
        onUpdate={(id, patch) => {
          updateItem(STORE_KEY.users, id, patch);
          reload();
        }}
        onDelete={(id) => {
          deleteItem(STORE_KEY.users, id);
          reload();
        }}
        onToggleStatus={(id, current) => {
          updateItem(STORE_KEY.users, id, {
            status: current === "ACTIVE" ? "BANNED" : "ACTIVE",
          });
          reload();
        }}
        statusKey="status"
      />
    </div>
  );
}
