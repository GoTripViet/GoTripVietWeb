import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavbarAdmin from "../components/admin/NavbarAdmin";
import { ensureAdminSeed } from "../data/adminStore";

import AdminProfile from "../pages/admin/AdminProfile";
import DashboardBasic from "../pages/admin/DashboardBasic";
import DashboardAdvanced from "../pages/admin/DashboardAdvanced";

import ManageFlights from "../pages/admin/ManageFlights";
import ManageHome from "../pages/admin/ManageHome";
import ManageHotels from "../pages/admin/ManageHotels";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageAdmins from "../pages/admin/ManageAdmins";
import ManageExpenses from "../pages/admin/ManageExpenses";
import ManagePartnerAirports from "../pages/admin/ManagePartnerAirports";
import ManagePartnerHotels from "../pages/admin/ManagePartnerHotels";
import ManageEvents from "../pages/admin/ManageEvents";

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

          <Route path="manage/flights" element={<ManageFlights />} />
          <Route path="manage/home" element={<ManageHome />} />
          <Route path="manage/events" element={<ManageEvents />} />
          <Route path="manage/hotels" element={<ManageHotels />} />

          <Route path="manage/users" element={<ManageUsers />} />
          <Route path="manage/admins" element={<ManageAdmins />} />
          <Route
            path="manage/partner-airports"
            element={<ManagePartnerAirports />}
          />
          <Route
            path="manage/partner-hotels"
            element={<ManagePartnerHotels />}
          />

          <Route path="expenses" element={<ManageExpenses />} />

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}
