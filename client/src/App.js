import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Residents from './components/Residents';
import Billing from './components/Billing'; 
import Announcements from './components/Announcements';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Complaints from './components/Complaints';
import ResidentDashboard from './components/ResidentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/residents" element={<Residents />} />
        <Route path="/billing" element={<Billing />} /> 
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/resident-dashboard" element={<ResidentDashboard />} /> {/* <--- Add Route */}
      </Routes>
    </Router>
  );
}

export default App;