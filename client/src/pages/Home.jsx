import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import "../styles/home.css";
import { cld } from "../utils/cld.js";
import catalogApi from "../api/catalogApi";
import inventoryApi from "../api/inventoryApi";

// Import hàm xử lý dữ liệu mới
import { mapProductToCard } from "../utils/formatData";

// Components
import UnifiedSearch from "../components/search/UnifiedSearch.jsx";
import Slider from "../components/home/Slider.jsx";
import Event from "../components/Event.jsx";
import SmallCard from "../components/home/SmallCard.jsx";
import BigCard from "../components/home/BigCard.jsx";
import BannerMobile from "../components/BannerMobile.jsx";
import AiChatWidget from "../components/ai/AiChatWidget.jsx";

// Dữ liệu giả
import { events, cities } from "../data/HomeData.jsx";

export default function Home() {
  const navigate = useNavigate();

  // Refs
  const refTours = useRef(null);
  const refLocations = useRef(null);

  // States
  const [realLocations, setRealLocations] = useState([]);
  const [realTours, setRealTours] = useState([]);
  // [KHÔI PHỤC] State lưu danh mục phân tầng
  const [categorySections, setCategorySections] = useState([]);
  const [loading, setLoading] = useState(true);
  // Sự kiện nổi bật trên cùng
  const [realEvents, setRealEvents] = useState([]);
  const [heroEvent, setHeroEvent] = useState(null);

  // --- 1. HÀM XỬ LÝ TÌM KIẾM ---
  const handleUnifiedSearch = (data) => {
    const params = new URLSearchParams();
    if (data.endPoint) params.append("q", data.endPoint);
    if (data.startPoint && data.startPoint !== "Tất cả")
      params.append("from", data.startPoint);
    if (data.date) params.append("date", data.date);
    if (data.budget) params.append("budget", data.budget);
    if (data.transport) params.append("transport", data.transport);
    if (data.hotelRating)
      params.append("star_rating", data.hotelRating.replace(/\D/g, ""));

    navigate(`/search?${params.toString()}`);
  };

  // --- 2. GỌI API LẤY DỮ LIỆU ---
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth() + 1;
        // a. Gọi API cơ bản
        const [locationsRes, toursRes, rootCatsRes, eventsRes] =
          await Promise.all([
            catalogApi.getAllLocations(),
            catalogApi.getAll({ product_type: "tour", limit: 8 }),
            catalogApi.getAllCategories({ parent: "null" }),
            inventoryApi.getEventsInMonth(curYear, curMonth),
          ]);

        // b. Xử lý LOCATION
        let locList = Array.isArray(locationsRes?.data || locationsRes)
          ? locationsRes?.data || locationsRes
          : [];
        setRealLocations(
          locList.map((loc) => {
            const img = loc?.images?.[0]?.url; // cloudinary url
            return {
              id: loc._id,
              title: loc.name,
              subTitle: "Điểm đến hot",
              imageUrl:
                typeof img === "string" && img.startsWith("http")
                  ? img
                  : "https://placehold.co/200x200?text=Location",
            };
          })
        );

        // c. Xử lý TOUR (Dùng mapProductToCard)
        const tourListRaw = Array.isArray(
          toursRes?.products || toursRes?.data?.products
        )
          ? toursRes?.products || toursRes?.data?.products
          : [];
        setRealTours(tourListRaw.map((p) => mapProductToCard(p)));

        // d. [KHÔI PHỤC] Xử lý CATEGORY SECTIONS (Đệ quy lấy con)
        const rootCats = Array.isArray(rootCatsRes.data)
          ? rootCatsRes.data
          : Array.isArray(rootCatsRes)
          ? rootCatsRes
          : [];

        // Load danh mục con cho từng danh mục cha
        const sectionsData = await Promise.all(
          rootCats.map(async (parentCat) => {
            try {
              const childrenRes = await catalogApi.getAllCategories({
                parent: parentCat._id,
              });
              const childrenList = Array.isArray(childrenRes.data)
                ? childrenRes.data
                : Array.isArray(childrenRes)
                ? childrenRes
                : [];

              if (childrenList.length === 0) return null; // Bỏ qua nếu không có con

              const formattedChildren = childrenList.map((child) => {
                const raw = child?.image?.url ?? child?.image; // hỗ trợ cả object & string (phòng khi backend trả khác)

                const base =
                  import.meta.env.VITE_API_URL || "http://localhost:3000";
                const img =
                  typeof raw === "string" && raw
                    ? raw.startsWith("http")
                      ? raw
                      : `${base}${raw.startsWith("/") ? "" : "/"}${raw}` // nếu backend trả "/uploads/..."
                    : "";

                return {
                  id: child._id,
                  title: child.name,
                  subTitle: "Khám phá ngay",
                  imageUrl:
                    img ||
                    `https://placehold.co/300x300/e0f7fa/006064?text=${encodeURIComponent(
                      child.name
                    )}`,
                };
              });

              return {
                parentId: parentCat._id,
                parentTitle: parentCat.name,
                children: formattedChildren,
              };
            } catch (err) {
              return null;
            }
          })
        );

        // e. Xử lý EVENTS từ inventory-service
        const eventsList = Array.isArray(eventsRes?.data) ? eventsRes.data : [];

        const formattedEvents = eventsList.map((ev) => ({
          backgroundUrl:
            ev?.image?.url || "https://placehold.co/1200x450?text=Event",
          alt: ev?.name || "Event",
          href: `/event/${ev?.slug || ev?._id}`,
        }));

        setRealEvents(formattedEvents);
        setHeroEvent(formattedEvents[0] || null);

        setCategorySections(sectionsData.filter((section) => section));
      } catch (error) {
        console.error("Lỗi tải dữ liệu Home:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      {/* --- PHẦN 1: BANNER & TÌM KIẾM --- */}
      <div
        className="py-5 bg-light shadow-sm mb-2"
        style={{
          backgroundImage: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
        }}
      >
        <Container>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2 text-primary">
              Khám phá thế giới cùng GoTripViet
            </h2>
            <p className="text-muted fs-5">
              Tìm tour du lịch trọn gói, giá tốt nhất dành cho bạn
            </p>
          </div>
          <UnifiedSearch
            onSearch={handleUnifiedSearch}
            locations={realLocations}
          />
        </Container>
      </div>

      {/* --- PHẦN 2: SỰ KIỆN --- */}
      <Container className="my-4">
        <Event
          backgroundUrl={
            heroEvent?.backgroundUrl ||
            cld("event_boxingday_iusunh", {
              w: 1200,
              h: 450,
              crop: "fill",
              g: "auto",
            })
          }
          alt={heroEvent?.alt || "Event"}
          href={heroEvent?.href || "/events"} // fallback nếu chưa có event
        />
      </Container>

      <Container className="my-4">
        <Slider
          title="Ưu đãi & Sự kiện"
          items={realEvents}
          itemMinWidth={350}
          renderItem={(e) => <Event {...e} />}
        />
      </Container>

      {/* --- PHẦN 3: ĐIỂM ĐẾN PHỔ BIẾN --- */}
      <Container className="my-5" ref={refLocations}>
        <Slider
          title="Điểm đến yêu thích"
          description="Khám phá các địa danh nổi tiếng"
          items={realLocations.length > 0 ? realLocations : cities}
          itemMinWidth={220}
          renderItem={(c) => (
            <SmallCard
              {...c}
              onClick={() =>
                navigate(
                  `/search?location=${c.id}&q=${encodeURIComponent(c.title)}`
                )
              }
            />
          )}
        />
      </Container>

      {/* --- [KHÔI PHỤC] PHẦN 4: DANH MỤC TOUR (Category Sections) --- */}
      {/* Hiển thị các slider theo danh mục cha (VD: Miền Bắc, Miền Trung...) */}
      {categorySections.map((section) => (
        <Container className="my-5" key={section.parentId}>
          <Slider
            title={`Khám phá ${section.parentTitle}`}
            description={`Các tour du lịch hấp dẫn tại ${section.parentTitle}`}
            items={section.children}
            itemMinWidth={220}
            renderItem={(childCat) => (
              <SmallCard
                {...childCat}
                onClick={() =>
                  navigate(
                    `/search?category=${childCat.id}&q=${encodeURIComponent(
                      childCat.title
                    )}`
                  )
                }
              />
            )}
          />
        </Container>
      ))}

      {/* --- PHẦN 5: TOUR MỚI NHẤT --- */}
      <Container className="my-5" ref={refTours}>
        <Slider
          title="Tour du lịch mới nhất"
          description="Đừng bỏ lỡ các ưu đãi hấp dẫn đang chờ bạn"
          items={realTours}
          itemMinWidth={300}
          renderItem={(item) => (
            <BigCard
              {...item}
              onClick={() => navigate(`/product/${item.id}`)}
            />
          )}
        />
      </Container>

      {/* --- PHẦN 6: BANNER APP --- */}
      <div className="mt-5">
        <BannerMobile
          backgroundUrl="/assets/app/app_bg.jpg"
          title="Tải ứng dụng ngay"
        />
      </div>
      <AiChatWidget />
    </>
  );
}
