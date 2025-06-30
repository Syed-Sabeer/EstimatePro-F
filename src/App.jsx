import React from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import DashboardPage from '@/pages/DashboardPage';
import AuthPage from '@/pages/AuthPage';
import PasswordResetPage from '@/pages/PasswordResetPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PricingSetupPage from '@/pages/PricingSetupPage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import ClientSurveyPage from '@/pages/ClientSurveyPage';
import ClientSurveyManagementPage from '@/pages/ClientSurveyManagementPage';
import ClientSurveyDetailPage from '@/pages/ClientSurveyDetailPage';
import ThankYouPage from '@/pages/ThankYouPage';

const SiteLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="pricing-setup" element={<PricingSetupPage />} />
            <Route path="client-survey" element={<ClientSurveyManagementPage />} />
            <Route path="survey-detail/:surveyId" element={<ClientSurveyDetailPage />} />
            <Route path="account-settings" element={<AccountSettingsPage />} />
          </Route>

          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/client-survey" element={<ClientSurveyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

export default App;