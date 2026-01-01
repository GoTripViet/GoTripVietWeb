import React, { useEffect, useState } from "react";
import CrudTable from "../../components/admin/CrudTable";
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

  return {
    ...x,
    id: x?.id || x?._id,
    images_csv: Array.isArray(x?.images) ? x.images.join(", ") : "",
    tags_csv: Array.isArray(x?.tags) ? x.tags.join(", ") : "",
    lng,
    lat,
    status: "ACTIVE",
  };
}

function toPayload(row) {
  const images =
    typeof row?.images_csv === "string"
      ? row.images_csv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const tags =
    typeof row?.tags_csv === "string"
      ? row.tags_csv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const lng = Number(row?.lng ?? 0);
  const lat = Number(row?.lat ?? 0);

  return {
    name: row?.name?.trim(),
    // slug auto theo pre('save') trong model :contentReference[oaicite:3]{index=3}
    country: row?.country?.trim() || "",
    description: row?.description || "",
    images,
    tags,
    coordinates: {
      type: "Point",
      coordinates: [lng, lat], // [longitude, latitude] :contentReference[oaicite:4]{index=4}
    },
  };
}

export default function ManageLocation() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await locationApi.getAll();
      setRows(normalizeList(res).map(toRow));
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Không tải được locations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async (item) => {
    try {
      await locationApi.create(toPayload(item));
      await load();
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Tạo location thất bại"
      );
    }
  };

  const onUpdate = async (id, patch) => {
    try {
      await locationApi.update(id, toPayload(patch));
      await load();
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Cập nhật location thất bại"
      );
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Xóa location này?")) return;
    try {
      await locationApi.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message || e?.message || "Xóa location thất bại"
      );
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Quản lý Location</div>
          <div style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.5 }}>
            Model: name, slug(auto), country, images[], tags[],
            coordinates(Point:[lng,lat]).
          </div>
        </div>
        <button
          onClick={load}
          style={{
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: "10px 12px",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "↻ Tải lại"}
        </button>
      </div>

      <CrudTable
        title="LOCATIONS"
        data={rows}
        statusKey="status"
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "name", label: "Name", type: "text" },
          { key: "slug", label: "Slug (auto)", type: "text" },
          { key: "country", label: "Country", type: "text" },
          { key: "description", label: "Description", type: "textarea" },

          // UI CSV fields (convert -> arrays)
          { key: "images_csv", label: "Images (csv url)", type: "textarea" },
          { key: "tags_csv", label: "Tags (csv)", type: "text" },

          // Geo
          { key: "lng", label: "Longitude", type: "number" },
          { key: "lat", label: "Latitude", type: "number" },
        ]}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleStatus={() => {}}
      />
    </div>
  );
}
