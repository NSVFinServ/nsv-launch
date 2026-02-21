import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import App from "./App";
import LoginPage from "./components/login/page";
import SignupPage from "./components/signup/page";
import ForgotPasswordPage from "./components/forgot-password/page";
import ResetPasswordPage from "./components/reset-password/page";
import LoanApplicationPage from "./components/loan-application/page";
import TestEmailPage from "./components/test-email/page";
import EmailDisplayPage from "./components/email-display/page";
import TermsConditions from "./components/terms-conditions/page";
import BlogsPage from "./components/BlogsPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import PrivacyPolicy from "./components/privacy-policy/page";
import AskExpertPage from "./components/askexpert/page";
import ReferralPage from "./components/referalpage/page";

// ✅ Lazy import admin so Quill never loads during prerender
const AdminDashboardClean = lazy(() => import("./components/admin/AdminDashboardClean"));

function ClientOnly({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") return null; // ✅ prevents SSR/prerender crash
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public SEO routes */}
      <Route path="/" element={<App />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blogs/:slug" element={<BlogDetailsPage />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* Other public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/loan-application" element={<LoanApplicationPage />} />
      <Route path="/referalpage" element={<ReferralPage />} />
      <Route path="/askexpert" element={<AskExpertPage />} />
      <Route path="/test-email" element={<TestEmailPage />} />
      <Route path="/email-display" element={<EmailDisplayPage />} />

      {/* ✅ Admin route: client-only + lazy */}
      <Route
        path="/admin"
        element={
          <ClientOnly>
            <Suspense fallback={null}>
              <AdminDashboardClean />
            </Suspense>
          </ClientOnly>
        }
      />
    </Routes>
  );
}
