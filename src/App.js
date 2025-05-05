import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/InternLogin'; // login for interns
import AttendanceTable from './pages/AttendanceTable';
import AdminLogin from "./pages/AdminLogin";  // ✅ Correct Default Import
import AdminDashboard from './pages/AdminDashboard';
import OTPAuthentication from './pages/OTPAuthentication';
import MarkAttendance from './components/MarkAttendance';
import InternsTable from './pages/InternsTable';
import InternDetail from './pages/InternDetail'; // Intern detail page
import CreateInterns from './pages/CreateInterns';
import 'antd/dist/reset.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Login />} />
        <Route path="/intern-logs" element={<AttendanceTable />} /> 
        <Route path="/otp-verification" element={<OTPAuthentication />} /> 
        <Route path="/mark-attendance" element={<MarkAttendance />} /> 
        <Route path="/admin-login" element={<AdminLogin />} /> 
        <Route path="/admin-logs" element={<AdminDashboard />} /> 
        <Route path="/interns" element={<InternsTable />} /> 
        <Route path="/interns/:id/attendance" element={<InternDetail />} />
        <Route path="/create-intern" element={<CreateInterns />} />
    
      </Routes>
    </Router>
  );
};

export default App;