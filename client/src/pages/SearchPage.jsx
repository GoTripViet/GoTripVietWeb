// src/pages/SearchPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import catalogApi from "../api/catalogApi";
import BigCard from "../components/home/BigCard";

// --- CÁC HÀM HELPER XỬ LÝ DỮ LIỆU ---

// 1. Tách chuỗi ngân sách thành min_price và max_price
const parseBudget = (budgetStr) => {
  if (!budgetStr) return {};

  // Trường hợp: "Dưới 5 triệu"
  if (budgetStr.includes("Dưới")) {
    const num = budgetStr.match(/\d+/);
    return num ? { max_price: parseInt(num[0]) * 1000000 } : {};
  }
  // Trường hợp: "Trên 20 triệu"
  if (budgetStr.includes("Trên")) {
    const num = budgetStr.match(/\d+/);
    return num ? { min_price: parseInt(num[0]) * 1000000 } : {};
  }
  // Trường hợp: "5 - 10 triệu"
  if (budgetStr.includes("-")) {
    const parts = budgetStr.match(/(\d+)/g);
    if (parts && parts.length >= 2) {
      return {
        min_price: parseInt(parts[0]) * 1000000,
        max_price: parseInt(parts[1]) * 1000000,
      };
    }
  }
  return {};
};

// 2. Chuyển đổi số ngày thành chuỗi "X ngày Y đêm" (VD: 3 -> 3N2Đ)
const formatDuration = (days) => {
  if (!days || days <= 1) return "Trong ngày";
  return `${days}N${days - 1}Đ`;
};

// 3. Format ngày tháng ngắn gọn (VD: 2025-01-27 -> 27/01)
const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

