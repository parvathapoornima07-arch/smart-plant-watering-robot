import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute, AdminRoute } from "@/components/common/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Public
import { HomePage } from "@/pages/public/HomePage";
import { HowItWorksPage } from "@/pages/public/HowItWorksPage";
import { HardwarePage } from "@/pages/public/HardwarePage";
import { DocumentationPage } from "@/pages/public/DocumentationPage";
import { ContactPage } from "@/pages/public/ContactPage";

// Auth
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { ProfilePage } from "@/pages/auth/ProfilePage";

// Dashboard
import { DashboardOverview } from "@/pages/dashboard/DashboardOverview";
import { SoilMoisturePage } from "@/pages/dashboard/SoilMoisturePage";
import { CalibrationPage } from "@/pages/dashboard/CalibrationPage";
import { CameraPage } from "@/pages/dashboard/CameraPage";
import { RobotStatusPage } from "@/pages/dashboard/RobotStatusPage";

// Admin
import { AdminOverview } from "@/pages/admin/AdminOverview";
import { AdminDevices } from "@/pages/admin/AdminDevices";
import { AdminEvents } from "@/pages/admin/AdminEvents";
import { AdminMessages } from "@/pages/admin/AdminMessages";

import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="hardware" element={<HardwarePage />} />
          <Route path="docs" element={<DocumentationPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Auth */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        {/* Protected user area */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="dashboard/soil" element={<SoilMoisturePage />} />
            <Route path="dashboard/calibration" element={<CalibrationPage />} />
            <Route path="dashboard/camera" element={<CameraPage />} />
            <Route path="dashboard/robot" element={<RobotStatusPage />} />
          </Route>
        </Route>

        {/* Admin area */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminOverview />} />
            <Route path="admin/devices" element={<AdminDevices />} />
            <Route path="admin/events" element={<AdminEvents />} />
            <Route path="admin/messages" element={<AdminMessages />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
