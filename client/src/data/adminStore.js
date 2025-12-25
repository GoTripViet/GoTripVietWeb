import { DUMMY_FLIGHTS } from "./FlightsData.jsx";
import * as HomeData from "./HomeData.jsx";
import * as HotelData from "./HotelData.jsx";

// ===== keys =====
const KEY = {
  adminMe: "gtv_admin_me",
  admins: "gtv_admin_list",
  users: "gtv_user_list",

  flights: "gtv_admin_flights",
  home_events: "gtv_home_events",
  home_cities: "gtv_home_cities",
  home_hotelsTopRated: "gtv_home_hotelsTopRated",
  home_hotels: "gtv_home_hotels",
  home_discount_hotels: "gtv_home_discount_hotels",
  home_city_deals: "gtv_home_city_deals",

  hotel_listing_hotels: "gtv_hotel_listing_hotels",
  hotel_rooms: "gtv_hotel_rooms",
  hotel_reviews: "gtv_hotel_reviews",
  hotel_similar_stays: "gtv_hotel_similar_stays",

  expenses: "gtv_admin_expenses",
};

// ===== helpers =====
const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

// ===== init =====
export function ensureAdminSeed() {
  // admin me
  const me = read(KEY.adminMe, null);
  if (!me) {
    write(KEY.adminMe, {
      id: "admin_me",
      avatar: "https://i.pravatar.cc/100?img=12", // tạm, bạn thay bằng cld nếu muốn
      fullName: "Admin GoTripViet",
      phone: "0900000000",
      email: "admin@gotripviet.local",
      address: "TP. Hồ Chí Minh",
      dob: "1999-01-01",
      createdAt: new Date().toISOString().slice(0, 10),
      passwordMasked: true,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    });
  }

  // admins list
  const admins = read(KEY.admins, null);
  if (!admins) {
    write(KEY.admins, [
      {
        id: "a1",
        avatar: "https://i.pravatar.cc/100?img=5",
        fullName: "Admin A",
        email: "admin.a@gotripviet.local",
        phone: "0911111111",
        address: "Hà Nội",
        dob: "1998-02-02",
        createdAt: "2025-01-01",
        role: "ADMIN",
        status: "ACTIVE",
      },
      {
        id: "a2",
        avatar: "https://i.pravatar.cc/100?img=8",
        fullName: "Admin B",
        email: "admin.b@gotripviet.local",
        phone: "0922222222",
        address: "Đà Nẵng",
        dob: "1997-03-03",
        createdAt: "2025-02-10",
        role: "ADMIN",
        status: "LOCKED",
      },
    ]);
  }

  // users list (mock)
  const users = read(KEY.users, null);
  if (!users) {
    write(KEY.users, [
      {
        id: "u1",
        fullName: "Nguyễn Văn A",
        email: "a.user@example.com",
        phone: "0933333333",
        createdAt: "2025-05-01",
        status: "ACTIVE",
      },
      {
        id: "u2",
        fullName: "Trần Thị B",
        email: "b.user@example.com",
        phone: "0944444444",
        createdAt: "2025-06-12",
        status: "BANNED",
      },
    ]);
  }

  // flights
  const flights = read(KEY.flights, null);
  if (!flights) {
    write(
      KEY.flights,
      (DUMMY_FLIGHTS || []).map((f) => ({
        ...f,
        status: f.status || "ACTIVE",
      }))
    );
  }

  // home datasets (chọn vài mảng “core” để CRUD)
  if (!read(KEY.home_events, null))
    write(
      KEY.home_events,
      (HomeData.events || []).map((x, i) => ({
        id: x.id || `ev_${i}`,
        ...x,
        status: "ACTIVE",
      }))
    );
  if (!read(KEY.home_cities, null))
    write(
      KEY.home_cities,
      (HomeData.cities || []).map((x, i) => ({
        id: x.id || `ct_${i}`,
        ...x,
        status: "ACTIVE",
      }))
    );
  if (!read(KEY.home_hotelsTopRated, null))
    write(
      KEY.home_hotelsTopRated,
      (HomeData.hotelsTopRated || []).map((x, i) => ({
        id: x.id || `htr_${i}`,
        ...x,
        status: "ACTIVE",
      }))
    );
  if (!read(KEY.home_hotels, null))
    write(
      KEY.home_hotels,
      (HomeData.hotels || []).map((x, i) => ({
        id: x.id || `ht_${i}`,
        ...x,
        status: "ACTIVE",
      }))
    );
  if (!read(KEY.home_discount_hotels, null))
    write(
      KEY.home_discount_hotels,
      (HomeData.discount_hotels || []).map((x, i) => ({
        id: x.id || `dh_${i}`,
        ...x,
        status: "ACTIVE",
      }))
    );
  if (!read(KEY.home_city_deals, null))
    write(
      KEY.home_city_deals,
      (HomeData.CITY_DEALS || []).map((x) => ({ ...x, status: "ACTIVE" }))
    );

  // hotel datasets
  if (!read(KEY.hotel_listing_hotels, null))
    write(
      KEY.hotel_listing_hotels,
      (HotelData.LISTING_HOTELS || []).map((x, i) => ({
        id: x.id || `lh_${i}`,
        ...x,
        status: "ACTIVE",
      }))
    );
  if (!read(KEY.hotel_rooms, null))
    write(
      KEY.hotel_rooms,
      (HotelData.HOTEL_ROOMS || []).map((x) => ({ ...x, status: "ACTIVE" }))
    );
  if (!read(KEY.hotel_reviews, null))
    write(
      KEY.hotel_reviews,
      (HotelData.HOTEL_REVIEWS || []).map((x) => ({ ...x, status: "ACTIVE" }))
    );
  if (!read(KEY.hotel_similar_stays, null))
    write(
      KEY.hotel_similar_stays,
      (HotelData.SIMILAR_STAYS || []).map((x, i) => ({
        id: x.id || `ss_${i}`,
        ...x,
        status: "ACTIVE",
      }))
    );

  // expenses mock
  if (!read(KEY.expenses, null)) {
    write(KEY.expenses, [
      {
        id: "ex1",
        date: "2025-12-01",
        category: "Marketing",
        amount: 3000000,
        note: "Ads",
        status: "APPROVED",
      },
      {
        id: "ex2",
        date: "2025-12-10",
        category: "Ops",
        amount: 1200000,
        note: "Tools",
        status: "PENDING",
      },
    ]);
  }
}

// ===== generic CRUD =====
export function getList(key) {
  return read(key, []);
}
export function setList(key, list) {
  write(key, list);
}
export function addItem(key, item) {
  const list = getList(key);
  const newItem = { id: item.id || uid(), ...item };
  setList(key, [newItem, ...list]);
  return newItem;
}
export function updateItem(key, id, patch) {
  const list = getList(key);
  const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x));
  setList(key, next);
}
export function deleteItem(key, id) {
  const list = getList(key);
  setList(
    key,
    list.filter((x) => x.id !== id)
  );
}

// ===== admin profile =====
export function getAdminMe() {
  return read(KEY.adminMe, null);
}
export function updateAdminMe(patch) {
  const me = getAdminMe();
  const next = { ...me, ...patch };
  write(KEY.adminMe, next);
  return next;
}

export const STORE_KEY = KEY;
