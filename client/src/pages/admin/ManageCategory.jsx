import React, { useEffect, useMemo, useState } from "react";
import categoryApi from "../../api/categoryApi";

function normalizeList(res) {
  const a = res?.data ?? res;
  const b = a?.data ?? a;
  if (Array.isArray(b)) return b;
  if (Array.isArray(b?.items)) return b.items;
  if (Array.isArray(b?.categories)) return b.categories;
  if (Array.isArray(b?.results)) return b.results;
  return [];
}

function normalizeImage(img) {
  if (!img) return { url: "", public_id: "" };
  if (typeof img === "string") return { url: img, public_id: "" }; // dữ liệu cũ
  return {
    url: img?.url || "",
    public_id: img?.public_id || "",
  };
}

// Map API -> row UI
function toRow(x) {
  const parentObj =
    typeof x?.parent === "object" && x?.parent !== null ? x.parent : null;

  const image = normalizeImage(x?.image);
  return {
    ...x,
    id: x?.id || x?._id,
    // backend lưu parent là ObjectId, nếu populate thì parent là object
    parentId: parentObj?._id || x?.parent || null,
    parentName: parentObj?.name || "",
    // slug do backend auto, UI chỉ hiển thị
    slug: x?.slug || "",
    image,
    imageUrl: image.url,
  };
}

// Payload gửi lên backend: KHÔNG gửi slug (vì backend auto tạo theo name)
function toPayload(row) {
  return {
    name: row?.name?.trim(),
    parent: row?.parentId || null,
    description: row?.description || "",
    image: row?.image || { url: "", public_id: "" }, // ✅ gửi object
  };
}

