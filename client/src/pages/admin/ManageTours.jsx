import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import catalogApi from "../../api/catalogApi";

const styles = {
  page: { display: "grid", gap: 14 },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { fontWeight: 900, fontSize: 24, letterSpacing: -0.2 },
  toolbar: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  input: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    outline: "none",
    minWidth: 260,
  },
  btn: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    cursor: "pointer",
    background: "#fff",
    fontWeight: 900,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 0 rgba(16,24,40,0.04)",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
  },
  cardTop: { padding: 12, display: "flex", gap: 10, alignItems: "center" },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    objectFit: "cover",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
  },
  cardTitle: { fontWeight: 900, fontSize: 14, lineHeight: 1.25 },
  meta: { color: "#6b7280", fontSize: 12, marginTop: 4, lineHeight: 1.4 },
  cardMid: { padding: "0 12px 12px", display: "grid", gap: 8 },
  pillRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: (bg, color) => ({
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: bg,
    color,
    border: "1px solid rgba(0,0,0,0.06)",
    fontWeight: 900,
  }),
  cardBottom: {
    padding: 12,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  smallBtn: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "8px 10px",
    cursor: "pointer",
    background: "#fff",
    fontWeight: 900,
  },
  alert: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    lineHeight: 1.5,
  },
  danger: { border: "1px solid #fecaca", background: "#fff", color: "#b91c1c" },
};

function pickFirstImage(images) {
  if (!images) return "";
  if (typeof images === "string") return images.split(",")[0]?.trim() || "";
  if (Array.isArray(images)) return images[0] || "";
  return "";
}

function normalizeListResponse(res) {
  // axiosClient có thể trả res.data hoặc trả thẳng object
  const a = res?.data ?? res;

  // nhiều backend wrap thêm 1 lớp "data"
  const b = a?.data ?? a;

  // các key thường gặp
  if (Array.isArray(b)) return b;
  if (Array.isArray(b?.items)) return b.items;
  if (Array.isArray(b?.products)) return b.products;
  if (Array.isArray(b?.results)) return b.results;
  if (Array.isArray(b?.rows)) return b.rows;
  if (Array.isArray(b?.docs)) return b.docs;

  // trường hợp: { data: { products: [...] } }
  const c = b?.data ?? null;
  if (Array.isArray(c)) return c;
  if (Array.isArray(c?.items)) return c.items;
  if (Array.isArray(c?.products)) return c.products;

  return [];
}

export default function ManageTours() {
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadTours = async () => {
    setLoading(true);
    setErr("");
    try {
      // params filter theo backend catalog-service
      // Nếu backend bạn dùng key khác, đổi ở đây (vd: type, productType,...)
      const res = await catalogApi.getAll({ product_type: "tour" });
      const list = normalizeListResponse(res);
      setItems(list);
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Không load được danh sách tour."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((x) => {
      const td = x?.tour_details || x?.tourDetails || {};
      const hay = [
        x?.id,
        x?._id,
        x?.title,
        x?.slug,
        td?.start_point,
        td?.transport_type,
        x?.description_short,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(keyword);
    });
  }, [items, q]);

  const openDetail = (tour) => {
    const id = tour?.id || tour?._id;
    nav(`/admin/manage/tours/${id}`); // view mode
  };

  const openEdit = (tour) => {
    const id = tour?.id || tour?._id;
    nav(`/admin/manage/tours/${id}?mode=edit`); // edit mode
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>Quản lý tour</div>

        <div style={styles.toolbar}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tour theo tên / slug / điểm đi..."
            style={styles.input}
          />
          <button
            type="button"
            onClick={loadTours}
            style={styles.btn}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "↻ Tải lại"}
          </button>
        </div>
      </div>

      {err ? (
        <div style={{ ...styles.alert, ...styles.danger }}>
          <b>Lỗi:</b> {err}
          <div style={{ marginTop: 8 }}>
            <button type="button" style={styles.btn} onClick={loadTours}>
              Thử lại
            </button>
          </div>
        </div>
      ) : null}

      {!err && !loading && filtered.length === 0 ? (
        <div style={styles.alert}>
          Chưa có tour nào (hoặc filter API chưa đúng param).
        </div>
      ) : null}

      <div style={styles.grid}>
        {filtered.map((tour) => {
          const td = tour?.tour_details || tour?.tourDetails || {};
          const id = tour?.id || tour?._id;

          const img = pickFirstImage(tour?.images);
          const active =
            tour?.is_active ?? tour?.isActive ?? tour?.status === "ACTIVE";

          const startPoint = td?.start_point || tour?.start_point || "—";
          const durationDays = td?.duration_days ?? tour?.duration_days;
          const transport = td?.transport_type || tour?.transport_type || "—";
          const price = Number(tour?.base_price ?? tour?.basePrice ?? 0);

          return (
            <div key={id} style={styles.card}>
              <div style={styles.cardTop}>
                <img
                  src={img || undefined}
                  alt={tour?.title || "tour"}
                  style={styles.thumb}
                  onError={(e) => {
                    e.currentTarget.src = "";
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={styles.cardTitle}>
                    {tour?.title || "(Chưa có tiêu đề)"}
                  </div>
                  <div style={styles.meta}>
                    {startPoint !== "—" ? `Đi từ: ${startPoint}` : "—"} •{" "}
                    {durationDays ? `${durationDays} ngày` : "—"}
                  </div>
                </div>
              </div>

              <div style={styles.cardMid}>
                <div style={styles.pillRow}>
                  <span style={styles.pill("rgba(11,95,255,0.10)", "#0b5fff")}>
                    Giá: {price.toLocaleString("vi-VN")}₫
                  </span>
                  <span style={styles.pill("rgba(16,185,129,0.12)", "#047857")}>
                    {transport}
                  </span>
                  <span
                    style={
                      active
                        ? styles.pill("rgba(16,185,129,0.12)", "#047857")
                        : styles.pill("rgba(239,68,68,0.12)", "#b91c1c")
                    }
                  >
                    {active ? "Đang hoạt động" : "Tạm ẩn"}
                  </span>
                </div>

                {tour?.description_short ? (
                  <div
                    style={{ color: "#374151", fontSize: 12, lineHeight: 1.5 }}
                  >
                    {tour.description_short}
                  </div>
                ) : (
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>
                    Chưa có mô tả ngắn
                  </div>
                )}
              </div>

              <div style={styles.cardBottom}>
                <button
                  type="button"
                  style={styles.smallBtn}
                  onClick={() => openDetail(tour)}
                >
                  Chi tiết
                </button>

                <button
                  type="button"
                  style={styles.smallBtn}
                  onClick={() => openEdit(tour)}
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
