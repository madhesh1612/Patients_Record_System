import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import ClinicianDashboard from './pages/ClinicianDashboard';
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
        <Route path="/login" element={<Login />} />
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
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
