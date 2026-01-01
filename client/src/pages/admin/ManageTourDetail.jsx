import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import catalogApi from "../../api/catalogApi";

const styles = {
  page: { display: "grid", gap: 14 },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  h1: { fontWeight: 900, fontSize: 22, letterSpacing: -0.2 },
  sub: { color: "#6b7280", fontSize: 12, lineHeight: 1.5 },
  btn: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "8px 10px",
    cursor: "pointer",
    background: "#fff",
    fontWeight: 900,
  },
  primaryBtn: {
    borderRadius: 12,
    border: "1px solid rgba(11,95,255,0.35)",
    padding: "8px 10px",
    cursor: "pointer",
    background: "rgba(11,95,255,0.08)",
    fontWeight: 900,
    color: "#0b5fff",
  },
  danger: { border: "1px solid #fecaca", background: "#fff", color: "#b91c1c" },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 0 rgba(16,24,40,0.04)",
  },
  cardHeader: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    background: "linear-gradient(180deg, #ffffff, #fafafa)",
  },
  cardTitle: { fontWeight: 900, fontSize: 14 },
  body: { padding: 12, display: "grid", gap: 10 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  label: { fontSize: 12, fontWeight: 900, color: "#374151" },

  value: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    lineHeight: 1.5,
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    outline: "none",
    width: "100%",
  },
  textarea: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    outline: "none",
    width: "100%",
    minHeight: 110,
    resize: "vertical",
    lineHeight: 1.5,
  },

  alert: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    lineHeight: 1.5,
  },
};

function pickFirstImage(images) {
  if (!images) return "";
  if (typeof images === "string") return images.split(",")[0]?.trim() || "";
  if (Array.isArray(images)) return images[0] || "";
  return "";
}

function normalizeOneResponse(res) {
  const a = res?.data ?? res;
  const b = a?.data ?? a;
  return b?.product ?? b?.item ?? b;
}

