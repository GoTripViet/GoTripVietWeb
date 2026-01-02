import React, { useEffect, useMemo, useState } from "react";
import {
  STORE_KEY,
  getList,
  addItem,
  updateItem,
  deleteItem,
} from "../../data/adminStore";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "start center",
        padding: "14px 0",
        zIndex: 80,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: "min(980px, 92vw)", // nhỏ hơn 1100
          maxHeight: "86vh", // thấp hơn 90vh
          overflowY: "auto",
          overflowX: "hidden", // CHẶN scroll ngang
          background: "#fff",
          borderRadius: 14,
          padding: 12, // nhỏ hơn 16
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

function Input({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontWeight: 800, fontSize: 12 }}>{label}</span>
      <input
        {...props}
        style={{
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          padding: "8px 10px",
          outline: "none",
          fontSize: 13,
          ...props.style,
        }}
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontWeight: 800, fontSize: 12 }}>{label}</span>
      <select
        {...props}
        style={{
          borderRadius: 10,
          fontSize: 11,
          border: "1px solid #e5e7eb",
          padding: "8px 10px",
          outline: "none",
          background: "#fff",
        }}
      >
        {children}
      </select>
    </label>
  );
}

function PillButton({ children, onClick, tone = "default" }) {
  const bg =
    tone === "primary" ? "#0b5fff" : tone === "danger" ? "#fff" : "#fff";
  const color = tone === "primary" ? "#fff" : "#111827";
  const border =
    tone === "primary"
      ? "transparent"
      : tone === "danger"
      ? "#fecaca"
      : "#e5e7eb";

  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        padding: "6px 8px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        color,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 900,
        lineHeight: 1.2,
        whiteSpace: "normal",
      }}
    >
      {children}
    </button>
  );
}

function Box({ title, subtitle, children, right }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 10,
      }}
    >
      {/* header */}
      <div style={{ display: "grid", gap: 6 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13 }}>{title}</div>
          {subtitle ? (
            <div style={{ color: "#6b7280", marginTop: 4, fontSize: 12 }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* actions: luôn ở hàng riêng để không chen title */}
        {right ? (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {right}
          </div>
        ) : null}
      </div>

      <div style={{ height: 1, background: "#e5e7eb", margin: "8px 0" }} />
      {children}
    </div>
  );
}

