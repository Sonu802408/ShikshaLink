import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

// Common
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SpecialOfferModal } from './components/common/SpecialOfferModal';

// Public Pages
import { Home } from './pages/Home';
import { FindTutors } from './pages/FindTutors';
import { TutorProfileView } from './pages/TutorProfileView';
import { HowItWorks } from './pages/HowItWorks';
import { PricingSafety } from './pages/PricingSafety';
import { BecomeTutor } from './pages/BecomeTutor';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Parent Dashboard Pages
import { ParentDashboardLayout } from './pages/parent/ParentDashboardLayout';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentCartPage } from './pages/parent/ParentCartPage';
import { MyChildren } from './pages/parent/MyChildren';
import { MyRequirements } from './pages/parent/MyRequirements';
import { CreateRequirementPage } from './pages/parent/CreateRequirementPage';
import { ParentBookings } from './pages/parent/ParentBookings';
import { SavedTutorsPage } from './pages/parent/SavedTutorsPage';
import { ParentReviews } from './pages/parent/ParentReviews';
import { ParentSupport } from './pages/parent/ParentSupport';
import { CheckoutPage } from './pages/parent/CheckoutPage';

// Tutor Dashboard Pages
import { TutorDashboardLayout } from './pages/tutor/TutorDashboardLayout';
import { TutorDashboard } from './pages/tutor/TutorDashboard';
import { TutorProfileEdit } from './pages/tutor/TutorProfileEdit';
import { TutorAvailabilityPage } from './pages/tutor/TutorAvailabilityPage';
import { TutorBookings } from './pages/tutor/TutorBookings';
import { TutorRequirementsFeed } from './pages/tutor/TutorRequirementsFeed';
import { TutorQualificationsPage } from './pages/tutor/TutorQualificationsPage';
import { TutorReviews } from './pages/tutor/TutorReviews';
import { TutorRegistrationWizard } from './pages/tutor/TutorRegistrationWizard';
import { TutorCartPage } from './pages/tutor/TutorCartPage';

// Admin Dashboard Pages
import { AdminDashboardLayout } from './pages/admin/AdminDashboardLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminManageTutors } from './pages/admin/AdminManageTutors';
import { AdminVerificationQueue } from './pages/admin/AdminVerificationQueue';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminComplaints } from './pages/admin/AdminComplaints';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminPayments } from './pages/admin/AdminPayments';

// Route Guard component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their appropriate dashboard
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'tutor') return <Navigate to="/tutor" replace />;
    return <Navigate to="/parent" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
              <Navbar />
              <SpecialOfferModal />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/find-tutors" element={<FindTutors />} />
                  <Route path="/tutors/:id" element={<TutorProfileView />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing-safety" element={<PricingSafety />} />
                  <Route path="/become-a-tutor" element={<BecomeTutor />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Dedicated Responsive Checkout Route */}
                  <Route
                    path="/checkout/:bookingId"
                    element={
                      <ProtectedRoute allowedRoles={['parent', 'admin']}>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Parent Protected Routes */}
                  <Route
                    path="/parent"
                    element={
                      <ProtectedRoute allowedRoles={['parent']}>
                        <ParentDashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<ParentDashboard />} />
                    <Route path="children" element={<MyChildren />} />
                    <Route path="cart" element={<ParentCartPage />} />
                    <Route path="requirements" element={<MyRequirements />} />
                    <Route path="requirements/new" element={<CreateRequirementPage />} />
                    <Route path="bookings" element={<ParentBookings />} />
                    <Route path="saved-tutors" element={<ParentCartPage />} />
                    <Route path="reviews" element={<ParentReviews />} />
                    <Route path="support" element={<ParentSupport />} />
                  </Route>

                  {/* Standalone Tutor Registration Route */}
                  <Route
                    path="/tutor/register"
                    element={
                      <ProtectedRoute allowedRoles={['tutor']}>
                        <TutorRegistrationWizard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Tutor Protected Routes */}
                  <Route
                    path="/tutor"
                    element={
                      <ProtectedRoute allowedRoles={['tutor']}>
                        <TutorDashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<TutorDashboard />} />
                    <Route path="cart" element={<TutorCartPage />} />
                    <Route path="bookings" element={<TutorBookings />} />
                    <Route path="requirements" element={<TutorRequirementsFeed />} />
                    <Route path="profile" element={<TutorProfileEdit />} />
                    <Route path="availability" element={<TutorAvailabilityPage />} />
                    <Route path="qualifications" element={<TutorQualificationsPage />} />
                    <Route path="reviews" element={<TutorReviews />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="tutors" element={<AdminManageTutors />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="verification" element={<AdminVerificationQueue />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="complaints" element={<AdminComplaints />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="audit-logs" element={<AdminAuditLogs />} />
                  </Route>

                  {/* 404 Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
