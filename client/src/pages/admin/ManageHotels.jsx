import React, { useEffect, useState } from "react";
import CrudTable from "../../components/admin/CrudTable";
import {
  STORE_KEY,
  getList,
  addItem,
  updateItem,
  deleteItem,
} from "../../data/adminStore";

export default function ManageHotels() {
  const [listing, setListing] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);

  const reload = () => {
    setListing(getList(STORE_KEY.hotel_listing_hotels));
    setRooms(getList(STORE_KEY.hotel_rooms));
    setReviews(getList(STORE_KEY.hotel_reviews));
    setSimilar(getList(STORE_KEY.hotel_similar_stays));
  };

  useEffect(() => reload(), []);

  const crud = (key, setter) => ({
    onAdd: (item) => {
      addItem(key, item);
      setter(getList(key));
    },
    onUpdate: (id, patch) => {
      updateItem(key, id, patch);
      setter(getList(key));
    },
    onDelete: (id) => {
      deleteItem(key, id);
      setter(getList(key));
    },
    onToggleStatus: (id, current) => {
      updateItem(key, id, {
        status: current === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      setter(getList(key));
    },
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 22 }}>Quản lý khách sạn</div>
        <div style={{ color: "#6b7280" }}>
          CRUD theo HotelData: LISTING_HOTELS, HOTEL_ROOMS, HOTEL_REVIEWS,
          SIMILAR_STAYS.
        </div>
      </div>

      <CrudTable
        title="LISTING_HOTELS"
        data={listing}
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "title", label: "Tên", type: "text" },
          { key: "stars", label: "Sao", type: "number" },
          { key: "location", label: "Khu vực", type: "text" },
          { key: "ratingScore", label: "Điểm", type: "number" },
          { key: "reviewCount", label: "Reviews", type: "number" },
          { key: "imageUrl", label: "Image URL", type: "text" },
        ]}
        {...crud(STORE_KEY.hotel_listing_hotels, setListing)}
      />

      <CrudTable
        title="HOTEL_ROOMS"
        data={rooms}
        schema={[
          { key: "id", label: "Room ID", type: "text" },
          { key: "title", label: "Tên phòng", type: "text" },
          { key: "bedDescription", label: "Giường", type: "text" },
          { key: "maxGuests", label: "Số khách", type: "number" },
        ]}
        {...crud(STORE_KEY.hotel_rooms, setRooms)}
      />

      <CrudTable
        title="HOTEL_REVIEWS"
        data={reviews}
        schema={[
          { key: "id", label: "ID", type: "number" },
          { key: "name", label: "Tên", type: "text" },
          { key: "countryName", label: "Quốc gia", type: "text" },
          { key: "text", label: "Nội dung", type: "textarea" },
        ]}
        {...crud(STORE_KEY.hotel_reviews, setReviews)}
      />

      <CrudTable
        title="SIMILAR_STAYS"
        data={similar}
        schema={[
          { key: "id", label: "ID", type: "text" },
          { key: "stayType", label: "Loại", type: "text" },
          { key: "name", label: "Tên", type: "text" },
          { key: "ratingScore", label: "Điểm", type: "number" },
          { key: "reviewCount", label: "Reviews", type: "number" },
          { key: "priceFrom", label: "Giá từ", type: "number" },
        ]}
        {...crud(STORE_KEY.hotel_similar_stays, setSimilar)}
      />
    </div>
  );
}
