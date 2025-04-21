import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Login from './component/UserAuth/Login/Login';
import SignUp from './component/UserAuth/register/SignUp';
import EmailVerification from './component/UserAuth/EmailVerification';
import UserProfile from './component/MeentoDashboard/MentorPages/PublicProfile';
import Messages from './component/Mentee-onboarding/Messages';
import MentorMessages from './component/MeentoDashboard/MentorPages/Message';
import PrivateRoute from './component/UserAuth/PrivateRoute';
import LandingPage from './component/Landing page/homecomponents/LandingPage';
import ResetPassWord from './component/UserAuth/resetPassword/resetPassword';
import GetOtp from './component/UserAuth/resetPassword/GetOtp';
import ModeOfSignUp from './component/UserAuth/ModeOfRegistring/ModeOfRegistring';
import MenteeForm from './component/UserAuth/Mentee-Form/Mentee-Form';
import Payment from './component/UserAuth/Payment';
import PaymentVerify from './component/UserAuth/PaymentVerify';
import MentorForm from './component/UserAuth/Mentor-form/Mentor-Form';
import ChangePassword from './component/UserAuth/ChangePassword/ChangePassword';
import TermsAndConditions from './component/UserAuth/TermsAndConditions';
import PrivacyPolicy from './component/UserAuth/PrivacyPolicy';
import MentorDashBoard from './component/MeentoDashboard/mentor-DashBoard';
import Mentee from './component/Mentee-onboarding/Mentee';
import CreateSession from './component/Mentee-onboarding/CreateSession';
import Requests from './component/MeentoDashboard/MentorPages/Requests';
import PublicProfile from './component/MeentoDashboard/MentorPages/PublicProfile';
import Booking from './component/MeentoDashboard/MentorPages/Booking';
import DashboardLayout from './component/MeentoDashboard/DashboardLayout'; // Import the layout component

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ResetPassWord />} />
          <Route path="/get-otp" element={<GetOtp />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/mode-of-registering" element={<ModeOfSignUp />} />
          <Route path="/mentee-form" element={<MenteeForm />} />
          <Route path="/mentor-form" element={<MentorForm />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/verify" element={<PaymentVerify />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />

          {/* Mentor Dashboard Routes */}
          <Route
            path="/mentor-dashboard"
            element={
              <PrivateRoute allowedRoles={['mentor', 'admin']}>
                <MentorDashBoard />
              </PrivateRoute>
            }
          />
          <Route
            path="/mentor-dashboard/*"
            element={
              <PrivateRoute allowedRoles={['mentor', 'admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="booking" element={<Booking />} />
                    <Route path="messages" element={<MentorMessages />} />
                    <Route path="requests" element={<Requests />} />
                  </Routes>
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          {/* Mentee Dashboard Routes */}
          <Route
            path="/mentee-dashboard"
            element={
              <PrivateRoute allowedRoles={['mentee', 'admin']}>
                <Mentee />
              </PrivateRoute>
            }
          />
          <Route
            path="/mentee-dashboard/*"
            element={
              <PrivateRoute allowedRoles={['mentee', 'admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="create-session" element={<CreateSession />} />
                    <Route path="messages" element={<Messages />} />
                  </Routes>
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/profile/:userId"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
          <Route
            path="/mentor/messages"
            element={
              <PrivateRoute>
                <MentorMessages />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <PrivateRoute>
                <Requests />
              </PrivateRoute>
            }
          />
          <Route
            path="/public-profile/:userId"
            element={
              <PrivateRoute>
                <PublicProfile />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

