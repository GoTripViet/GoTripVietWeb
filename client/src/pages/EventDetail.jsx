import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

import BigCard from "../components/home/BigCard.jsx";
import inventoryApi from "../api/inventoryApi";

const formatDDMM = (day, month) => {
  if (!day || !month) return "—";
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${dd}/${mm}`;
};

const formatDiscount = (type, value) => {
  if (!type) return "—";
  if (type === "percentage") return `${Number(value || 0)}%`;
  // fixed_amount
  const v = Number(value || 0);
  return `${v.toLocaleString("vi-VN")}đ`;
};

const discountTypeLabel = (type) => {
  if (type === "percentage") return "Giảm theo %";
  if (type === "fixed_amount") return "Giảm thẳng";
  return "Giảm giá";
};

const pickImageUrl = (tour) => {
  // tour.images[0].url (theo data bạn từng gửi) hoặc tour.image / thumbnail
  return (
    tour?.images?.[0]?.url ||
    tour?.image?.url ||
    tour?.thumbnail ||
    tour?.cover ||
    ""
  );
};

const mapTourToBigCardProps = (tour) => {
  // BigCard tolerant: thiếu field vẫn render ok
  return {
    id: tour?._id || tour?.id,
    imageUrl: pickImageUrl(tour),
    title: tour?.title || tour?.name || "Tour",
    tourCode: tour?.tour_code || tour?.code || tour?.sku || "N/A",
    startPoint:
      tour?.start_point ||
      tour?.tour_details?.start_point ||
      tour?.startPoint ||
      tour?.from ||
      "—",
    duration: tour?.duration || tour?.tour_details?.duration || "—",
    departureDates: tour?.departure_dates || tour?.departureDates || [],
    transport: tour?.transport || tour?.tour_details?.transport || "—",
    transportIcon:
      tour?.transport_icon || tour?.transportIcon || "bi-bus-front",
  };
};

const enrichToursWithInventory = async (tourList) => {
  const now = new Date();

  const enriched = await Promise.all(
    (tourList || []).map(async (tour) => {
      const productId = tour?._id || tour?.id;
      if (!productId) return { ...tour, departure_dates: [] };

      try {
        const invRes = await inventoryApi.getInventoryForProduct(productId);
        const invItems = Array.isArray(invRes?.data) ? invRes.data : [];

        const departure_dates = invItems
          .filter((it) => {
            const d = new Date(it?.tour_details?.date);
            const total = Number(it?.tour_details?.total_slots || 0);
            const booked = Number(it?.tour_details?.booked_slots || 0);
            const avail = total - booked;

            return it?.is_active && d >= now && avail > 0;
          })
          .map((it) => it.tour_details.date)
          .sort((a, b) => new Date(a) - new Date(b));

        return { ...tour, departure_dates };
      } catch (e) {
        return { ...tour, departure_dates: [] };
      }
    })
  );

  return enriched;
};

export default function EventDetail() {
  const { id } = useParams(); // dùng id hoặc slug đều được (tuỳ route)
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [tours, setTours] = useState([]);
  const [error, setError] = useState("");

  const dateRangeText = useMemo(() => {
    if (!event) return "—";
    const s = formatDDMM(event?.start_day, event?.start_month);
    const e = formatDDMM(event?.end_day, event?.end_month);
    return `${s} → ${e}`;
  }, [event]);

  const discountText = useMemo(() => {
    if (!event) return "—";
    return formatDiscount(event?.discount_type, event?.discount_value);
  }, [event]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        // 1) Lấy event từ inventory-service
        const evRes = await inventoryApi.getPublicEventByIdOrSlug(id);
        const ev = evRes.data;

        if (!alive) return;
        setEvent(ev);

        // 2) Lấy tours áp dụng từ inventory-service
        const toursRes = await inventoryApi.getPublicEventTours(id);
        const data = toursRes.data;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.tours)
          ? data.tours
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const enriched = await enrichToursWithInventory(list);
        if (!alive) return;
        setTours(enriched);
      } catch (err) {
        if (!alive) return;
        setError("Không tải được Event. Vui lòng thử lại.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span className="text-muted">Đang tải Event...</span>
        </div>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="rounded-4">
          {error || "Event không tồn tại."}
        </Alert>
        <Button
          variant="outline-primary"
          className="rounded-pill"
          onClick={() => navigate("/")}
        >
          Về trang chủ
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Ảnh event to nhất */}
      <div className="rounded-4 overflow-hidden shadow-sm mb-4">
        <div
          style={{
            width: "100%",
            aspectRatio: "16/7",
            backgroundImage: `url(${
              event?.image?.url || "https://placehold.co/1200x525?text=Event"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Tên + mô tả */}
      <Row className="g-4 align-items-start">
        <Col lg={8}>
          <h2 className="fw-bold mb-2">{event?.name}</h2>
          {event?.description ? (
            <p className="text-secondary mb-0" style={{ lineHeight: 1.6 }}>
              {event.description}
            </p>
          ) : (
            <p className="text-muted fst-italic mb-0">Chưa có mô tả.</p>
          )}
        </Col>

        {/* Box thông tin đặc biệt */}
        <Col lg={4}>
          <div className="border rounded-4 p-3 shadow-sm bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-bold">Ưu đãi</div>
              <Badge bg="primary" pill>
                {discountTypeLabel(event?.discount_type)}
              </Badge>
            </div>

            <div className="d-flex align-items-end justify-content-between">
              <div className="text-muted small">Giá trị</div>
              <div className="fs-3 fw-bold">{discountText}</div>
            </div>

            <hr className="my-3" />

            <div className="d-flex align-items-center justify-content-between">
              <div className="text-muted small">Thời gian</div>
              <div className="fw-semibold">{dateRangeText}</div>
            </div>

            <div className="mt-3 d-flex flex-wrap gap-2">
              {event?.is_active ? (
                <Badge bg="success" pill>
                  Đang hoạt động
                </Badge>
              ) : (
                <Badge bg="secondary" pill>
                  Tạm tắt
                </Badge>
              )}

              {event?.is_yearly ? (
                <Badge bg="info" pill>
                  Lặp hằng năm
                </Badge>
              ) : (
                <Badge bg="dark" pill>
                  Một lần
                </Badge>
              )}

              {event?.apply_to_all_tours ? (
                <Badge bg="warning" text="dark" pill>
                  Áp dụng tất cả tour
                </Badge>
              ) : (
                <Badge bg="warning" text="dark" pill>
                  Áp dụng tour chọn lọc
                </Badge>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Danh sách tour áp dụng */}
      <div className="mt-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold mb-0">Tour đang áp dụng</h4>
          <span className="text-muted small">{tours.length} tour</span>
        </div>

        {tours.length === 0 ? (
          <Alert variant="light" className="border rounded-4">
            Chưa có tour nào được gán cho Event này.
          </Alert>
        ) : (
          <Row className="g-3">
            {tours.map((tour) => {
              const props = mapTourToBigCardProps(tour);
              return (
                <Col key={props.id || props.title} xs={12} md={6} lg={4}>
                  <BigCard
                    {...props}
                    onClick={() => navigate(`/product/${props.id}`)}
                  />
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </Container>
  );
}
