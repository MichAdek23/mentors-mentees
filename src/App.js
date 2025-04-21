import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChangePassword from './component/UserAuth/ChangePassword/ChangePassword';
import GetOtp from './component/UserAuth/resetPassword/GetOtp';
import ResetPassword from './component/UserAuth/resetPassword/resetPassword';
import ResetConfirmation from './component/UserAuth/resetPassword/resetConfirmation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/get-otp" element={<GetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-confirmation" element={<ResetConfirmation />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;