export default function ManageEvents() {
  // events list
  const [rows, setRows] = useState([]);

  // products source
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // event form
  const [form, setForm] = useState({
    id: "",
    subtitle: "",
    ctaLabel: "",
    backgroundUrl: "",
    startDate: "",
    endDate: "",
    priority: 0,
    discountType: "PERCENT", // PERCENT | FIXED
    discountValue: 0,
    status: "ACTIVE",
  });

  // selections
  const [selectedFlightIds, setSelectedFlightIds] = useState(new Set());
  const [selectedHotelIds, setSelectedHotelIds] = useState(new Set());

  // filters flights
  const [fFilter, setFFilter] = useState({
    q: "",
    operatedBy: "ALL",
    priceMin: "",
    priceMax: "",
    durationMax: "",
    stopsMax: "ALL",
  });

  // filters hotels
  const [hFilter, setHFilter] = useState({
    q: "",
    location: "ALL",
    stars: "ALL",
    ratingMin: "",
  });

  const reload = () => {
    setRows(getList(STORE_KEY.home_events));
    setFlights(getList(STORE_KEY.flights));
    setHotels(getList(STORE_KEY.hotel_listing_hotels));
  };

  useEffect(() => reload(), []);

  const airlineOptions = useMemo(() => {
    const set = new Set(
      flights.map((x) => String(x.operatedBy || "").trim()).filter(Boolean)
    );
    return ["ALL", ...Array.from(set).sort()];
  }, [flights]);

  const locationOptions = useMemo(() => {
    const set = new Set(
      hotels.map((x) => String(x.location || "").trim()).filter(Boolean)
    );
    return ["ALL", ...Array.from(set).sort()];
  }, [hotels]);

  const filteredFlights = useMemo(() => {
    return flights.filter((x) => {
      const q = fFilter.q.trim().toLowerCase();
      const matchQ = !q ? true : JSON.stringify(x).toLowerCase().includes(q);

      const matchAir =
        fFilter.operatedBy === "ALL"
          ? true
          : String(x.operatedBy || "") === fFilter.operatedBy;

      const p = Number(x.price || 0);
      const priceMin =
        fFilter.priceMin === "" ? null : Number(fFilter.priceMin);
      const priceMax =
        fFilter.priceMax === "" ? null : Number(fFilter.priceMax);
      const matchPrice =
        (priceMin === null || p >= priceMin) &&
        (priceMax === null || p <= priceMax);

      const d = Number(x.totalDurationHours || 0);
      const durationMax =
        fFilter.durationMax === "" ? null : Number(fFilter.durationMax);
      const matchDur = durationMax === null ? true : d <= durationMax;

      const stops = Number(x.stopsMax ?? 0);
      const matchStops =
        fFilter.stopsMax === "ALL" ? true : stops <= Number(fFilter.stopsMax);

      return matchQ && matchAir && matchPrice && matchDur && matchStops;
    });
  }, [flights, fFilter]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((x) => {
      const q = hFilter.q.trim().toLowerCase();
      const matchQ = !q
        ? true
        : String(x.title || "")
            .toLowerCase()
            .includes(q) || JSON.stringify(x).toLowerCase().includes(q);

      const matchLoc =
        hFilter.location === "ALL"
          ? true
          : String(x.location || "") === hFilter.location;

      const stars = Number(x.stars ?? 0);
      const matchStars =
        hFilter.stars === "ALL" ? true : stars === Number(hFilter.stars);

      const rating = Number(x.ratingScore ?? 0);
      const ratingMin =
        hFilter.ratingMin === "" ? null : Number(hFilter.ratingMin);
      const matchRating = ratingMin === null ? true : rating >= ratingMin;

      return matchQ && matchLoc && matchStars && matchRating;
    });
  }, [hotels, hFilter]);

  const resetForm = () => {
    setForm({
      id: "",
      subtitle: "",
      ctaLabel: "",
      backgroundUrl: "",
      startDate: "",
      endDate: "",
      priority: 0,
      discountType: "PERCENT",
      discountValue: 0,
      status: "ACTIVE",
    });
    setSelectedFlightIds(new Set());
    setSelectedHotelIds(new Set());
    setFFilter({
      q: "",
      operatedBy: "ALL",
      priceMin: "",
      priceMax: "",
      durationMax: "",
      stopsMax: "ALL",
    });
    setHFilter({
      q: "",
      location: "ALL",
      stars: "ALL",
      ratingMin: "",
    });
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      id: row.id || "",
      subtitle: row.subtitle || "",
      ctaLabel: row.ctaLabel || "",
      backgroundUrl: row.backgroundUrl || "",
      startDate: row.startDate || "",
      endDate: row.endDate || "",
      priority: Number(row.priority || 0),
      discountType: row.discountType || "PERCENT",
      discountValue: Number(row.discountValue || 0),
      status: row.status || "ACTIVE",
    });

    setSelectedHotelIds(new Set(row.applyHotelIds || []));
    setSelectedFlightIds(new Set(row.applyFlightIds || []));
    setOpen(true);
  };

  const saveEvent = () => {
    const payload = {
      ...form,
      priority: Number(form.priority || 0),
      discountValue: Number(form.discountValue || 0),
      applyHotelIds: Array.from(selectedHotelIds),
      applyFlightIds: Array.from(selectedFlightIds),
    };

    if (!payload.subtitle?.trim()) {
      alert("subtitle không được rỗng");
      return;
    }
    if (!payload.ctaLabel?.trim()) {
      alert("ctaLabel không được rỗng");
      return;
    }
    if (
      payload.discountType === "PERCENT" &&
      (payload.discountValue < 0 || payload.discountValue > 100)
    ) {
      alert("discount % phải trong 0-100");
      return;
    }

    if (editing?.id) {
      updateItem(STORE_KEY.home_events, editing.id, payload);
    } else {
      addItem(STORE_KEY.home_events, {
        ...payload,
        id: payload.id?.trim() || uid(),
        status: payload.status || "ACTIVE",
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }

    setOpen(false);
    reload();
  };

  const toggleStatus = (row) => {
    updateItem(STORE_KEY.home_events, row.id, {
      status: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
    reload();
  };

  const removeEvent = (id) => {
    if (!confirm("xóa event này?")) return;
    deleteItem(STORE_KEY.home_events, id);
    reload();
  };

  // selection helpers (visible only)
  const selectAllVisibleFlights = () => {
    const next = new Set(selectedFlightIds);
    filteredFlights.forEach((x) => next.add(x.id));
    setSelectedFlightIds(next);
  };
  const clearAllVisibleFlights = () => {
    const next = new Set(selectedFlightIds);
    filteredFlights.forEach((x) => next.delete(x.id));
    setSelectedFlightIds(next);
  };

  const selectAllVisibleHotels = () => {
    const next = new Set(selectedHotelIds);
    filteredHotels.forEach((x) => next.add(x.id));
    setSelectedHotelIds(next);
  };
  const clearAllVisibleHotels = () => {
    const next = new Set(selectedHotelIds);
    filteredHotels.forEach((x) => next.delete(x.id));
    setSelectedHotelIds(next);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Manage Events</div>
          <div style={{ color: "#6b7280" }}>
            tạo event + set giảm giá + chọn sản phẩm (hotel / flight)
          </div>
        </div>

        <button
          onClick={openAdd}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: 0,
            background: "#0b5fff",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          + Tạo event
        </button>
      </div>

      {/* List events */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 14,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
          Danh sách Events
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Subtitle</Th>
                <Th>CTA</Th>
                <Th>Giảm giá</Th>
                <Th>Áp dụng</Th>
                <Th>Thời gian</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <Td>{idx + 1}</Td>
                  <Td style={{ fontWeight: 800 }}>{r.subtitle}</Td>
                  <Td>{r.ctaLabel}</Td>
                  <Td>
                    {r.discountType || "PERCENT"}:{" "}
                    <b>{Number(r.discountValue || 0)}</b>
                    {r.discountType === "PERCENT" ? "%" : ""}
                  </Td>
                  <Td>
                    hotels: <b>{(r.applyHotelIds || []).length}</b> <br />
                    flights: <b>{(r.applyFlightIds || []).length}</b>
                  </Td>
                  <Td>
                    {r.startDate || "—"} → {r.endDate || "—"}
                  </Td>
                  <Td>
                    <button
                      onClick={() => toggleStatus(r)}
                      style={{
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        padding: "6px 10px",
                        cursor: "pointer",
                        background:
                          r.status === "ACTIVE"
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(239,68,68,0.10)",
                        fontWeight: 900,
                      }}
                      title="bấm để đổi trạng thái"
                    >
                      {r.status || "—"}
                    </button>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => openEdit(r)} style={btn}>
                        Sửa
                      </button>
                      <button
                        onClick={() => removeEvent(r.id)}
                        style={{ ...btn, borderColor: "#fecaca" }}
                      >
                        Xóa
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <Td colSpan={8}>Chưa có event</Td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal create/edit */}
      <Modal
        open={open}
        title={editing ? "Sửa event" : "Tạo event"}
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            <Input
              label="ID (optional)"
              value={form.id}
              onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))}
              placeholder="để trống sẽ tự tạo"
              disabled={Boolean(editing)}
            />
            <Input
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) =>
                setForm((s) => ({ ...s, subtitle: e.target.value }))
              }
              placeholder="vd: ưu đãi cuối năm"
            />
            <Input
              label="CTA Label"
              value={form.ctaLabel}
              onChange={(e) =>
                setForm((s) => ({ ...s, ctaLabel: e.target.value }))
              }
              placeholder="vd: đặt ngay"
            />

            <Input
              label="Background URL"
              value={form.backgroundUrl}
              onChange={(e) =>
                setForm((s) => ({ ...s, backgroundUrl: e.target.value }))
              }
              placeholder="https://..."
              style={{ gridColumn: "1 / -1" }}
            />

            <Input
              label="Start date"
              value={form.startDate}
              onChange={(e) =>
                setForm((s) => ({ ...s, startDate: e.target.value }))
              }
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="End date"
              value={form.endDate}
              onChange={(e) =>
                setForm((s) => ({ ...s, endDate: e.target.value }))
              }
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="Priority"
              type="number"
              value={form.priority}
              onChange={(e) =>
                setForm((s) => ({ ...s, priority: e.target.value }))
              }
            />

            <Select
              label="Discount type"
              value={form.discountType}
              onChange={(e) =>
                setForm((s) => ({ ...s, discountType: e.target.value }))
              }
            >
              <option value="PERCENT">PERCENT (%)</option>
              <option value="FIXED">FIXED (VND)</option>
            </Select>

            <Input
              label={
                form.discountType === "PERCENT"
                  ? "Discount (%)"
                  : "Discount (VND)"
              }
              type="number"
              value={form.discountValue}
              onChange={(e) =>
                setForm((s) => ({ ...s, discountValue: e.target.value }))
              }
            />

            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value }))
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          </div>

          {/* Product pickers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 12,
            }}
          >
            {/* Hotels picker */}
            <Box
              title={`Chọn Hotels (đã chọn: ${selectedHotelIds.size})`}
              subtitle="filter → tick chọn → lưu"
              right={
                <>
                  <PillButton
                    onClick={() =>
                      setHFilter({
                        q: "",
                        location: "ALL",
                        stars: "ALL",
                        ratingMin: "",
                      })
                    }
                  >
                    reset filter
                  </PillButton>
                  <PillButton onClick={selectAllVisibleHotels} tone="primary">
                    chọn tất cả (đang hiển thị)
                  </PillButton>
                  <PillButton onClick={clearAllVisibleHotels} tone="danger">
                    xóa chọn (đang hiển thị)
                  </PillButton>
                </>
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: 10,
                }}
              >
                <Input
                  label="Search name"
                  value={hFilter.q}
                  onChange={(e) =>
                    setHFilter((s) => ({ ...s, q: e.target.value }))
                  }
                  placeholder="gõ tên khách sạn..."
                />
                <Select
                  label="Location"
                  value={hFilter.location}
                  onChange={(e) =>
                    setHFilter((s) => ({ ...s, location: e.target.value }))
                  }
                >
                  {locationOptions.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Stars"
                  value={hFilter.stars}
                  onChange={(e) =>
                    setHFilter((s) => ({ ...s, stars: e.target.value }))
                  }
                >
                  <option value="ALL">ALL</option>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} sao
                    </option>
                  ))}
                </Select>

                <Input
                  label="Rating min"
                  type="number"
                  value={hFilter.ratingMin}
                  onChange={(e) =>
                    setHFilter((s) => ({ ...s, ratingMin: e.target.value }))
                  }
                  placeholder="vd: 8"
                />
              </div>

              <div
                style={{
                  marginTop: 10,
                  maxHeight: 240,
                  overflow: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                }}
              >
                {filteredHotels.map((h) => {
                  const checked = selectedHotelIds.has(h.id);
                  return (
                    <label
                      key={h.id}
                      style={{
                        display: "flex",
                        alignItems: "start",
                        gap: 10,
                        padding: "10px 12px",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(selectedHotelIds);
                          if (next.has(h.id)) next.delete(h.id);
                          else next.add(h.id);
                          setSelectedHotelIds(next);
                        }}
                        style={{ width: 18, height: 18, marginTop: 2 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: 13 }}>
                          {h.title || h.name || h.id}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 11 }}>
                          {h.location || "—"} •{" "}
                          {h.stars ? `${h.stars} sao` : "—"} • rating{" "}
                          {h.ratingScore ?? "—"}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {filteredHotels.length === 0 ? (
                  <div style={{ padding: 12, color: "#6b7280" }}>
                    không có hotel phù hợp
                  </div>
                ) : null}
              </div>
            </Box>

            {/* Flights picker */}
            <Box
              title={`Chọn Flights (đã chọn: ${selectedFlightIds.size})`}
              subtitle="filter → tick chọn → lưu"
              right={
                <>
                  <PillButton
                    onClick={() =>
                      setFFilter({
                        q: "",
                        operatedBy: "ALL",
                        priceMin: "",
                        priceMax: "",
                        durationMax: "",
                        stopsMax: "ALL",
                      })
                    }
                  >
                    reset filter
                  </PillButton>
                  <PillButton onClick={selectAllVisibleFlights} tone="primary">
                    chọn tất cả (đang hiển thị)
                  </PillButton>
                  <PillButton onClick={clearAllVisibleFlights} tone="danger">
                    xóa chọn (đang hiển thị)
                  </PillButton>
                </>
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: 10,
                }}
              >
                <Input
                  label="Search"
                  value={fFilter.q}
                  onChange={(e) =>
                    setFFilter((s) => ({ ...s, q: e.target.value }))
                  }
                  placeholder="gõ nhanh..."
                />
                <Select
                  label="Hãng vận hành"
                  value={fFilter.operatedBy}
                  onChange={(e) =>
                    setFFilter((s) => ({ ...s, operatedBy: e.target.value }))
                  }
                >
                  {airlineOptions.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Price min"
                  type="number"
                  value={fFilter.priceMin}
                  onChange={(e) =>
                    setFFilter((s) => ({ ...s, priceMin: e.target.value }))
                  }
                />
                <Input
                  label="Price max"
                  type="number"
                  value={fFilter.priceMax}
                  onChange={(e) =>
                    setFFilter((s) => ({ ...s, priceMax: e.target.value }))
                  }
                />

                <Input
                  label="Duration max (hours)"
                  type="number"
                  value={fFilter.durationMax}
                  onChange={(e) =>
                    setFFilter((s) => ({ ...s, durationMax: e.target.value }))
                  }
                />

                <Select
                  label="Stops max"
                  value={fFilter.stopsMax}
                  onChange={(e) =>
                    setFFilter((s) => ({ ...s, stopsMax: e.target.value }))
                  }
                >
                  <option value="ALL">ALL</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </Select>
              </div>

              <div
                style={{
                  marginTop: 10,
                  maxHeight: 240,
                  overflow: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                }}
              >
                {filteredFlights.map((f) => {
                  const checked = selectedFlightIds.has(f.id);
                  return (
                    <label
                      key={f.id}
                      style={{
                        display: "flex",
                        alignItems: "start",
                        gap: 10,
                        padding: "10px 12px",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(selectedFlightIds);
                          if (next.has(f.id)) next.delete(f.id);
                          else next.add(f.id);
                          setSelectedFlightIds(next);
                        }}
                        style={{ width: 18, height: 18, marginTop: 2 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: 13 }}>
                          {f.operatedBy || "—"} • {f.id}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 11 }}>
                          price {Number(f.price || 0).toLocaleString("vi-VN")} •
                          duration {f.totalDurationHours ?? "—"}h • stops{" "}
                          {f.stopsMax ?? "—"}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {filteredFlights.length === 0 ? (
                  <div style={{ padding: 12, color: "#6b7280" }}>
                    không có flight phù hợp
                  </div>
                ) : null}
              </div>
            </Box>
          </div>

          {/* footer buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => setOpen(false)}
              style={{ ...btn, padding: "10px 14px" }}
            >
              Hủy
            </button>
            <button
              onClick={saveEvent}
              style={{
                ...btn,
                padding: "10px 14px",
                background: "#0b5fff",
                color: "#fff",
                border: 0,
              }}
            >
              Lưu event
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 10px",
        fontSize: 12,
        color: "#6b7280",
        borderBottom: "1px solid #e5e7eb",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style, colSpan }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: "10px 10px",
        borderBottom: "1px solid #f1f5f9",
        verticalAlign: "top",
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </td>
  );
}

const btn = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  padding: "8px 10px",
  cursor: "pointer",
  background: "#fff",
  fontWeight: 900,
};
