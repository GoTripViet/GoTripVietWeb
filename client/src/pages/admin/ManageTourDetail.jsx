import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import catalogApi from "../../api/catalogApi";
import locationApi from "../../api/locationApi";
import categoryApi from "../../api/categoryApi";

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

  // images UI
  drop: {
    border: "2px dashed #e5e7eb",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gap: 10,
    background: "#fafafa",
  },
  thumbWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  thumbBox: { position: "relative" },
  thumb: {
    width: 120,
    height: 90,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "block",
  },
  delBtn: {
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
  },
};

function normalizeOneResponse(res) {
  const a = res?.data ?? res;
  const b = a?.data ?? a;
  return b?.product ?? b?.item ?? b;
}

function normalizeList(res) {
  const a = res?.data ?? res;
  const b = a?.data ?? a;
  if (Array.isArray(b)) return b;
  if (Array.isArray(b?.items)) return b.items;
  if (Array.isArray(b?.locations)) return b.locations;
  if (Array.isArray(b?.categories)) return b.categories;
  if (Array.isArray(b?.results)) return b.results;
  return [];
}

function normalizeImages(images) {
  if (!images) return [];
  if (typeof images === "string") {
    return images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url) => ({ url, public_id: "" }));
  }
  if (Array.isArray(images)) {
    return images
      .map((x) => (typeof x === "string" ? { url: x, public_id: "" } : x))
      .filter((x) => x?.url);
  }
  return [];
}

function pickFirstImage(images) {
  const arr = normalizeImages(images);
  return arr[0]?.url || "";
}

function joinNamesByIds(ids, options) {
  const map = new Map(
    (options || []).map((x) => [String(x.id || x._id), x.name])
  );
  return (ids || [])
    .map((id) => map.get(String(id)) || String(id))
    .filter(Boolean)
    .join(", ");
}

function toId(v) {
  return typeof v === "string" ? v : v?._id || v?.id || "";
}

function normalizeIdArray(arr) {
  return Array.isArray(arr) ? arr.map(toId).filter(Boolean) : [];
}