const styles = {
  page: { display: "grid", gap: 12 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  h1: { fontWeight: 900, fontSize: 22 },
  sub: { color: "#6b7280", fontSize: 12, lineHeight: 1.5 },

  btn: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  primaryBtn: {
    borderRadius: 12,
    border: "1px solid rgba(11,95,255,0.35)",
    padding: "10px 12px",
    cursor: "pointer",
    background: "rgba(11,95,255,0.08)",
    fontWeight: 900,
    color: "#0b5fff",
  },
  dangerBtn: {
    borderRadius: 12,
    border: "1px solid #fecaca",
    padding: "10px 12px",
    cursor: "pointer",
    background: "#fff",
    fontWeight: 900,
    color: "#b91c1c",
  },

  tableWrap: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    padding: 10,
    borderBottom: "1px solid #e5e7eb",
    background: "#fafafa",
    whiteSpace: "nowrap",
  },
  td: { padding: 10, borderBottom: "1px solid #f3f4f6", verticalAlign: "top" },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 50,
  },
  modal: {
    width: "min(760px, calc(100vw - 24px))",
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    maxHeight: "calc(100vh - 24px)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(180deg,#fff,#fafafa)",
    gap: 10,
  },
  modalBody: {
    padding: 12,
    display: "grid",
    gap: 10,
    overflowY: "auto",
    flex: "1 1 auto",
  },
  modalFooter: {
    padding: 12,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  label: { fontSize: 12, fontWeight: 900, color: "#374151" },
  input: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
  },
  textarea: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    minHeight: 90,
    resize: "vertical",
    lineHeight: 1.5,
  },
  badge: (bg, color) => ({
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: bg,
    color,
    border: "1px solid rgba(0,0,0,0.06)",
    fontWeight: 900,
    display: "inline-block",
  }),
  empty: { color: "#9ca3af", fontSize: 12 },
};

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={styles.overlay}
      onMouseDown={onClose}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div
        style={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <div style={styles.modalHeader}>
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button style={styles.btn} onClick={onClose} type="button">
            Đóng
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ManageCategory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    parentId: "",
    description: "",
    image: { url: "", public_id: "" },
  });

  /// Cloudinary
  const [uploadingImg, setUploadingImg] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      const list = normalizeList(res).map(toRow);

      // Map parentName nếu backend KHÔNG populate parent
      const idToName = new Map(list.map((c) => [c.id, c.name]));
      const list2 = list.map((c) => ({
        ...c,
        parentName:
          c.parentName || (c.parentId ? idToName.get(c.parentId) || "" : ""),
      }));

      setRows(list2);
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Không tải được danh mục"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const parentOptions = useMemo(() => {
    // dropdown chọn danh mục cha
    return rows.map((c) => ({ id: c.id, name: c.name }));
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      parentId: "",
      description: "",
      image: { url: "", public_id: "" },
    });
    setLocalPreview("");
    setEditOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row?.name || "",
      parentId: row?.parentId || "",
      description: row?.description || "",
      image: row?.image || { url: "", public_id: "" }, // row.image đã normalize ở toRow
    });
    setLocalPreview("");
    setEditOpen(true);
  };

  const openDetail = (row) => {
    setDetailRow(row);
    setDetailOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return alert("Vui lòng nhập tên danh mục.");

    // tự chặn chọn parent = chính nó
    if (editing?.id && form.parentId && form.parentId === editing.id) {
      return alert("Danh mục cha không thể là chính nó.");
    }

    try {
      const payload = toPayload({
        ...editing,
        ...form,
        parentId: form.parentId || null,
      });

      if (!editing) {
        await categoryApi.create(payload);
      } else {
        await categoryApi.update(editing.id, payload);
      }

      setEditOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Lưu danh mục thất bại"
      );
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await categoryApi.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Xóa danh mục thất bại"
      );
    }
  };

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const pickAndUpload = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) return alert("Chỉ nhận file ảnh.");

    // preview ngay cho user
    if (localPreview) URL.revokeObjectURL(localPreview);
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await categoryApi.uploadCategoryImage(fd);
      // axiosClient unwrap => res = { url, public_id }
      const url = res?.url;
      const public_id = res?.public_id || "";
      if (!url) throw new Error("Server không trả về url");

      setForm((s) => ({ ...s, image: { url, public_id } }));
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Upload ảnh thất bại");
    } finally {
      setUploadingImg(false);
    }
  };

  const onDropImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    pickAndUpload(file);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.h1}>Quản lý danh mục</div>
          <div style={styles.sub}>
            * <b>Slug</b> được backend tự tạo từ <b>Tên danh mục</b> (tự động,
            không cần nhập).
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={load} style={styles.btn} disabled={loading}>
            {loading ? "Đang tải..." : "↻ Tải lại"}
          </button>
          <button onClick={openCreate} style={styles.primaryBtn}>
            + Thêm danh mục
          </button>
        </div>
      </div>

      {/* BẢNG LIST (không hiển thị image ở đây) */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tên danh mục</th>
              <th style={styles.th}>Slug</th>
              <th style={styles.th}>Danh mục cha</th>
              <th style={styles.th}>Mô tả</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id || x._id}>
                <td style={styles.td}>
                  <span style={styles.badge("rgba(11,95,255,0.10)", "#0b5fff")}>
                    {x.name}
                  </span>
                </td>
                <td style={styles.td}>
                  {x.slug ? (
                    <code>{x.slug}</code>
                  ) : (
                    <span style={styles.empty}>Tự động</span>
                  )}
                </td>
                <td style={styles.td}>
                  {x.parentName || <span style={styles.empty}>—</span>}
                </td>
                <td style={styles.td}>
                  {x.description ? (
                    <span>{x.description}</span>
                  ) : (
                    <span style={styles.empty}>—</span>
                  )}
                </td>
                <td
                  style={{
                    ...styles.td,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  <button style={styles.btn} onClick={() => openDetail(x)}>
                    Chi tiết
                  </button>{" "}
                  <button style={styles.btn} onClick={() => openEdit(x)}>
                    Chỉnh sửa
                  </button>{" "}
                  <button style={styles.dangerBtn} onClick={() => remove(x.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={5}>
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT (hiển thị image ở đây) */}
      <Modal
        open={detailOpen}
        title="Chi tiết danh mục"
        onClose={() => setDetailOpen(false)}
      >
        <div style={styles.modalBody}>
          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Tên danh mục</div>
              <div style={styles.value}>{detailRow?.name || "—"}</div>
            </div>
            <div>
              <div style={styles.label}>Slug</div>
              <div style={styles.value}>{detailRow?.slug || "—"}</div>
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Danh mục cha</div>
              <div style={styles.value}>{detailRow?.parentName || "—"}</div>
            </div>
            <div>
              <div style={styles.label}>Ảnh</div>
              <div style={styles.value}>
                {detailRow?.image?.url ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <div>
                      <code>{detailRow.image.url}</code>
                    </div>
                    <img
                      src={detailRow.image.url}
                      alt="category"
                      style={{
                        width: "100%",
                        maxHeight: "60vh",
                        objectFit: "contain",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        display: "block",
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          <div>
            <div style={styles.label}>Mô tả</div>
            <div style={styles.value}>{detailRow?.description || "—"}</div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btn} onClick={() => setDetailOpen(false)}>
            Đóng
          </button>
          <button
            style={styles.primaryBtn}
            onClick={() => {
              setDetailOpen(false);
              openEdit(detailRow);
            }}
          >
            Chỉnh sửa
          </button>
        </div>
      </Modal>

      {/* MODAL THÊM/SỬA */}
      <Modal
        open={editOpen}
        title={editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        onClose={() => setEditOpen(false)}
      >
        <div style={styles.modalBody}>
          <div>
            <div style={styles.label}>Tên danh mục</div>
            <input
              style={styles.input}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="VD: Tour Biển"
            />
            <div style={styles.sub}>
              Slug sẽ tự tạo từ tên danh mục khi lưu.
            </div>
          </div>

          <div>
            <div style={styles.label}>Danh mục cha</div>
            <select
              style={styles.input}
              value={form.parentId || ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, parentId: e.target.value }))
              }
            >
              <option value="">— Không có (cấp 1) —</option>
              {parentOptions
                .filter((p) => !editing || p.id !== editing.id) // không cho chọn chính nó
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div style={styles.label}>Mô tả</div>
            <textarea
              style={styles.textarea}
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Mô tả ngắn cho danh mục..."
            />
          </div>

          <div>
            <div style={styles.label}>Ảnh</div>
            {/* 2) khu vực kéo/thả */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDropImage}
              style={{
                marginTop: 10,
                border: "2px dashed #e5e7eb",
                borderRadius: 12,
                padding: 12,
                display: "grid",
                gap: 10,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                Kéo & thả ảnh vào đây, hoặc bấm chọn file
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <label
                  style={{ ...styles.primaryBtn, display: "inline-block" }}
                >
                  {uploadingImg ? "Đang upload..." : "Chọn ảnh từ máy"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => pickAndUpload(e.target.files?.[0])}
                    disabled={uploadingImg}
                  />
                </label>

                <span style={styles.sub}>
                  {uploadingImg
                    ? "Vui lòng chờ upload xong..."
                    : "Tối đa 5MB, định dạng ảnh"}
                </span>
              </div>

              {/* 3) preview */}
              {(localPreview || form.image?.url) && (
                <img
                  src={localPreview || form.image.url}
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: "40vh",
                    objectFit: "contain",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              {form.image?.url ? (
                <button
                  type="button"
                  style={styles.dangerBtn}
                  onClick={() => {
                    // chỉ xóa trong form; bấm Lưu => backend sẽ destroy ảnh cũ theo public_id
                    setForm((s) => ({
                      ...s,
                      image: { url: "", public_id: "" },
                    }));
                    setLocalPreview("");
                  }}
                  disabled={uploadingImg}
                >
                  Xóa ảnh
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btn} onClick={() => setEditOpen(false)}>
            Hủy
          </button>
          <button style={styles.primaryBtn} onClick={save}>
            Lưu
          </button>
        </div>
      </Modal>
    </div>
  );
}
