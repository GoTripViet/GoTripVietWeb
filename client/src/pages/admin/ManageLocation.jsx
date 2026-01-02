import React, { useEffect, useMemo, useState } from "react";
import locationApi from "../../api/locationApi";

function normalizeList(res) {
  const a = res?.data ?? res;
  const b = a?.data ?? a;
  if (Array.isArray(b)) return b;
  if (Array.isArray(b?.items)) return b.items;
  if (Array.isArray(b?.locations)) return b.locations;
  if (Array.isArray(b?.results)) return b.results;
  return [];
}

function toRow(x) {
  const coords = x?.coordinates?.coordinates || [0, 0];
  const lng = coords?.[0] ?? 0;
  const lat = coords?.[1] ?? 0;

  const images = Array.isArray(x?.images) ? x.images : [];
  const tags = Array.isArray(x?.tags) ? x.tags : [];

  return {
    ...x,
    id: x?.id || x?._id,
    images,
    tags,
    images_csv: images.join(", "),
    tags_csv: tags.join(", "),
    lng,
    lat,
  };
}

function toPayload(form) {
  const images =
    typeof form?.images_csv === "string"
      ? form.images_csv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const tags =
    typeof form?.tags_csv === "string"
      ? form.tags_csv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const lng = Number(form?.lng ?? 0);
  const lat = Number(form?.lat ?? 0);

  return {
    name: form?.name?.trim(),
    country: form?.country?.trim() || "",
    description: form?.description || "",
    images,
    tags,
    coordinates: { type: "Point", coordinates: [lng, lat] },
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
  empty: { color: "#9ca3af", fontSize: 12 },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 50,
  },
  modal: {
    width: "min(860px, calc(100vw - 24px))",
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
    minHeight: 0,
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

export default function ManageLocation() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    country: "",
    description: "",
    tags_csv: "",
    images_csv: "",
    lng: 0,
    lat: 0,
  });

  const [uploadingImg, setUploadingImg] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await locationApi.getAll();
      setRows(normalizeList(res).map(toRow));
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Không tải được địa điểm"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      country: "",
      description: "",
      tags_csv: "",
      images_csv: "",
      lng: 0,
      lat: 0,
    });
    setLocalPreview("");
    setEditOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row?.name || "",
      country: row?.country || "",
      description: row?.description || "",
      tags_csv: row?.tags_csv || "",
      images_csv: row?.images_csv || "",
      lng: row?.lng ?? 0,
      lat: row?.lat ?? 0,
    });
    setLocalPreview("");
    setEditOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return alert("Vui lòng nhập tên địa điểm.");

    try {
      const payload = toPayload(form);
      if (!editing) await locationApi.create(payload);
      else await locationApi.update(editing.id, payload);

      setEditOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Lưu địa điểm thất bại"
      );
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa địa điểm này?")) return;
    try {
      await locationApi.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Xóa địa điểm thất bại"
      );
    }
  };

  const appendImageUrlToForm = (url) => {
    setForm((s) => {
      const current = (s.images_csv || "").trim();
      const next = current ? `${current}, ${url}` : url;
      return { ...s, images_csv: next };
    });
  };

  const pickAndUploadOne = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) return alert("Chỉ nhận file ảnh.");

    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      // axiosClient unwrap => res = {url,...}
      const res = await locationApi.uploadLocationImage(fd);
      const url = res?.url;
      if (!url) throw new Error("Server không trả về liên kết ảnh");

      appendImageUrlToForm(url);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Upload ảnh thất bại");
    } finally {
      setUploadingImg(false);
    }
  };

  const pickAndUploadMany = async (files) => {
    const list = Array.from(files || []).filter(Boolean);
    for (const f of list) {
      await pickAndUploadOne(f);
    }
  };

  const onDropImage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await pickAndUploadMany(e.dataTransfer.files);
  };

  const imagesPreview = useMemo(() => {
    return typeof form.images_csv === "string"
      ? form.images_csv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }, [form.images_csv]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.h1}>Quản lý địa điểm</div>
          <div style={styles.sub}>
            Gồm: tên, slug tự động, quốc gia, mô tả, ảnh, thẻ, tọa độ.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={load} style={styles.btn} disabled={loading}>
            {loading ? "Đang tải..." : "↻ Tải lại"}
          </button>
          <button onClick={openCreate} style={styles.primaryBtn}>
            + Thêm địa điểm
          </button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tên</th>
              <th style={styles.th}>Slug</th>
              <th style={styles.th}>Quốc gia</th>
              <th style={styles.th}>Ảnh</th>
              <th style={styles.th}>Tọa độ</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id || x._id}>
                <td style={styles.td}>{x.name}</td>
                <td style={styles.td}>
                  {x.slug ? (
                    <code>{x.slug}</code>
                  ) : (
                    <span style={styles.empty}>Tự động</span>
                  )}
                </td>
                <td style={styles.td}>
                  {x.country || <span style={styles.empty}>—</span>}
                </td>
                <td style={styles.td}>
                  {Array.isArray(x.images) && x.images.length ? (
                    <span>{x.images.length} ảnh</span>
                  ) : (
                    <span style={styles.empty}>—</span>
                  )}
                </td>
                <td style={styles.td}>
                  <code>{Number(x.lng).toFixed(6)}</code>,{" "}
                  <code>{Number(x.lat).toFixed(6)}</code>
                </td>
                <td
                  style={{
                    ...styles.td,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
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
                <td style={styles.td} colSpan={6}>
                  Chưa có địa điểm nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal
        open={editOpen}
        title={editing ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"}
        onClose={() => setEditOpen(false)}
      >
        <div style={styles.modalBody}>
          <div>
            <div style={styles.label}>Tên</div>
            <input
              style={styles.input}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ví dụ: Đà Lạt"
            />
            <div style={styles.sub}>Slug sẽ tự tạo từ tên khi lưu.</div>
          </div>

          <div>
            <div style={styles.label}>Quốc gia</div>
            <input
              style={styles.input}
              value={form.country}
              onChange={(e) =>
                setForm((s) => ({ ...s, country: e.target.value }))
              }
              placeholder="Ví dụ: Việt Nam"
            />
          </div>

          <div>
            <div style={styles.label}>Mô tả</div>
            <textarea
              style={styles.textarea}
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Mô tả ngắn..."
            />
          </div>

          <div>
            <div style={styles.label}>Thẻ</div>
            <input
              style={styles.input}
              value={form.tags_csv}
              onChange={(e) =>
                setForm((s) => ({ ...s, tags_csv: e.target.value }))
              }
              placeholder="Ví dụ: biển, nghỉ dưỡng, check-in"
            />
            <div style={styles.sub}>
              Nhập nhiều thẻ, ngăn cách bằng dấu phẩy.
            </div>
          </div>

          <div>
            <div style={styles.label}>Ảnh</div>
            <textarea
              style={styles.textarea}
              value={form.images_csv}
              onChange={(e) =>
                setForm((s) => ({ ...s, images_csv: e.target.value }))
              }
              placeholder="Dán các liên kết ảnh, ngăn cách bằng dấu phẩy"
            />

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
                Kéo & thả ảnh vào đây, hoặc bấm chọn ảnh từ máy
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
                  {uploadingImg ? "Đang tải ảnh lên..." : "Chọn ảnh"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={(e) => pickAndUploadMany(e.target.files)}
                    disabled={uploadingImg}
                  />
                </label>
                <span style={styles.sub}>
                  {uploadingImg ? "Vui lòng chờ..." : "Tối đa 5MB mỗi ảnh"}
                </span>
              </div>

              {(localPreview || imagesPreview.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {localPreview ? (
                    <img
                      src={localPreview}
                      alt="preview"
                      style={{
                        width: 120,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : null}

                  {imagesPreview.map((u) => (
                    <img
                      key={u}
                      src={u}
                      alt="location"
                      style={{
                        width: 120,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <div>
              <div style={styles.label}>Kinh độ</div>
              <input
                style={styles.input}
                type="number"
                value={form.lng}
                onChange={(e) =>
                  setForm((s) => ({ ...s, lng: e.target.value }))
                }
                placeholder="Ví dụ: 108.4583"
              />
            </div>
            <div>
              <div style={styles.label}>Vĩ độ</div>
              <input
                style={styles.input}
                type="number"
                value={form.lat}
                onChange={(e) =>
                  setForm((s) => ({ ...s, lat: e.target.value }))
                }
                placeholder="Ví dụ: 11.9404"
              />
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btn} onClick={() => setEditOpen(false)}>
            Hủy
          </button>
          <button
            style={styles.primaryBtn}
            onClick={save}
            disabled={uploadingImg}
          >
            Lưu
          </button>
        </div>
      </Modal>
    </div>
  );
}
