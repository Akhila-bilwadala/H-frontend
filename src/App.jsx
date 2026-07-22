import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RequestHelp from './pages/RequestHelp';
import AdminLogin from './pages/AdminLogin';
import AdminOps from './pages/AdminOps';
import AdminInventory from './pages/AdminInventory';
import VolunteerDash from './pages/VolunteerDash';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/request" element={<RequestHelp />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/ops" element={<AdminOps />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/volunteer" element={<VolunteerDash />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
