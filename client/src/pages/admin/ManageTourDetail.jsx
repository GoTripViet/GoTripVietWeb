import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  },
  list: { margin: 0, paddingLeft: 18, color: "#374151", lineHeight: 1.6 },
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

function normalizeOneResponse(res) {
  // tùy axiosClient: trả về res.data hoặc res
  return res?.data ?? res;
}

export default function ManageTourDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadTour = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await catalogApi.getById(id);
      const data = normalizeOneResponse(res);

      // nếu API trả về wrapper: { data: {...} }
      const t = data?.data ?? data;
      setTour(t);
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
  }, [id]);

  const viewModel = useMemo(() => {
    if (!tour) return null;

    const td = tour?.tour_details || tour?.tourDetails || {};
    return {
      id: tour?.id || tour?._id,
      title: tour?.title || "",
      slug: tour?.slug || "",
      product_type: tour?.product_type || tour?.productType || "",
      base_price: tour?.base_price ?? tour?.basePrice ?? 0,
      is_active: tour?.is_active ?? tour?.isActive ?? tour?.status === "ACTIVE",
      description_short: tour?.description_short || "",
      description_long: tour?.description_long || "",
      images: tour?.images,
      tags: tour?.tags,
      partner_id: tour?.partner_id || tour?.partnerId,
      location_ids: tour?.location_ids || tour?.locationIds,
      category_ids: tour?.category_ids || tour?.categoryIds,
      sustainability_score:
        tour?.sustainability_score ?? tour?.sustainabilityScore,

      // tour_details
      start_point: td?.start_point,
      duration_days: td?.duration_days,
      transport_type: td?.transport_type,
      hotel_name: td?.hotel_name,
      hotel_rating: td?.hotel_rating,
      is_flight_included: td?.is_flight_included,

      departure_times: Array.isArray(td?.departure_times)
        ? td.departure_times
        : [],
      itinerary: Array.isArray(td?.itinerary) ? td.itinerary : [],
      policy_notes: Array.isArray(td?.policy_notes) ? td.policy_notes : [],
      trip_highlights: td?.trip_highlights || null,
      flight_info: td?.flight_info || null,
    };
  }, [tour]);

  if (loading && !tour) {
    return <div style={styles.alert}>Đang tải chi tiết tour...</div>;
  }

  if (err) {
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

  if (!viewModel) {
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

  const img = pickFirstImage(viewModel.images);

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>{viewModel.title || "Tour"}</div>
          <div style={styles.sub}>
            ID: {viewModel.id} •{" "}
            {viewModel.is_active ? "Đang hoạt động" : "Tạm ẩn"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={styles.btn} onClick={() => nav("/admin/manage/tours")}>
            ← Danh sách
          </button>
          <button style={styles.btn} onClick={loadTour} disabled={loading}>
            {loading ? "Đang tải..." : "↻ Tải lại"}
          </button>
        </div>
      </div>

      {/* Product */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Thông tin chung</div>
        </div>
        <div style={styles.body}>
          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Tiêu đề</div>
              <div style={styles.value}>{viewModel.title || "—"}</div>
            </div>
            <div>
              <div style={styles.label}>Slug</div>
              <div style={styles.value}>{viewModel.slug || "—"}</div>
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Giá cơ bản</div>
              <div style={styles.value}>
                {Number(viewModel.base_price || 0).toLocaleString("vi-VN")}₫
              </div>
            </div>
            <div>
              <div style={styles.label}>Sustainability</div>
              <div style={styles.value}>
                {viewModel.sustainability_score ?? "—"}
              </div>
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Partner ID</div>
              <div style={styles.value}>{viewModel.partner_id || "—"}</div>
            </div>
            <div>
              <div style={styles.label}>Ảnh đại diện</div>
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
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Location IDs</div>
              <div style={styles.value}>
                {String(viewModel.location_ids ?? "—")}
              </div>
            </div>
            <div>
              <div style={styles.label}>Category IDs</div>
              <div style={styles.value}>
                {String(viewModel.category_ids ?? "—")}
              </div>
            </div>
          </div>

          <div>
            <div style={styles.label}>Mô tả ngắn</div>
            <div style={styles.value}>{viewModel.description_short || "—"}</div>
          </div>

          <div>
            <div style={styles.label}>Mô tả dài</div>
            <div style={styles.value}>{viewModel.description_long || "—"}</div>
          </div>
        </div>
      </div>

      {/* tour_details */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Chi tiết tour</div>
        </div>
        <div style={styles.body}>
          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Điểm khởi hành</div>
              <div style={styles.value}>{viewModel.start_point || "—"}</div>
            </div>
            <div>
              <div style={styles.label}>Số ngày</div>
              <div style={styles.value}>{viewModel.duration_days ?? "—"}</div>
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Phương tiện</div>
              <div style={styles.value}>{viewModel.transport_type || "—"}</div>
            </div>
            <div>
              <div style={styles.label}>Có kèm vé bay</div>
              <div style={styles.value}>
                {viewModel.is_flight_included ? "Có" : "Không"}
              </div>
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <div style={styles.label}>Khách sạn</div>
              <div style={styles.value}>{viewModel.hotel_name || "—"}</div>
            </div>
            <div>
              <div style={styles.label}>Hạng sao</div>
              <div style={styles.value}>{viewModel.hotel_rating ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* departure_times */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Lịch khởi hành</div>
        </div>
        <div style={styles.body}>
          {viewModel.departure_times.length === 0 ? (
            <div style={styles.value}>—</div>
          ) : (
            <ul style={styles.list}>
              {viewModel.departure_times.map((x, idx) => (
                <li key={idx}>
                  {typeof x === "string"
                    ? x
                    : x?.departure_time || x?.time || JSON.stringify(x)}
                  {x?.note ? ` — ${x.note}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* itinerary */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Lịch trình</div>
        </div>
        <div style={styles.body}>
          {viewModel.itinerary.length === 0 ? (
            <div style={styles.value}>—</div>
          ) : (
            <ul style={styles.list}>
              {viewModel.itinerary
                .slice()
                .sort((a, b) => (a?.day ?? 0) - (b?.day ?? 0))
                .map((x, idx) => (
                  <li key={idx}>
                    <b>Ngày {x?.day ?? "?"}:</b> {x?.title || "—"}{" "}
                    {x?.details ? `— ${x.details}` : ""}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* policy_notes */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Chính sách / Ghi chú</div>
        </div>
        <div style={styles.body}>
          {viewModel.policy_notes.length === 0 ? (
            <div style={styles.value}>—</div>
          ) : (
            <ul style={styles.list}>
              {viewModel.policy_notes.map((x, idx) => (
                <li key={idx}>
                  <b>{x?.title || "—"}</b>: {x?.content || "—"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* trip_highlights + flight_info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Trip highlights</div>
          </div>
          <div style={styles.body}>
            <div style={styles.value}>
              {viewModel.trip_highlights ? (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(viewModel.trip_highlights, null, 2)}
                </pre>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Flight info</div>
          </div>
          <div style={styles.body}>
            <div style={styles.value}>
              {viewModel.flight_info ? (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(viewModel.flight_info, null, 2)}
                </pre>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