export default function ManageTourDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const isEdit = sp.get("mode") === "edit";

  const [tour, setTour] = useState(null);
  const [draft, setDraft] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const loadTour = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await catalogApi.getById(id);
      const t = normalizeOneResponse(res);
      setTour(t);
      setDraft(t ? structuredClone(t) : null);
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Không load được chi tiết tour."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const vm = useMemo(() => {
    if (!tour) return null;
    const td = tour?.tour_details || {};
    return {
      id: tour?._id || tour?.id,
      title: tour?.title || "",
      slug: tour?.slug || "",
      is_active: !!tour?.is_active,
      base_price: tour?.base_price ?? 0,
      description_short: tour?.description_short || "",
      description_long: tour?.description_long || "",
      images: tour?.images,
      tags: tour?.tags,
      partner_id: tour?.partner_id,
      location_ids: tour?.location_ids,
      category_ids: tour?.category_ids,
      sustainability_score: tour?.sustainability_score,

      tour_details: td,
    };
  }, [tour]);

  const dvm = useMemo(() => {
    if (!draft) return null;
    const td = draft?.tour_details || {};
    return { ...draft, tour_details: td };
  }, [draft]);

  const toView = () => {
    sp.delete("mode");
    setSp(sp, { replace: true });
    // reload để bỏ các thay đổi chưa lưu
    loadTour();
  };

  const toEdit = () => {
    sp.set("mode", "edit");
    setSp(sp, { replace: true });
  };

  const onSave = async () => {
    if (!dvm) return;
    if (!dvm.title?.trim()) return alert("Vui lòng nhập tiêu đề tour.");

    setSaving(true);
    setErr("");

    try {
      // Payload theo đúng shape DB của bạn (tour_details nested)
      // Bạn có thể giới hạn field gửi đi nếu backend yêu cầu.
      const payload = {
        product_type: "tour",
        partner_id: dvm.partner_id,
        location_ids: dvm.location_ids,
        category_ids: dvm.category_ids,
        title: dvm.title,
        slug: dvm.slug,
        description_short: dvm.description_short,
        description_long: dvm.description_long,
        images: dvm.images,
        tags: dvm.tags,
        sustainability_score: dvm.sustainability_score,
        base_price: Number(dvm.base_price || 0),
        is_active: !!dvm.is_active,
        tour_details: dvm.tour_details || {},
      };

      await catalogApi.update(id, payload); // bước 3 bên dưới
      await loadTour();
      // về view mode sau khi lưu
      sp.delete("mode");
      setSp(sp, { replace: true });
      alert("Đã lưu tour.");
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message || e?.message || "Không lưu được tour."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !tour)
    return <div style={styles.alert}>Đang tải chi tiết tour...</div>;

  if (err && !tour) {
    return (
      <div style={{ ...styles.alert, ...styles.danger }}>
        <b>Lỗi:</b> {err}
        <div
          style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <button style={styles.btn} onClick={() => nav("/admin/manage/tours")}>
            ← Danh sách
          </button>
          <button style={styles.btn} onClick={loadTour}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!vm) {
    return (
      <div style={styles.alert}>
        Không có dữ liệu tour.
        <div style={{ marginTop: 8 }}>
          <button style={styles.btn} onClick={() => nav("/admin/manage/tours")}>
            ← Danh sách
          </button>
        </div>
      </div>
    );
  }

  const img = pickFirstImage(vm.images);

  // helper render field: view vs edit
  const Field = ({
    label,
    value,
    onChange,
    type = "text",
    multiline = false,
  }) => (
    <div>
      <div style={styles.label}>{label}</div>
      {!isEdit ? (
        <div style={styles.value}>
          {value === undefined || value === null || value === ""
            ? "—"
            : String(value)}
        </div>
      ) : multiline ? (
        <textarea
          style={styles.textarea}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          style={styles.input}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>{vm.title || "Tour"}</div>
          <div style={styles.sub}>
            ID: {vm.id} • {vm.is_active ? "Đang hoạt động" : "Tạm ẩn"} •{" "}
            {isEdit ? "Đang chỉnh sửa" : "Xem chi tiết"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={styles.btn} onClick={() => nav("/admin/manage/tours")}>
            ← Danh sách
          </button>

          <button
            style={styles.btn}
            onClick={loadTour}
            disabled={loading || saving}
          >
            {loading ? "Đang tải..." : "↻ Tải lại"}
          </button>

          {!isEdit ? (
            <button style={styles.primaryBtn} onClick={toEdit}>
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button style={styles.btn} onClick={toView} disabled={saving}>
                Hủy
              </button>
              <button
                style={styles.primaryBtn}
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </>
          )}
        </div>
      </div>

      {err && tour ? (
        <div style={{ ...styles.alert, ...styles.danger }}>
          <b>Lỗi:</b> {err}
        </div>
      ) : null}

      {/* Product */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Thông tin chung</div>
        </div>
        <div style={styles.body}>
          <div style={styles.row2}>
            <Field
              label="Tiêu đề"
              value={isEdit ? dvm?.title : vm.title}
              onChange={(v) => setDraft((s) => ({ ...s, title: v }))}
            />
            <Field
              label="Slug"
              value={isEdit ? dvm?.slug : vm.slug}
              onChange={(v) => setDraft((s) => ({ ...s, slug: v }))}
            />
          </div>

          <div style={styles.row2}>
            <Field
              label="Giá cơ bản"
              type="number"
              value={isEdit ? dvm?.base_price : vm.base_price}
              onChange={(v) => setDraft((s) => ({ ...s, base_price: v }))}
            />
            <Field
              label="Sustainability score"
              type="number"
              value={
                isEdit ? dvm?.sustainability_score : vm.sustainability_score
              }
              onChange={(v) =>
                setDraft((s) => ({ ...s, sustainability_score: v }))
              }
            />
          </div>

          <div style={styles.row2}>
            <Field
              label="Partner ID"
              value={isEdit ? dvm?.partner_id : vm.partner_id}
              onChange={(v) => setDraft((s) => ({ ...s, partner_id: v }))}
            />
            <Field
              label="Images (Array)"
              value={
                isEdit
                  ? JSON.stringify(dvm?.images ?? [])
                  : JSON.stringify(vm.images ?? [])
              }
              onChange={(v) => {
                try {
                  setDraft((s) => ({ ...s, images: JSON.parse(v) }));
                } catch {
                  // cho nhập tạm, không crash
                }
              }}
            />
          </div>

          <div style={styles.row2}>
            <Field
              label="Tags (Array)"
              value={
                isEdit
                  ? JSON.stringify(dvm?.tags ?? [])
                  : JSON.stringify(vm.tags ?? [])
              }
              onChange={(v) => {
                try {
                  setDraft((s) => ({ ...s, tags: JSON.parse(v) }));
                } catch {}
              }}
            />
            <Field
              label="is_active"
              value={isEdit ? String(!!dvm?.is_active) : String(vm.is_active)}
              onChange={(v) =>
                setDraft((s) => ({ ...s, is_active: v === "true" }))
              }
            />
          </div>

          <div style={styles.row2}>
            <Field
              label="Location IDs (Array ObjectId)"
              value={
                isEdit
                  ? JSON.stringify(dvm?.location_ids ?? [])
                  : JSON.stringify(vm.location_ids ?? [])
              }
              onChange={(v) => {
                try {
                  setDraft((s) => ({ ...s, location_ids: JSON.parse(v) }));
                } catch {}
              }}
            />
            <Field
              label="Category IDs (Array ObjectId)"
              value={
                isEdit
                  ? JSON.stringify(dvm?.category_ids ?? [])
                  : JSON.stringify(vm.category_ids ?? [])
              }
              onChange={(v) => {
                try {
                  setDraft((s) => ({ ...s, category_ids: JSON.parse(v) }));
                } catch {}
              }}
            />
          </div>

          <Field
            label="Mô tả ngắn"
            multiline
            value={isEdit ? dvm?.description_short : vm.description_short}
            onChange={(v) => setDraft((s) => ({ ...s, description_short: v }))}
          />
          <Field
            label="Mô tả dài"
            multiline
            value={isEdit ? dvm?.description_long : vm.description_long}
            onChange={(v) => setDraft((s) => ({ ...s, description_long: v }))}
          />

          {!isEdit ? (
            <div style={styles.value}>
              Ảnh preview:{" "}
              {img ? (
                <img
                  src={img}
                  alt="thumb"
                  style={{ height: 42, borderRadius: 12, marginLeft: 8 }}
                />
              ) : (
                "—"
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* TOUR DETAILS */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Chi tiết tour (tour_details)</div>
        </div>
        <div style={styles.body}>
          <div style={styles.row2}>
            <Field
              label="duration_days"
              type="number"
              value={
                isEdit
                  ? dvm?.tour_details?.duration_days
                  : vm.tour_details?.duration_days
              }
              onChange={(v) =>
                setDraft((s) => ({
                  ...s,
                  tour_details: {
                    ...(s?.tour_details || {}),
                    duration_days: Number(v),
                  },
                }))
              }
            />
            <Field
              label="includes (Array)"
              value={
                isEdit
                  ? JSON.stringify(dvm?.tour_details?.includes ?? [])
                  : JSON.stringify(vm.tour_details?.includes ?? [])
              }
              onChange={(v) => {
                try {
                  setDraft((s) => ({
                    ...s,
                    tour_details: {
                      ...(s?.tour_details || {}),
                      includes: JSON.parse(v),
                    },
                  }));
                } catch {}
              }}
            />
          </div>

          <Field
            label="excludes (Array)"
            value={
              isEdit
                ? JSON.stringify(dvm?.tour_details?.excludes ?? [])
                : JSON.stringify(vm.tour_details?.excludes ?? [])
            }
            onChange={(v) => {
              try {
                setDraft((s) => ({
                  ...s,
                  tour_details: {
                    ...(s?.tour_details || {}),
                    excludes: JSON.parse(v),
                  },
                }));
              } catch {}
            }}
          />

          <Field
            label="itinerary (Array objects)"
            multiline
            value={
              isEdit
                ? JSON.stringify(dvm?.tour_details?.itinerary ?? [], null, 2)
                : JSON.stringify(vm.tour_details?.itinerary ?? [], null, 2)
            }
            onChange={(v) => {
              try {
                setDraft((s) => ({
                  ...s,
                  tour_details: {
                    ...(s?.tour_details || {}),
                    itinerary: JSON.parse(v),
                  },
                }));
              } catch {}
            }}
          />
        </div>
      </div>
    </div>
  );
}
