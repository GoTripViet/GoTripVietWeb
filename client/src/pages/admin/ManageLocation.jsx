import React, { useEffect, useMemo, useState } from "react";
import locationApi from "../../api/locationApi";

// --- HELPERS ---

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

  const imagesRaw = Array.isArray(x?.images) ? x.images : [];
  const images = imagesRaw
    .map((img) => (typeof img === "string" ? { url: img, public_id: "" } : img))
    .filter((img) => img?.url);

  const tags = Array.isArray(x?.tags) ? x.tags : [];

  return {
    ...x,
    id: x?.id || x?._id,
    images,
    tags,
    tags_csv: tags.join(", "),
    lng,
    lat,
    // Ensure status exists (default to active for old data)
    status: x?.status || "active",
    created_by: x?.created_by,
  };
}

function toPayload(form) {
  const tags =
    typeof form?.tags_csv === "string"
      ? form.tags_csv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const lng = Number(form?.lng ?? 0);
  const lat = Number(form?.lat ?? 0);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new Error("Tọa độ không hợp lệ.");
  }
  if (lng < -180 || lng > 180) {
    throw new Error("Kinh độ phải nằm trong khoảng -180 đến 180.");
  }
  if (lat < -90 || lat > 90) {
    throw new Error("Vĩ độ phải nằm trong khoảng -90 đến 90.");
  }

  return {
    name: form?.name?.trim(),
    country: form?.country?.trim() || "",
    description: form?.description || "",
    images: Array.isArray(form.images) ? form.images : [],
    tags,
    coordinates: { type: "Point", coordinates: [lng, lat] },
    // Admin can update status manually
    status: form.status, 
  };
}

// --- STYLES ---

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
  successBtn: {
    borderRadius: 12,
    border: "1px solid #bbf7d0",
    padding: "10px 12px",
    cursor: "pointer",
    background: "#f0fdf4",
    fontWeight: 900,
    color: "#16a34a",
    marginRight: 6,
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
  td: { padding: 10, borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" },
  empty: { color: "#9ca3af", fontSize: 12 },

  // Badges
  badgePending: {
    background: "#fffbeb",
    color: "#b45309",
    border: "1px solid #fcd34d",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 900,
    marginLeft: 6,
  },
  badgeActive: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 900,
  },

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
  select: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    background: "#fff",
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

// --- MAIN COMPONENT ---

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
    images: [],
    lng: 0,
    lat: 0,
    status: "active", // Default status
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
      const list = normalizeList(res).map(toRow);

      // Sorting: Pending requests first, then by date (implied or name)
      list.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        // Optional: Sort by created date if available, else by name
        return 0;
      });

      setRows(list);
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
      images: [],
      lng: 0,
      lat: 0,
      status: "active",
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
      images: Array.isArray(row?.images) ? row.images : [],
      lng: row?.lng ?? 0,
      lat: row?.lat ?? 0,
      status: row?.status || "active",
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

  // Quick Approve Function
  const approve = async (row) => {
    if (!confirm(`Duyệt địa điểm "${row.name}"?`)) return;
    try {
        await locationApi.update(row.id, { status: 'active' });
        await load();
    } catch (e) {
        alert("Lỗi duyệt: " + e.message);
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
      const public_id = res?.public_id || "";
      if (!url) throw new Error("Server không trả về liên kết ảnh");
      setForm((s) => ({
        ...s,
        images: [...(s.images || []), { url, public_id }],
      }));
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
    return Array.isArray(form.images)
      ? form.images.map((img) => img?.url).filter(Boolean)
      : [];
  }, [form.images]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.h1}>Quản lý địa điểm</div>
          <div style={styles.sub}>
            Duyệt các địa điểm Pending từ Partner và quản lý dữ liệu gốc.
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
              <th style={styles.th}>Tên / Trạng thái</th>
              <th style={styles.th}>Slug</th>
              <th style={styles.th}>Quốc gia</th>
              <th style={styles.th}>Ảnh</th>
              <th style={styles.th}>Tọa độ</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => {
                const isPending = x.status === 'pending';
                return (
                  <tr key={x.id || x._id} style={isPending ? {background: '#fffbf0'} : {}}>
                    <td style={styles.td}>
                        <div style={{fontWeight: 600, color: '#111'}}>{x.name}</div>
                        {isPending && <span style={styles.badgePending}>⏳ Chờ duyệt</span>}
                        {x.created_by && isPending && <div style={{fontSize: 11, color: '#666', marginTop: 4}}>Từ Partner</div>}
                    </td>
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
                      <code>{Number(x.lng).toFixed(4)}</code>,{" "}
                      <code>{Number(x.lat).toFixed(4)}</code>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* Approve Button for Pending Items */}
                      {isPending && (
                        <button style={styles.successBtn} onClick={() => approve(x)}>
                            ✓ Duyệt
                        </button>
                      )}

                      <button style={styles.btn} onClick={() => openEdit(x)}>
                        Sửa
                      </button>{" "}
                      <button style={styles.dangerBtn} onClick={() => remove(x.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
            })}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
             <div>
                <div style={styles.label}>Tên</div>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ví dụ: Đà Lạt"
                />
             </div>
             <div>
                <div style={styles.label}>Trạng thái</div>
                <select 
                    style={styles.select}
                    value={form.status}
                    onChange={(e) => setForm(s => ({...s, status: e.target.value}))}
                >
                    <option value="active">Active (Hoạt động)</option>
                    <option value="pending">Pending (Chờ duyệt)</option>
                    <option value="rejected">Rejected (Từ chối)</option>
                </select>
             </div>
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

              {(localPreview ||
                (Array.isArray(form.images) && form.images.length > 0)) && (
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

                  {(form.images || []).map((img) => (
                    <div
                      key={img.public_id || img.url}
                      style={{ position: "relative" }}
                    >
                      <img
                        src={img.url}
                        alt="location"
                        style={{
                          width: 120,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          display: "block",
                        }}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((s) => ({
                            ...s,
                            images: (s.images || []).filter(
                              (x) =>
                                (x.public_id || x.url) !==
                                (img.public_id || img.url)
                            ),
                          }))
                        }
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          border: "1px solid #fecaca",
                          background: "#fff",
                          color: "#b91c1c",
                          borderRadius: 10,
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        Xóa
                      </button>
                    </div>
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