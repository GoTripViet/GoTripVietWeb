import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavbarAdmin from "../components/admin/NavbarAdmin";
import { ensureAdminSeed } from "../data/adminStore";

import AdminProfile from "../pages/admin/AdminProfile";
import DashboardBasic from "../pages/admin/DashboardBasic";
import DashboardAdvanced from "../pages/admin/DashboardAdvanced";
import ManageCategory from "../pages/admin/ManageCategory";
import ManageLocation from "../pages/admin/ManageLocation";
import ManageTours from "../pages/admin/ManageTours";
import ManageTourDetail from "../pages/admin/ManageTourDetail";
import CreateTour from "../pages/admin/CreateTour"; // [MỚI] Import trang tạo tour
import ManageUsers from "../pages/admin/ManageUsers";
import ManageAdmins from "../pages/admin/ManageAdmins";
import ManageExpenses from "../pages/admin/ManageExpenses";
import ManagePromotion from "../pages/admin/ManagePromotion";
import ManageEvents from "../pages/admin/ManageEvents";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageTourInventory from "../pages/admin/ManageTourInventory";

export default function AdminLayout() {
  useEffect(() => {
    ensureAdminSeed();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6f7fb" }}>
      <NavbarAdmin />

      <div style={{ flex: 1, padding: 20, minWidth: 0, overflowX: "hidden" }}>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard/basic" replace />} />

          <Route path="dashboard/basic" element={<DashboardBasic />} />
          <Route path="dashboard/advanced" element={<DashboardAdvanced />} />

          <Route path="profile" element={<AdminProfile />} />

          <Route path="manage/categories" element={<ManageCategory />} />
          <Route path="manage/locations" element={<ManageLocation />} />

          {/* --- QUẢN LÝ TOUR --- */}
          <Route path="manage/tours" element={<ManageTours />} />
          {/* [QUAN TRỌNG] Đặt route 'create' trước route ':id' */}
          <Route path="manage/tours/create" element={<CreateTour />} />
          <Route path="manage/tours/:id" element={<ManageTourDetail />} />

          <Route path="manage/promotions" element={<ManagePromotion />} />
          <Route path="manage/events" element={<ManageEvents />} />
          <Route path="manage/orders" element={<ManageOrders />} />

          <Route path="manage/users" element={<ManageUsers />} />
          <Route path="manage/admins" element={<ManageAdmins />} />
          <Route path="expenses" element={<ManageExpenses />} />
          <Route path="manage/tours/:id/inventory" element={<ManageTourInventory />} /> {/* [MỚI] */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}