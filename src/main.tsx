import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import LoginPage from './components/login/page.tsx';
import SignupPage from './components/signup/page.tsx';
import ForgotPasswordPage from './components/forgot-password/page.tsx';
import ResetPasswordPage from './components/reset-password/page.tsx';
import LoanApplicationPage from './components/loan-application/page.tsx';
import AdminDashboardEnhanced from './components/admin/AdminDashboardClean.tsx';
import TestEmailPage from './components/test-email/page.tsx';
import EmailDisplayPage from './components/email-display/page.tsx';
import TermsConditions from './components/terms-conditions/page.tsx';
import PrivacyPolicy from './components/privacy-policy/page.tsx';
import './index.css';
import ReferralPage from './components/referalpage/page.tsx';
import AdminDashboardClean from './components/admin/AdminDashboardClean.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/loan-application" element={<LoanApplicationPage />} />
        <Route path="/referalpage" element={<ReferralPage />} />
        <Route path="/admin" element={<AdminDashboardClean />} />
        <Route path="/test-email" element={<TestEmailPage />} />
        <Route path="/email-display" element={<EmailDisplayPage />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);