function ItineraryEditor({ value, onChange, disabled }) {
  const list = Array.isArray(value) ? value : [];

  const renumber = (arr) => arr.map((x, idx) => ({ ...x, day: idx + 1 }));

  const addDay = () => {
    const next = renumber([
      ...list,
      { day: list.length + 1, title: "", details: "", meals: [] },
    ]);
    onChange(next);
  };

  const removeDay = (idx) => {
    const next = renumber(list.filter((_, i) => i !== idx));
    onChange(next);
  };

  const setField = (idx, patch) => {
    const next = list.map((x, i) => (i === idx ? { ...x, ...patch } : x));
    onChange(next);
  };

  const toggleMeal = (idx, meal) => {
    const cur = list[idx]?.meals;
    const arr = Array.isArray(cur) ? cur : [];
    const has = arr.includes(meal);
    const nextMeals = has ? arr.filter((m) => m !== meal) : [...arr, meal];
    setField(idx, { meals: nextMeals });
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {list.map((it, idx) => (
        <div
          key={it.day ?? idx}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
          >
            <div style={{ fontWeight: 900 }}>Ngày {idx + 1}</div>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.danger }}
              onClick={() => removeDay(idx)}
              disabled={disabled}
            >
              Xóa ngày
            </button>
          </div>

          <div>
            <div style={styles.label}>Tiêu đề</div>
            <input
              style={styles.input}
              value={it?.title ?? ""}
              onChange={(e) => setField(idx, { title: e.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: Tham quan trung tâm..."
            />
          </div>

          <div>
            <div style={styles.label}>Chi tiết</div>
            <textarea
              style={styles.textarea}
              value={it?.details ?? ""}
              onChange={(e) => setField(idx, { details: e.target.value })}
              disabled={disabled}
              placeholder="Mô tả hoạt động trong ngày..."
            />
          </div>

          <div>
            <div style={styles.label}>Bữa ăn</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Sáng", "Trưa", "Chiều"].map((m) => (
                <label
                  key={m}
                  style={{ display: "flex", gap: 6, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(it?.meals) ? it.meals.includes(m) : false
                    }
                    onChange={() => toggleMeal(idx, m)}
                    disabled={disabled}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        style={styles.primaryBtn}
        onClick={addDay}
        disabled={disabled}
      >
        + Thêm ngày
      </button>
    </div>
  );
}

export default function ManageTourDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const isEdit = sp.get("mode") === "edit";

  const [tour, setTour] = useState(null);
  const [draft, setDraft] = useState(null);

  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [uploadingImg, setUploadingImg] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [localCoverPreview, setLocalCoverPreview] = useState("");

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
      if (localCoverPreview) URL.revokeObjectURL(localCoverPreview);
    };
  }, [localPreview, localCoverPreview]);

  const loadOptions = async () => {
    try {
      const [lr, cr] = await Promise.all([
        locationApi.getAll(),
        categoryApi.getAll(),
      ]);
      setLocations(normalizeList(lr).map((x) => ({ ...x, id: x.id || x._id })));
      setCategories(
        normalizeList(cr).map((x) => ({ ...x, id: x.id || x._id }))
      );
    } catch (e) {
      console.error(e);
      // không chặn UI, chỉ log
    }
  };

  const loadTour = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await catalogApi.getById(id);
      const t = normalizeOneResponse(res);

      // normalize images về object array
      const fixed = t
        ? {
            ...t,
            images: normalizeImages(t.images),
            tags: Array.isArray(t.tags) ? t.tags : [],
            location_ids: normalizeIdArray(t.location_ids),
            category_ids: normalizeIdArray(t.category_ids),
            tour_details: {
              ...(t.tour_details || {}),
              includes: Array.isArray(t?.tour_details?.includes)
                ? t.tour_details.includes
                : [],
              excludes: Array.isArray(t?.tour_details?.excludes)
                ? t.tour_details.excludes
                : [],
              itinerary: Array.isArray(t?.tour_details?.itinerary)
                ? t.tour_details.itinerary
                : [],
            },
          }
        : null;

      setTour(fixed);
      setDraft(fixed ? structuredClone(fixed) : null);
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Không tải được chi tiết tour."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
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
      images: normalizeImages(tour?.images),
      tags: Array.isArray(tour?.tags) ? tour.tags : [],
      partner_id: tour?.partner_id || "",
      location_ids: normalizeIdArray(tour?.location_ids),
      category_ids: normalizeIdArray(tour?.category_ids),
      sustainability_score: tour?.sustainability_score ?? 0,
      tour_details: td,
    };
  }, [tour]);

  const dvm = useMemo(() => {
    if (!draft) return null;
    return {
      ...draft,
      images: normalizeImages(draft.images),
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      location_ids: normalizeIdArray(draft?.location_ids),
      category_ids: normalizeIdArray(draft?.category_ids),
      tour_details: {
        ...(draft.tour_details || {}),
        includes: Array.isArray(draft?.tour_details?.includes)
          ? draft.tour_details.includes
          : [],
        excludes: Array.isArray(draft?.tour_details?.excludes)
          ? draft.tour_details.excludes
          : [],
        itinerary: Array.isArray(draft?.tour_details?.itinerary)
          ? draft.tour_details.itinerary
          : [],
      },
    };
  }, [draft]);

  const toView = () => {
    sp.delete("mode");
    setSp(sp, { replace: true });
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
      const payload = {
        product_type: "tour",
        partner_id: dvm.partner_id,
        location_ids: normalizeIdArray(dvm.location_ids),
        category_ids: normalizeIdArray(dvm.category_ids),
        title: dvm.title,
        slug: dvm.slug,
        description_short: dvm.description_short,
        description_long: dvm.description_long,
        images: normalizeImages(dvm.images),
        tags: dvm.tags,
        sustainability_score: Number(dvm.sustainability_score || 0),
        base_price: Number(dvm.base_price || 0),
        is_active: !!dvm.is_active,
        tour_details: dvm.tour_details || {},
      };
      console.log("SAVE payload", payload);
      await catalogApi.update(id, payload);
      await loadTour();
      sp.delete("mode");
      setSp(sp, { replace: true });
      alert("Đã lưu tour.");
    } catch (e) {
      console.error(e);
      console.error("SAVE error response:", e?.response?.data);
      console.error("SAVE error message:", e?.response?.data?.message);
      setErr(
        e?.response?.data?.message || e?.message || "Không lưu được tour."
      );
    } finally {
      setSaving(false);
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

      const res = await catalogApi.uploadTourImage(fd); // {url, public_id}
      const url = res?.url;
      const public_id = res?.public_id || "";
      if (!url) throw new Error("Server không trả về liên kết ảnh");

      setDraft((s) => ({
        ...s,
        images: [...normalizeImages(s?.images), { url, public_id }],
      }));
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Upload ảnh thất bại");
    } finally {
      setUploadingImg(false);
    }
  };

  const pickAndUploadCover = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) return alert("Chỉ nhận file ảnh.");

    if (localCoverPreview) URL.revokeObjectURL(localCoverPreview);
    setLocalCoverPreview(URL.createObjectURL(file));

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await catalogApi.uploadTourImage(fd);
      const url = res?.url;
      const public_id = res?.public_id || "";
      if (!url) throw new Error("Server không trả về liên kết ảnh");

      setDraft((s) => {
        const imgs = normalizeImages(s?.images);
        // đưa ảnh mới lên đầu
        const rest = imgs.filter(
          (x) => (x.public_id || x.url) !== (public_id || url)
        );
        return { ...s, images: [{ url, public_id }, ...rest] };
      });
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Upload ảnh đại diện thất bại"
      );
    } finally {
      setUploadingImg(false);
    }
  };

  const removeCoverFromDraft = () => {
    setDraft((s) => {
      const imgs = normalizeImages(s?.images);
      return { ...s, images: imgs.slice(1) }; // bỏ ảnh đầu
    });
    if (localCoverPreview) {
      URL.revokeObjectURL(localCoverPreview);
      setLocalCoverPreview("");
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

  const removeImageFromDraft = (img) => {
    setDraft((s) => ({
      ...s,
      images: normalizeImages(s?.images).filter(
        (x) => (x.public_id || x.url) !== (img.public_id || img.url)
      ),
    }));
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
          disabled={saving}
        />
      ) : (
        <input
          style={styles.input}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={saving}
        />
      )}
    </div>
  );

  // tags helper
  const tagsText = isEdit
    ? (dvm?.tags || []).join(", ")
    : (vm.tags || []).join(", ");
  const setTagsText = (txt) => {
    const arr = String(txt || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setDraft((s) => ({ ...s, tags: arr }));
  };

  // includes/excludes helper
  const includesText = (arr) => (Array.isArray(arr) ? arr.join("\n") : "");
  const setIncludesText = (txt) => {
    const arr = String(txt || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setDraft((s) => ({
      ...s,
      tour_details: { ...(s?.tour_details || {}), includes: arr },
    }));
  };

  const setExcludesText = (txt) => {
    const arr = String(txt || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setDraft((s) => ({
      ...s,
      tour_details: { ...(s?.tour_details || {}), excludes: arr },
    }));
  };

  const setMultiSelect = (key, selectedOptions) => {
    const ids = Array.from(selectedOptions).map((o) => o.value);
    setDraft((s) => ({ ...s, [key]: ids }));
  };

  const locationNames = joinNamesByIds(vm.location_ids, locations);
  const categoryNames = joinNamesByIds(vm.category_ids, categories);

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>{vm.title || "Tour"}</div>
          <div style={styles.sub}>
            Mã: {vm.id} • {vm.is_active ? "Đang hoạt động" : "Tạm ẩn"} •{" "}
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
                disabled={saving || uploadingImg}
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

      {/* THÔNG TIN CHUNG */}
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
              label="Điểm bền vững"
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
              label="Mã đối tác"
              value={isEdit ? dvm?.partner_id : vm.partner_id}
              onChange={(v) => setDraft((s) => ({ ...s, partner_id: v }))}
            />

            <div>
              <div style={styles.label}>Trạng thái</div>
              {!isEdit ? (
                <div style={styles.value}>
                  {vm.is_active ? "Đang hoạt động" : "Tạm ẩn"}
                </div>
              ) : (
                <select
                  style={styles.input}
                  value={String(!!dvm?.is_active)}
                  onChange={(e) =>
                    setDraft((s) => ({
                      ...s,
                      is_active: e.target.value === "true",
                    }))
                  }
                  disabled={saving}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              )}
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Địa điểm</div>
              {!isEdit ? (
                <div style={styles.value}>{locationNames || "—"}</div>
              ) : (
                <select
                  multiple
                  size={6}
                  style={styles.input}
                  value={normalizeIdArray(dvm?.location_ids).map(String)}
                  onChange={(e) =>
                    setMultiSelect("location_ids", e.target.selectedOptions)
                  }
                  disabled={saving}
                >
                  {locations.map((l) => (
                    <option key={l.id} value={String(l.id)}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}
              {isEdit ? (
                <div style={styles.sub}>Giữ Ctrl/Shift để chọn nhiều.</div>
              ) : null}
            </div>

            <div>
              <div style={styles.label}>Danh mục</div>
              {!isEdit ? (
                <div style={styles.value}>{categoryNames || "—"}</div>
              ) : (
                <select
                  multiple
                  size={6}
                  style={styles.input}
                  value={normalizeIdArray(dvm?.category_ids).map(String)}
                  onChange={(e) =>
                    setMultiSelect("category_ids", e.target.selectedOptions)
                  }
                  disabled={saving}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {isEdit ? (
                <div style={styles.sub}>Giữ Ctrl/Shift để chọn nhiều.</div>
              ) : null}
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Thẻ</div>
              {!isEdit ? (
                <div style={styles.value}>
                  {(vm.tags || []).join(", ") || "—"}
                </div>
              ) : (
                <input
                  style={styles.input}
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Ví dụ: biển, nghỉ dưỡng, gia đình"
                  disabled={saving}
                />
              )}
            </div>

            <div>
              <div style={styles.label}>Ảnh đại diện</div>

              {!isEdit ? (
                <div style={styles.value}>
                  {img ? (
                    <img
                      src={img}
                      alt="thumb"
                      style={{ height: 42, borderRadius: 12 }}
                    />
                  ) : (
                    "—"
                  )}
                </div>
              ) : (
                <div style={{ ...styles.drop, padding: 10 }}>
                  <div style={{ fontWeight: 900 }}>
                    Chọn ảnh đại diện (ảnh đầu tiên)
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
                      {uploadingImg ? "Đang tải..." : "Chọn ảnh"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) =>
                          pickAndUploadCover(e.target.files?.[0])
                        }
                        disabled={uploadingImg || saving}
                      />
                    </label>

                    {normalizeImages(dvm?.images).length > 0 ? (
                      <button
                        type="button"
                        style={{ ...styles.btn, ...styles.danger }}
                        onClick={removeCoverFromDraft}
                        disabled={uploadingImg || saving}
                      >
                        Xóa ảnh đại diện
                      </button>
                    ) : null}
                  </div>

                  {localCoverPreview || normalizeImages(dvm?.images)[0]?.url ? (
                    <img
                      src={
                        localCoverPreview ||
                        normalizeImages(dvm?.images)[0]?.url
                      }
                      alt="cover"
                      style={{
                        width: "100%",
                        maxHeight: 220,
                        objectFit: "contain",
                        borderRadius: 12,
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div style={styles.sub}>Chưa có ảnh đại diện</div>
                  )}
                </div>
              )}
            </div>
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

          {/* ẢNH TOUR */}
          <div>
            <div style={styles.label}>Ảnh tour</div>

            {!isEdit ? (
              <div style={styles.value}>
                {(vm.images || []).length ? `${vm.images.length} ảnh` : "—"}
              </div>
            ) : (
              <div
                style={styles.drop}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDropImage}
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
                      disabled={uploadingImg || saving}
                    />
                  </label>

                  <span style={styles.sub}>
                    {uploadingImg ? "Vui lòng chờ..." : "Tối đa 5MB mỗi ảnh"}
                  </span>
                </div>

                {localPreview || normalizeImages(dvm?.images).length > 0 ? (
                  <div style={styles.thumbWrap}>
                    {localPreview ? (
                      <img
                        src={localPreview}
                        alt="preview"
                        style={styles.thumb}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : null}

                    {normalizeImages(dvm?.images).map((im) => (
                      <div key={im.public_id || im.url} style={styles.thumbBox}>
                        <img
                          src={im.url}
                          alt="tour"
                          style={styles.thumb}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <button
                          type="button"
                          style={styles.delBtn}
                          onClick={() => removeImageFromDraft(im)}
                          disabled={saving || uploadingImg}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div style={styles.sub}>
                  Xóa ảnh ở đây rồi bấm <b>Lưu</b> → backend sẽ xóa luôn ảnh
                  trên Cloudinary theo <code>public_id</code>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHI TIẾT TOUR */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Chi tiết tour</div>
        </div>

        <div style={styles.body}>
          <div style={styles.row2}>
            <Field
              label="Số ngày"
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

            <div>
              <div style={styles.label}>Bao gồm</div>
              {!isEdit ? (
                <div style={styles.value}>
                  {(vm?.tour_details?.includes || []).length
                    ? vm.tour_details.includes.join(", ")
                    : "—"}
                </div>
              ) : (
                <textarea
                  style={styles.textarea}
                  value={includesText(dvm?.tour_details?.includes)}
                  onChange={(e) => setIncludesText(e.target.value)}
                  placeholder="Mỗi dòng 1 mục"
                  disabled={saving}
                />
              )}
            </div>
          </div>

          <div>
            <div style={styles.label}>Không bao gồm</div>
            {!isEdit ? (
              <div style={styles.value}>
                {(vm?.tour_details?.excludes || []).length
                  ? vm.tour_details.excludes.join(", ")
                  : "—"}
              </div>
            ) : (
              <textarea
                style={styles.textarea}
                value={includesText(dvm?.tour_details?.excludes)}
                onChange={(e) => setExcludesText(e.target.value)}
                placeholder="Mỗi dòng 1 mục"
                disabled={saving}
              />
            )}
          </div>

          <div>
            <div style={styles.label}>Lịch trình</div>
            {!isEdit ? (
              <div style={styles.value}>
                {(vm?.tour_details?.itinerary || []).length
                  ? `${vm.tour_details.itinerary.length} ngày`
                  : "—"}
              </div>
            ) : (
              <ItineraryEditor
                value={dvm?.tour_details?.itinerary}
                onChange={(next) =>
                  setDraft((s) => ({
                    ...s,
                    tour_details: {
                      ...(s?.tour_details || {}),
                      itinerary: next,
                    },
                  }))
                }
                disabled={saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
