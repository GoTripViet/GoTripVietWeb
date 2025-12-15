import React, { useMemo, useState } from "react";
import { cld } from "../utils/cld.js";
import SearchingBar from "../components/listing/SearchingBar.jsx";
import BestChoiceSearch from "../components/listing/BestChoiceSearch.jsx";
import Slider from "../components/listing/Slider.jsx";
import ListingCard from "../components/listing/HotelCard.jsx";
import { useLocation } from "react-router-dom";

// ====== DUMMY DATA – bạn có thể thay bằng data thật từ API ======
const SIMILAR_STAYS = [
  {
    imageUrl: cld("hotel_danang_pwadaf", { w: 640, h: 480 }),
    stayType: "Nhà nghỉ giữa thiên nhiên",
    stars: 2,
    name: "Green Hope Lodge",
    ratingScore: 9.0,
    reviewCount: 728,
    distanceToCenterKm: 3.1,
    priceFrom: 770000,
  },
  {
    imageUrl: cld("hotel_danang_pwadaf", { w: 640, h: 480 }),
    stayType: "Nhà khách",
    name: "Forest Side Ecolodge",
    ratingScore: 8.8,
    reviewCount: 130,
    distanceToCenterKm: 3.3,
    priceFrom: 489888,
  },
  {
    imageUrl: "/assets/hotels/cat-tien-jungle.jpg",
    stayType: "Khách sạn",
    name: "Cat Tien Jungle Lodge",
    ratingScore: 7.4,
    reviewCount: 34,
    distanceToCenterKm: 3.3,
    priceFrom: 1400000,
  },
  {
    imageUrl: cld("hotel_danang_pwadaf", { w: 640, h: 480 }),
    stayType: "Nhà nghỉ giữa thiên nhiên",
    name: "Thuy Tien Ecolodge",
    ratingScore: 9.2,
    reviewCount: 259,
    distanceToCenterKm: 3.2,
    priceFrom: 500000,
  },
];

const LISTING_HOTELS = [
  {
    imageUrl: cld("hotel_danang_pwadaf", { w: 640, h: 480 }),
    title: "Green Bamboo Lodge Resort",
    stars: 3,
    badgeLabel: "Nổi bật",
    location: "Cát Tiên",
    distanceToCenterKm: 3.4,
    ratingScore: 8.6,
    reviewCount: 689,
    eventLabel: "Ưu đãi cuối năm",
    roomName: "Chalet",
    roomDescription: {
      bathrooms: 1,
      bedrooms: 1,
      areaM2: 25,
      bedSummary: "1 giường đôi lớn",
      extraText: "Phù hợp cho 2 người lớn",
    },
    includesBreakfast: true,
    freeCancellation: true,
    payAtProperty: true,
    remainingRoomsText: "Chỉ còn 1 phòng với giá này trên trang của chúng tôi",
    priceInfo: {
      basePrice: 900000,
      discountedPrice: 665000,
      currency: "VND",
      nights: 1,
      adults: 2,
    },
  },
  {
    imageUrl: cld("hotel_danang_pwadaf", { w: 640, h: 480 }),
    title: "Green Hope Lodge",
    stars: 2,
    location: "Cát Tiên",
    distanceToCenterKm: 3.1,
    ratingScore: 9.0,
    reviewCount: 728,
    roomName: "Phòng Superior 4 Người Nhìn ra Dòng sông",
    roomDescription: {
      bathrooms: 1,
      bedrooms: 1,
      bedSummary: "2 giường đôi",
      extraText: "Ban công · Tầm nhìn ra sông",
    },
    includesBreakfast: true,
    freeCancellation: true,
    payAtProperty: true,
    remainingRoomsText: "Chỉ còn 3 phòng với giá này trên trang của chúng tôi",
    priceInfo: {
      basePrice: 770000,
      currency: "VND",
      nights: 1,
      adults: 2,
    },
  },
  {
    imageUrl: cld("hotel_danang_pwadaf", { w: 640, h: 480 }),
    title: "Lava Rock Viet Nam Lodge",
    stars: 3,
    location: "Cát Tiên",
    distanceToCenterKm: 1.2,
    ratingScore: 8.3,
    reviewCount: 123,
    roomName: "Bungalow Nhìn ra Vườn",
    roomDescription: {
      bathrooms: 1,
      isWholeBungalow: true,
      bedSummary: "1 giường đôi lớn",
    },
    includesBreakfast: true,
    freeCancellation: true,
    priceInfo: {
      basePrice: 950000,
      currency: "VND",
      nights: 1,
      adults: 2,
    },
  },
];

const ListingHotel = ({
  destinationName = "Cát Tiên",
  totalStays = 12,
  hotels = LISTING_HOTELS,
  similarStays = SIMILAR_STAYS,
  onNavigateToHotelDetail,
}) => {
  const [sortValue, setSortValue] = useState();
  const location = useLocation();

  const qFromUrl = useMemo(() => {
    const q = new URLSearchParams(location.search).get("q");
    return (q || "").trim();
  }, [location.search]);

  const effectivePlace = qFromUrl || destinationName;
  const mainHotel = hotels[0];
  const otherHotels = hotels.slice(1);

  return (
    <div className="container my-4">
      <div className="row">
        {/* Cột trái: thanh lọc */}
        <div className="col-12 col-lg-3 mb-3 mb-lg-0">
          <SearchingBar mapQuery={effectivePlace} />
        </div>

        {/* Cột phải: kết quả listing */}
        <div className="col-12 col-lg-9">
          {/* Header trên cùng */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div>
              <h4 className="fw-bold mb-1">
                {effectivePlace}: tìm thấy {totalStays} chỗ nghỉ
              </h4>
            </div>
            <BestChoiceSearch
              className="ms-auto"
              value={sortValue}
              onChange={(v) => setSortValue(v)}
            />
          </div>

          {/* Hotel đầu tiên nổi bật */}
          {mainHotel && (
            <ListingCard
              {...mainHotel}
              onViewAvailability={() =>
                onNavigateToHotelDetail && onNavigateToHotelDetail(mainHotel)
              }
            />
          )}

          {/* Slider những chỗ nghỉ khác bạn có thể thích */}
          {similarStays.length > 0 && (
            <div className="mt-3 mb-3">
              <Slider
                title="Những chỗ nghỉ khác bạn có thể thích"
                description={`Những chỗ nghỉ tương tự với ${
                  mainHotel?.title ?? ""
                }`}
                items={similarStays}
              />
            </div>
          )}

          {/* Các chỗ nghỉ khác */}
          <div className="mt-3">
            {otherHotels.map((hotel) => (
              <ListingCard
                key={hotel.title}
                {...hotel}
                onViewAvailability={() =>
                  onNavigateToHotelDetail && onNavigateToHotelDetail(hotel)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingHotel;
