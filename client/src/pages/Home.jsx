import React, { useEffect, useRef } from "react";
import Container from "react-bootstrap/Container";
import "../styles/home.css";
import { cld } from "../utils/cld.js";

// Components
import HotelSearch from "../components/search/HotelSearch.jsx";
import PlaneSearch from "../components/search/PlaneSearch.jsx";
import RentCarSearch from "../components/search/RentCarSearch.jsx";
import HotelAndPlaneSearch from "../components/search/HotelAndPlaneSearch.jsx";
import TaxiAirportSearch from "../components/search/TaxiAirportSearch.jsx";
import ActivitiesSearch from "../components/search/ActivitiesSearch.jsx";
import TaxiAirport from "../components/TaxiAirport.jsx";
import Faq from "../components/Faq.jsx";
import TaxiHowItWorks from "../components/TaxiHowItWorks.jsx";
import Listing from "../components/Listing.jsx";
import GridLayout from "../components/GridLayout.jsx";
import Slider from "../components/home/Slider.jsx";
import Event from "../components/Event.jsx";
import SmallCard from "../components/home/SmallCard.jsx";
import BigCard from "../components/home/BigCard.jsx";
import BannerMobile from "../components/BannerMobile.jsx";

// Data
import {
  events,
  cities,
  nearby_cities,
  flights,
  hotelsTopRated,
  hotels,
  discount_hotels,
  hotelCategories,
  planeCategories,
  activitiesCategories,
  activities,
  TAXI_FAQ_ITEMS,
  RENTCAR_FAQ_ITEMS,
  popularDestinations,
  FLIGHT_FAQ_ITEMS,
} from "../data/HomeData.jsx";

// ====== Helper: tracking & highlight ======
function pushDL(payload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "gtv_event", ...payload });
}

