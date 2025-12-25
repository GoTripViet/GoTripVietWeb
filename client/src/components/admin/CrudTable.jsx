import React, { useMemo, useState } from "react";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: "min(920px, 92vw)",
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 16, flex: 1 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ height: 1, background: "#e5e7eb", margin: "10px 0" }} />
        {children}
      </div>
    </div>
  );
}

// schema: [{ key, label, type: "text"|"number"|"textarea"|"boolean" }]
export default function CrudTable({
  title,
  data,
  schema,
  onAdd,
  onUpdate,
  onDelete,
  onToggleStatus,
  statusKey = "status",
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
  }, [data, q]);

  const startAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const obj = {};
    schema.forEach((f) => {
      if (f.type === "boolean") obj[f.key] = fd.get(f.key) === "on";
      else if (f.type === "number") obj[f.key] = Number(fd.get(f.key) || 0);
      else obj[f.key] = String(fd.get(f.key) || "");
    });

    if (editing?.id) onUpdate(editing.id, obj);
    else onAdd({ ...obj, [statusKey]: "ACTIVE" });

    setOpen(false);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 18, flex: 1 }}>{title}</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="tìm nhanh..."
          style={{
            width: 260,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: "10px 12px",
            outline: "none",
          }}
        />
        <button
          onClick={startAdd}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: 0,
            background: "#0b5fff",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          + Thêm
        </button>
      </div>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr>
              <th style={th}>#</th>
              {schema.map((f) => (
                <th key={f.key} style={th}>
                  {f.label}
                </th>
              ))}
              <th style={th}>Trạng thái</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={row.id || idx}>
                <td style={td}>{idx + 1}</td>
                {schema.map((f) => (
                  <td key={f.key} style={td}>
                    {f.type === "boolean"
                      ? row[f.key]
                        ? "✓"
                        : "—"
                      : String(row[f.key] ?? "")}
                  </td>
                ))}
                <td style={td}>
                  <button
                    onClick={() => onToggleStatus?.(row.id, row[statusKey])}
                    style={{
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                      padding: "6px 10px",
                      cursor: "pointer",
                      background:
                        row[statusKey] === "ACTIVE"
                          ? "rgba(16,185,129,0.12)"
                          : "rgba(239,68,68,0.10)",
                      fontWeight: 800,
                    }}
                    title="bấm để đổi trạng thái"
                  >
                    {row[statusKey] || "—"}
                  </button>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(row)} style={btn}>
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      style={{ ...btn, borderColor: "#fecaca" }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td style={td} colSpan={schema.length + 3}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editing?.id ? "Sửa dữ liệu" : "Thêm dữ liệu"}
        onClose={() => setOpen(false)}
      >
        <form
          onSubmit={submit}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {schema.map((f) => (
            <label
              key={f.key}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <span style={{ fontWeight: 800, fontSize: 13 }}>{f.label}</span>
              {f.type === "textarea" ? (
                <textarea
                  name={f.key}
                  defaultValue={editing?.[f.key] ?? ""}
                  rows={3}
                  style={input}
                />
              ) : f.type === "boolean" ? (
                <input
                  type="checkbox"
                  name={f.key}
                  defaultChecked={Boolean(editing?.[f.key])}
                  style={{ width: 18, height: 18 }}
                />
              ) : (
                <input
                  name={f.key}
                  type={f.type === "number" ? "number" : "text"}
                  defaultValue={editing?.[f.key] ?? ""}
                  style={input}
                />
              )}
            </label>
          ))}

          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ ...btn, padding: "10px 14px" }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                ...btn,
                padding: "10px 14px",
                background: "#0b5fff",
                color: "#fff",
                border: 0,
              }}
            >
              Lưu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 10px",
  fontSize: 12,
  color: "#6b7280",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};
const td = {
  padding: "10px 10px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
  fontSize: 13,
};
const input = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  padding: "10px 12px",
  outline: "none",
};
const btn = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  padding: "8px 10px",
  cursor: "pointer",
  background: "#fff",
  fontWeight: 800,
};