// 4. Format ngày đầy đủ cho tiêu đề (VD: 29/12/2025)
const formatDateFull = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // --- LẤY PARAMS TỪ URL ---
  const keyword = searchParams.get("q");
  const startPoint = searchParams.get("from");
  const date = searchParams.get("date");
  const budget = searchParams.get("budget");
  const transport = searchParams.get("transport");
  const starRating = searchParams.get("star_rating");
  const locationId =
    searchParams.get("location_id") || searchParams.get("location"); // backward compatible
  const categoryId =
    searchParams.get("category_id") || searchParams.get("category"); // backward compatible
  const label = searchParams.get("label"); // chỉ để hiển thị tiêu đề/badge

  // Tạo tiêu đề trang động
  const getPageTitle = () => {
    if (label && locationId) return `Tour tại "${label}"`;
    if (label && categoryId) return `Tour theo danh mục "${label}"`;
    if (keyword) return `Kết quả tìm kiếm cho "${keyword}"`;
    if (startPoint) return `Tour khởi hành từ ${startPoint}`;
    return "Danh sách Tour du lịch";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // 1. Chuẩn bị params gọi API
        // Mặc định luôn tìm product_type là 'tour' theo cấu trúc mới
        const apiParams = {
          limit: 20,
          product_type: "tour",
        };

        // Gán các tham số tìm kiếm
        if (keyword) apiParams.keyword = keyword;
        if (startPoint) apiParams.start_point = startPoint;
        if (date) apiParams.date = date;
        if (transport) apiParams.transport_type = transport;
        if (starRating) apiParams.star_rating = starRating;
        if (locationId) apiParams.location_id = locationId;
        if (categoryId) apiParams.category_id = categoryId;

        // Xử lý khoảng giá
        const priceRange = parseBudget(budget);
        if (priceRange.min_price) apiParams.min_price = priceRange.min_price;
        if (priceRange.max_price) apiParams.max_price = priceRange.max_price;

        console.log("🔥 SearchPage gọi API với params:", apiParams);

        // 2. Gọi API
        const res = await catalogApi.getAll(apiParams);

        // 3. Xử lý & Mapping dữ liệu để truyền vào BigCard
        let list = res.products || (res.data && res.data.products) || [];

        const mappedList = list.map((p) => {
          // Lấy thông tin chi tiết tour
          const tDetails = p.tour_details || {};

          // Tạo mã Tour giả lập từ ID (Lấy 6 ký tự cuối, viết hoa)
          // VD: 6500abc... -> TOUR-0ABC
          const fakeCode = p._id
            ? `TOUR-${p._id.slice(-4).toUpperCase()}`
            : "TOUR-CODE";

          // Xử lý danh sách ngày khởi hành
          // Lấy tối đa 3 ngày tiếp theo để hiển thị
          const rawDates = tDetails.departure_times || [];
          // Sắp xếp ngày tăng dần (nếu chưa sắp xếp)
          rawDates.sort((a, b) => new Date(a) - new Date(b));
          // Map sang định dạng ngắn (27/01)
          const displayDates = rawDates
            .slice(0, 3)
            .map((d) => formatShortDate(d));

          // Xử lý ảnh (support cả string và object {url, public_id})
          const base = import.meta.env.VITE_API_URL;

          const rawImg =
            Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
          const rawUrl =
            typeof rawImg === "string"
              ? rawImg
              : typeof rawImg?.url === "string"
                ? rawImg.url
                : ""; // fallback nếu không có url

          let validImage = "";
          if (rawUrl) {
            validImage = rawUrl.startsWith("http")
              ? rawUrl
              : `${base}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
          }

          if (!validImage) {
            validImage = "https://placehold.co/400x300?text=Tour+Image";
          }

          return {
            id: p._id,
            title: p.title,
            imageUrl: validImage,
            price: p.base_price,
            // Giả lập giá gốc cao hơn 15% để hiện badge giảm giá
            originalPrice: p.base_price * 1.15,

            // --- CÁC PROPS DÀNH CHO GIAO DIỆN MỚI ---
            tourCode: fakeCode,
            startPoint: tDetails.start_point || "Hồ Chí Minh",
            duration: formatDuration(tDetails.duration_days), // VD: 3N2Đ
            transport: tDetails.transport_type || "Xe du lịch",
            departureDates: displayDates, // Mảng ['27/01', '10/02']
          };
        });

        setProducts(mappedList);
        setTotal(res.totalProducts || mappedList.length);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    };

    // Gọi lại hàm mỗi khi URL params thay đổi
    fetchProducts();
  }, [
    keyword,
    startPoint,
    date,
    budget,
    transport,
    starRating,
    locationId,
    categoryId,
  ]);

  return (
    <Container className="py-5">
      {/* --- HEADER KẾT QUẢ --- */}
      <div className="mb-4 border-bottom pb-3">
        <h2 className="fw-bold text-dark mb-2">{getPageTitle()}</h2>

        {/* Hiển thị các Badge bộ lọc đang áp dụng */}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="badge bg-white text-dark border rounded-pill px-3 py-2">
            Tìm thấy <b>{total}</b> kết quả
          </span>

          {startPoint && (
            <span className="badge bg-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1">
              <i className="bi bi-geo-alt"></i> {startPoint}
            </span>
          )}

          {date && (
            <span className="badge bg-success rounded-pill px-3 py-2 d-flex align-items-center gap-1">
              <i className="bi bi-calendar"></i> {formatDateFull(date)}
            </span>
          )}

          {budget && (
            <span className="badge bg-info text-dark rounded-pill px-3 py-2">
              Ngân sách: {budget}
            </span>
          )}

          {transport && (
            <span className="badge bg-secondary rounded-pill px-3 py-2">
              {transport}
            </span>
          )}

          {starRating && (
            <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
              Khách sạn {starRating}
            </span>
          )}
        </div>
      </div>

      {/* --- LOADING STATE --- */}
      {loading && (
        <div className="text-center py-5">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted">
            Đang tìm kiếm tour tốt nhất cho bạn...
          </p>
        </div>
      )}

      {/* --- EMPTY STATE --- */}
      {!loading && products.length === 0 && (
        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
          <div className="mb-3">
            <i
              className="bi bi-search"
              style={{ fontSize: "4rem", color: "#dee2e6" }}
            ></i>
          </div>
          <h4 className="fw-bold text-secondary">
            Không tìm thấy kết quả phù hợp
          </h4>
          <p className="text-muted mb-4">
            {date
              ? `Rất tiếc, chưa có tour nào khởi hành vào ngày ${formatDateFull(
                  date,
                )}.`
              : "Hãy thử thay đổi từ khóa, ngày đi hoặc mở rộng khoảng giá."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary px-4 py-2 fw-bold rounded-pill"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Về trang chủ
          </button>
        </div>
      )}

      {/* --- DANH SÁCH SẢN PHẨM (GRID) --- */}
      {!loading && products.length > 0 && (
        <Row>
          {products.map((item) => (
            <Col key={item.id} xs={12} md={6} lg={4} xl={3} className="mb-4">
              {/* Truyền toàn bộ props đã map vào BigCard */}
              <BigCard
                {...item}
                onClick={() => navigate(`/product/${item.id}`)}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
