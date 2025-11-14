import React, { useEffect, useRef } from "react";
import Container from "react-bootstrap/Container";
import "../styles/home.css";
import { cld } from "../utils/cld.ts";
// Components
import Header from "../components/Header.tsx";
import HotelSearch from "../components/HotelSearch.tsx";
import PlaneSearch from "../components/PlaneSearch.tsx";
import RentCarSearch from "../components/RentCarSearch.tsx";
import HotelAndPlaneSearch from "../components/HotelAndPlaneSearch.tsx";
import TaxiAirportSearch from "../components/TaxiAirportSearch.tsx";
import ActivitiesSearch from "../components/ActivitiesSearch.tsx";
import TaxiAirport from "../components/TaxiAirport.tsx";
import Faq from "../components/Faq.tsx";
import TaxiHowItWorks from "../components/TaxiHowItWork.tsx";
import Listing from "../components/Listing.tsx";
import GridLayout from "../components/GridLayout.tsx";
import Slider from "../components/Slider.tsx";
import Event from "../components/Event.tsx";
import SmallCard from "../components/SmallCard.tsx";
import BigCard from "../components/BigCard.tsx";
import BannerMobile from "../components/BannerMobile.tsx";
import Footer from "../components/Footer.tsx";
// Logo
import logoOutlineUrl from "../assets/logo/logo_outline.png";
import logoOutLineBesideUrl from "../assets/logo/logo_outline_beside.png";
// Data types

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
  popularDestinations
} from "./HomeData.tsx";


// ====== Helper: tracking & highlight ======
function pushDL(payload: Record<string, unknown>) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: "gtv_event", ...payload });
}

export default function Home() {
  const refEvents = useRef<HTMLDivElement | null>(null);
  const refCities = useRef<HTMLDivElement | null>(null);
  const refHotels = useRef<HTMLDivElement | null>(null);
  const refTopRated = useRef<HTMLDivElement | null>(null);
  const [activeCat, setActiveCat] = React.useState(0);

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

    const makeObserver = (name: string, el?: HTMLElement | null) => {
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => e.isIntersecting && pushDL({ section_impression: name }));
        },
        { threshold: 0.4 },
      );
      io.observe(el);
      return io;
    };

    const o1 = makeObserver("events", refEvents.current);
    const o2 = makeObserver("popular_cities", refCities.current);
    const o3 = makeObserver("best_deals", refHotels.current);
    const o4 = makeObserver("top_rated", refTopRated.current);
    return () => {
      o1?.disconnect();
      o2?.disconnect();
      o3?.disconnect();
      o4?.disconnect();
    };
  }, []);

  // === phần nội dung thay đổi theo category ===
  const renderBody = () => {
    switch (activeCat) {
      // 0: Lưu trú
      case 0:
        return (
          <>
            <Container className="my-3">
              <HotelSearch onSearch={(r) => pushDL({ search_submit: true, ...r })} />
            </Container>
            <Container className="my-4">
              <Event
                backgroundUrl={cld("event_boxingday_iusunh", { w: 1200, h: 450, crop: "fill", g: "auto" })}
                alt="Boxing Day Sale"
                href="/su-kien/boxing-day"
                target="_blank"
                onClick={() => {
                  console.log("User click event banner");
                  // hoặc pushDL(...) nếu bạn đang tracking
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
                        click_event: (e.title as any)?.props?.children?.[0] || "event",
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
                    onClick={() => pushDL({ click_city: c.title })}
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
                    onClick={() => pushDL({ click_city: c.title })}
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
                        click_event: (e.title as any)?.props?.children?.[0] || "event",
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
                    onClick={() => pushDL({ click_city: c.title })}
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
                    onClick={() => pushDL({ click_city: c.title })}
                  />
                )}
              />
            </Container>
            <Container className="my-4">
              <Listing
                title="Các chuyến bay hàng đầu từ Việt Nam"
                description="Khám phá các điểm đến có thể đi từ Việt Nam và lên kế hoạch mới"
                categories={planeCategories}
                initialVisibleCount={8}
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
                backgroundUrl={cld("event_boxingday_iusunh", { w: 1200, h: 450, crop: "fill", g: "auto" })}
                alt="Boxing Day Sale"
                href="/su-kien/boxing-day"
                target="_blank"
                onClick={() => {
                  console.log("User click event banner");
                  // hoặc pushDL(...) nếu bạn đang tracking
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
                        click_event: (e.title as any)?.props?.children?.[0] || "event",
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
                    onClick={() => pushDL({ click_city: c.title })}
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
              />;
            </Container>
            <Container className="my-4">
              <Listing
                title="Các chuyến bay hàng đầu từ Việt Nam"
                description="Khám phá các điểm đến có thể đi từ Việt Nam và lên kế hoạch mới"
                categories={planeCategories}
                initialVisibleCount={8}
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
                onSearch={(r) => pushDL({ activities_search_submit: true, ...r })}
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
                        click_event: (e.title as any)?.props?.children?.[0] || "event",
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
              />;
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
                    onClick={() => pushDL({ click_city: c.title })}
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
              />
            </Container>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header cố định */}
      <Header
        logoSrc={logoOutLineBesideUrl}
        onLogin={() => {
          pushDL({ click: "login" });
          window.location.href = "/login";  
        }}
        onRegister={() => {
          pushDL({ click: "register" });
          window.location.href = "/login";
        }}
        activeCategoryIndex={activeCat}
        onCategoryChange={(idx) => setActiveCat(idx)}
      />

      {/* phần thân: đổi hoàn toàn theo activeCat */}
      {renderBody()}

      {/* Footer cố định */}
      <Footer logoSrc={logoOutlineUrl} />
    </>
  );
}
