import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AnalysisPage } from "@/pages/AnalysisPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HomePage } from "@/pages/HomePage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ScreeningPage } from "@/pages/ScreeningPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useAuthStore } from "@/store/authStore";

import { AdminDashboard } from "@/pages/AdminDashboard";
import { DoctorDashboard } from "@/pages/DoctorDashboard";
import { PendingApprovalPage } from "@/pages/PendingApprovalPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";


function Protected({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleProtected({ children, roles }: { children: React.ReactNode, roles: string[] }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/" replace />;
  if (user && !roles.includes(user.role)) {
    if (user.role === 'pending_clinician') return <Navigate to="/pending" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}



export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route
          path="/analysis"
          element={
            <Protected>
              <AnalysisPage />
            </Protected>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/reports"
          element={
            <Protected>
              <ReportsPage />
            </Protected>
          }
        />
        <Route
          path="/screening"
          element={
            <Protected>
              <ScreeningPage />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <SettingsPage />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleProtected roles={["admin"]}>
              <AdminDashboard />
            </RoleProtected>
          }
        />
        <Route
          path="/doctor"
          element={
            <RoleProtected roles={["clinician"]}>
              <DoctorDashboard />
            </RoleProtected>
          }
        />
        <Route path="/pending" element={<Protected><PendingApprovalPage /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
