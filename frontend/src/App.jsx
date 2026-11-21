import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { ProtectedRoute, GuestRoute } from './components/RouteGuards';

// Pages
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AuctionListingPage from './pages/Auctions/AuctionListingPage';
import AuctionDetailPage from './pages/Auctions/AuctionDetailPage';
import CreateAuctionPage from './pages/Auctions/CreateAuctionPage';
import UserDashboardPage from './pages/Dashboard/UserDashboardPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import HowItWorksPage from './pages/HowItWorks/HowItWorksPage';
import CategoriesPage from './pages/Categories/CategoriesPage';
import { PrivacyPolicyPage, TermsOfUsePage, ContactPage } from './pages/Legal/LegalPages';
import NotFoundPage from './pages/NotFound/NotFoundPage';

// Auto scroll to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Browsing Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auctions" element={<AuctionListingPage />} />
                <Route path="/auctions/:id" element={<AuctionDetailPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/how it works" element={<Navigate to="/how-it-works" replace />} />
                <Route path="/categories" element={<CategoriesPage />} />

                {/* Legal & Informational Routes */}
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfUsePage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Direct Dashboard Tab Shortcuts */}
                <Route
                  path="/my-bids"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard?tab=bids" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-listings"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard?tab=listings" replace />
                    </ProtectedRoute>
                  }
                />

                {/* Guest-only Routes (Redirect to /dashboard if logged in) */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />

                {/* Protected User Routes (Require Login) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/auctions/create"
                  element={
                    <ProtectedRoute>
                      <CreateAuctionPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes (Require ADMIN role) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