export default function Home({
  activeCategoryIndex,
  onNavigateToHotels,
  onNavigateToCities,
}) {
  const refEvents = useRef(null);
  const refCities = useRef(null);
  const refHotels = useRef(null);
  const refTopRated = useRef(null);

  // Highlight category “Lưu trú”
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .gv-header .gv-cat:first-child span { color:#53c3bf; font-weight:700; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Tracking
  useEffect(() => {
    pushDL({ page: "home_view" });

    const makeObserver = (name, el) => {
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (e) => e.isIntersecting && pushDL({ section_impression: name })
          );
        },
        { threshold: 0.4 }
      );
      io.observe(el);
      return io;
    };

    const o1 = makeObserver("events", refEvents.current);
    const o2 = makeObserver("popular_cities", refCities.current);
    const o3 = makeObserver("best_deals", refHotels.current);
    const o4 = makeObserver("top_rated", refTopRated.current);
    return () => {
      o1 && o1.disconnect();
      o2 && o2.disconnect();
      o3 && o3.disconnect();
      o4 && o4.disconnect();
    };
  }, []);

  // === phần nội dung thay đổi theo category ===
  const renderBody = () => {
    const activeCat = activeCategoryIndex;
    switch (activeCat) {
      // 0: Lưu trú
      case 0:
        return (
          <>
            <Container className="my-3">
              <HotelSearch
                onSearch={(r) => pushDL({ search_submit: true, ...r })}
              />
            </Container>
            <Container className="my-4">
              <Event
                backgroundUrl={cld("event_boxingday_iusunh", {
                  w: 1200,
                  h: 450,
                  crop: "fill",
                  g: "auto",
                })}
                alt="Boxing Day Sale"
                href="/su-kien/boxing-day"
                target="_blank"
                onClick={() => {
                  console.log("User click event banner");
                }}
              />
            </Container>
            <Container className="my-3" ref={refEvents}>
              <Slider
                title="Sự kiện nổi bật"
                description="Các ưu đãi đang diễn ra trong thời gian ngắn, đừng bỏ lỡ nhé!"
                items={events}
                itemMinWidth={560}
                renderItem={(e) => (
                  <Event
                    {...e}
                    onClick={() =>
                      pushDL({
                        click_event: e.title?.props?.children?.[0] || "event",
                      })
                    }
                  />
                )}
              />
            </Container>

            <Container className="my-4" ref={refCities}>
              <Slider
                title="Khám phá Việt Nam"
                description="Các điểm đến phổ biến này có nhiều điều chờ đón bạn"
                items={cities}
                itemMinWidth={220}
                renderItem={(c) => (
                  <SmallCard
                    {...c}
                    onClick={() => {
                      pushDL({ click_city: c.title });
                      onNavigateToHotels?.(c.title);
                    }}
                  />
                )}
              />
            </Container>

            <Container className="my-4" ref={refTopRated}>
              <Slider
                title="Top chỗ nghỉ xếp hạng cao"
                description="Được đánh giá xuất sắc bởi khách hàng của chúng tôi"
                items={hotelsTopRated}
                itemMinWidth={320}
                renderItem={(h) => (
                  <BigCard
                    {...h}
                    onClick={() => {
                      pushDL({ click_top_rated: h.title });
                      onNavigateToHotels?.(
                        `${h.title}${h.location ? `, ${h.location}` : ""}`
                      );
                    }}
                    onClickHeart={() =>
                      pushDL({ wishlist_toggle: h.title, row: "top_rated" })
                    }
                  />
                )}
              />
            </Container>

            <Container className="my-4" ref={refCities}>
              <Slider
                title="Lên kế hoạch dễ dàng và nhanh chóng"
                description="Khám phá các điểm đến hàng đầu theo cách bạn thích ở Việt Nam"
                items={nearby_cities}
                itemMinWidth={220}
                renderItem={(c) => (
                  <SmallCard
                    {...c}
                    onClick={() => {
                      pushDL({ click_city: c.title });
                      onNavigateToHotels?.(c.title);
                    }}
                  />
                )}
              />
            </Container>

            <Container className="my-4" ref={refHotels}>
              <Slider
                title="Chỗ nghỉ mà bạn yêu thích"
                description="Những chỗ nghỉ được khách hàng của chúng tôi yêu thích"
                items={hotels}
                itemMinWidth={320}
                renderItem={(h) => (
                  <BigCard
                    {...h}
                    onClick={() => {
                      pushDL({ click_top_rated: h.title });
                      onNavigateToHotels?.(
                        `${h.title}${h.location ? `, ${h.location}` : ""}`
                      );
                    }}
                    onClickHeart={() => pushDL({ wishlist_toggle: h.title })}
                  />
                )}
              />
            </Container>

            <Container className="my-4" ref={refHotels}>
              <Slider
                title="Ưu đãi chỗ nghỉ hấp dẫn"
                description="Những chỗ nghỉ được khách hàng của chúng tôi yêu thích"
                items={discount_hotels}
                itemMinWidth={320}
                renderItem={(h) => (
                  <BigCard
                    {...h}
                    onClick={() => {
                      pushDL({ click_top_rated: h.title });
                      onNavigateToHotels?.(
                        `${h.title}${h.location ? `, ${h.location}` : ""}`
                      );
                    }}
                    onClickHeart={() => pushDL({ wishlist_toggle: h.title })}
                  />
                )}
              />
            </Container>

            <Container className="my-4">
              <Listing
                title="Phổ biến với du khách từ Việt Nam"
                description="Khám phá các hoạt động khác"
                categories={hotelCategories}
                initialVisibleCount={20}
                onItemClick={() => {
                  pushDL({ click_listing_hotel: true });
                  onNavigateToHotels?.("Việt Nam");
                }}
              />
            </Container>

            <BannerMobile
              backgroundUrl="/assets/app/app_bg.jpg"
              title="Chuyến đi mơ ước trong tầm tay"
              qrUrl="/assets/app/qr.png"
              googlePlayBadgeUrl="/assets/app/googleplay.png"
              appStoreBadgeUrl="/assets/app/appstore.png"
            />
          </>
        );

      // 1: Chuyến bay
      case 1:
        return (
          <>
            <Container className="my-3">
              <PlaneSearch
                onSearch={(r) => pushDL({ plane_search_submit: true, ...r })}
              />
            </Container>
            <Container className="my-3" ref={refEvents}>
              <Slider
                title="Sự kiện nổi bật"
                description="Các ưu đãi đang diễn ra trong thời gian ngắn, đừng bỏ lỡ nhé!"
                items={events}
                itemMinWidth={560}
                renderItem={(e) => (
                  <Event
                    {...e}
                    onClick={() =>
                      pushDL({
                        click_event: e.title?.props?.children?.[0] || "event",
                      })
                    }
                  />
                )}
              />
            </Container>
            <Container className="my-4" ref={refCities}>
              <Slider
                title="Chuyến bay quốc tế phổ biến gần bạn"
                description="Tìm ưu đãi cho chuyến bay ngoài nước"
                items={flights}
                itemMinWidth={220}
                renderItem={(c) => (
                  <SmallCard
                    {...c}
                    onClick={() => {
                      pushDL({ click_city: c.title });
                      onNavigateToCities?.(c.title);
                    }}
                  />
                )}
              />
            </Container>
            <Container className="my-4" ref={refCities}>
              <Slider
                title="Chuyến bay trong nước phổ biến gần bạn"
                description="Tìm ưu đãi cho chuyến bay trong nước"
                items={flights}
                itemMinWidth={220}
                renderItem={(c) => (
                  <SmallCard
                    {...c}
                    onClick={() => {
                      pushDL({ click_city: c.title });
                      onNavigateToCities?.(c.title);
                    }}
                  />
                )}
              />
            </Container>
            <Container className="my-4">
              <Faq
                title="Các câu hỏi thường gặp về chuyến bay trên GoTripViet"
                description={null}
                items={FLIGHT_FAQ_ITEMS}
                defaultOpenAll={true}
                columns={2}
              />
            </Container>
            <Container className="my-4">
              <Listing
                title="Các chuyến bay hàng đầu từ Việt Nam"
                description="Khám phá các điểm đến có thể đi từ Việt Nam và lên kế hoạch mới"
                categories={planeCategories}
                initialVisibleCount={8}
                onItemClick={() => {
                  pushDL({ click_listing_hotel: true });
                  onNavigateToCities?.("Việt Nam");
                }}
              />
            </Container>
          </>
        );

      // 2: Combo chuyến bay + khách sạn
      case 2:
        return (
          <>
            <Container className="my-3">
              <HotelAndPlaneSearch
                onSearch={(r) => pushDL({ combo_search_submit: true, ...r })}
              />
            </Container>
            <Container className="my-4">
              <Event
                backgroundUrl={cld("event_boxingday_iusunh", {
                  w: 1200,
                  h: 450,
                  crop: "fill",
                  g: "auto",
                })}
                alt="Boxing Day Sale"
                href="/su-kien/boxing-day"
                target="_blank"
                onClick={() => {
                  console.log("User click event banner");
                }}
              />
            </Container>
            <Container className="my-3" ref={refEvents}>
              <Slider
                title="Sự kiện nổi bật"
                description="Các ưu đãi đang diễn ra trong thời gian ngắn, đừng bỏ lỡ nhé!"
                items={events}
                itemMinWidth={560}
                renderItem={(e) => (
                  <Event
                    {...e}
                    onClick={() =>
                      pushDL({
                        click_event: e.title?.props?.children?.[0] || "event",
                      })
                    }
                  />
                )}
              />
            </Container>
            <Container className="my-4" ref={refCities}>
              <Slider
                title="Chuyến bay quốc tế phổ biến gần bạn"
                description="Tìm ưu đãi cho chuyến bay ngoài nước"
                items={flights}
                itemMinWidth={220}
                renderItem={(c) => (
                  <SmallCard
                    {...c}
                    onClick={() => {
                      pushDL({ click_city: c.title });
                      onNavigateToHotels?.(c.title);
                    }}
                  />
                )}
              />
            </Container>
            <Container className="my-4" ref={refHotels}>
              <Slider
                title="Ưu đãi chỗ nghỉ hấp dẫn"
                description="Những chỗ nghỉ được khách hàng của chúng tôi yêu thích"
                items={discount_hotels}
                itemMinWidth={320}
                renderItem={(h) => (
                  <BigCard
                    {...h}
                    onClick={() => {
                      pushDL({ click_top_rated: h.title });
                      onNavigateToHotels?.(
                        `${h.title}${h.location ? `, ${h.location}` : ""}`
                      );
                    }}
                    onClickHeart={() => pushDL({ wishlist_toggle: h.title })}
                  />
                )}
              />
            </Container>
            <Container className="my-4">
              <GridLayout
                title="Điểm đến đang thịnh hành"
                description="Du khách tìm kiếm về Việt Nam cũng đặt chỗ ở những nơi này"
                items={popularDestinations}
                maxItems={6}
              />
            </Container>
            <Container className="my-4">
              <Listing
                title="Các chuyến bay hàng đầu từ Việt Nam"
                description="Khám phá các điểm đến có thể đi từ Việt Nam và lên kế hoạch mới"
                categories={planeCategories}
                initialVisibleCount={8}
                onItemClick={() => {
                  pushDL({ click_listing_hotel: true });
                  onNavigateToHotels?.("Việt Nam");
                }}
              />
            </Container>
          </>
        );

      // 3: Taxi sân bay
      case 3:
        return (
          <>
            <Container className="my-3">
              <TaxiAirportSearch
                onSearch={(r) => pushDL({ taxi_search_submit: true, ...r })}
              />
            </Container>

            <Container className="my-4">
              <TaxiHowItWorks />
              <div className="mt-5 my-4">
                <Faq
                  title="Tìm hiểu thêm về dịch vụ taxi sân bay của chúng tôi"
                  description={
                    <>
                      Xem thêm các câu hỏi thường gặp trên{" "}
                      <a href="#" className="text-primary text-decoration-none">
                        trang trợ giúp
                      </a>
                    </>
                  }
                  items={TAXI_FAQ_ITEMS}
                  defaultOpenAll={true}
                  columns={2}
                />
              </div>
              <TaxiAirport />
            </Container>
          </>
        );

      // 4: Thuê xe
      case 4:
        return (
          <>
            <Container className="my-3">
              <RentCarSearch
                onSearch={(r) => pushDL({ rentcar_search_submit: true, ...r })}
              />
            </Container>
            <Container className="my-4">
              <Faq
                title="Các câu hỏi thường gặp"
                description={null}
                items={RENTCAR_FAQ_ITEMS}
                defaultOpenAll={true}
                columns={2}
              />
            </Container>
          </>
        );

      // 5: Hoạt động
      case 5:
        return (
          <>
            <Container className="my-3">
              <ActivitiesSearch
                onSearch={(r) =>
                  pushDL({ activities_search_submit: true, ...r })
                }
              />
            </Container>
            <Container className="my-3" ref={refEvents}>
              <Slider
                title="Sự kiện nổi bật"
                description="Các ưu đãi đang diễn ra trong thời gian ngắn, đừng bỏ lỡ nhé!"
                items={events}
                itemMinWidth={560}
                renderItem={(e) => (
                  <Event
                    {...e}
                    onClick={() =>
                      pushDL({
                        click_event: e.title?.props?.children?.[0] || "event",
                      })
                    }
                  />
                )}
              />
            </Container>
            <Container className="my-4">
              <GridLayout
                title="Điểm đến đang thịnh hành"
                description="Du khách tìm kiếm về Việt Nam cũng đặt chỗ ở những nơi này"
                items={popularDestinations}
                maxItems={6}
              />
            </Container>
            <Container className="my-4" ref={refCities}>
              <Slider
                title="Khám phá thêm nhiều điểm đến khác"
                description="Tìm địa điểm tham quan tại các thành phố trên thế giới"
                items={activities}
                itemMinWidth={220}
                renderItem={(c) => (
                  <SmallCard
                    {...c}
                    onClick={() => {
                      pushDL({ click_city: c.title });
                      onNavigateToHotels?.(c.title);
                    }}
                  />
                )}
              />
            </Container>
            <Container className="my-4">
              <Listing
                title="Phổ biến với du khách từ Việt Nam"
                description="Khám phá các hoạt động khác"
                categories={activitiesCategories}
                initialVisibleCount={8}
                onItemClick={() => {
                  pushDL({ click_listing_hotel: true });
                  onNavigateToHotels?.("Việt Nam");
                }}
              />
            </Container>
          </>
        );

      default:
        return null;
    }
  };

  return <>{renderBody()}</>;
}
