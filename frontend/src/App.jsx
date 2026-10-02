import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import ClinicianLogin from './pages/ClinicianLogin';
import ClinicianRegister from './pages/ClinicianRegister';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import ClinicianDashboard from './pages/ClinicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { authHelpers } from './utils/api';
import './index.css';

function ProtectedRoute({ component, requiredRole }) {
  if (!authHelpers.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const user = authHelpers.getUser();
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return component;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/clinician/login" element={<ClinicianLogin />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/patient/register" element={<RegisterPage />} />
        <Route path="/clinician/register" element={<ClinicianRegister />} />
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute
              component={<PatientDashboard />}
              requiredRole="patient"
            />
          }
        />
        <Route
          path="/clinician/dashboard"
          element={
            <ProtectedRoute
              component={<ClinicianDashboard />}
              requiredRole="clinician"
            />
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              component={<AdminDashboard />}
              requiredRole="admin"
            />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
