import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { authAPI, authHelpers } from '../utils/api';
import '../styles/Login.css';
import { User, Lock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any stale auth state when the login page mounts
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Remove any stale auth state before attempting login
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const response = await authAPI.login(username, password);
      authHelpers.setToken(response.data.token);
      authHelpers.setUser(response.data.user);

      setSuccess('Login successful!');
      setTimeout(() => {
        if (response.data.user.role === 'patient') {
          navigate('/patient/dashboard');
        } else {
          navigate('/clinician/dashboard');
        }
      }, 500);
    } catch (err) {
      console.error('Login error (frontend):', err);
      const serverMessage = err?.response?.data?.error || err?.message;
      setError(serverMessage || 'Login failed');
      // Ensure no partially-stored auth data remains
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    // Remove any stale auth state
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      // Decode the credential to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google user info:', decoded);

      // Send credential to backend
      const response = await authAPI.googleLogin(credentialResponse.credential);
      authHelpers.setToken(response.data.token);
      authHelpers.setUser(response.data.user);

      setSuccess('Google login successful!');
      setTimeout(() => {
        // Assuming Google users default to patient role
        const userRole = response.data.user.role || 'patient';
        if (userRole === 'patient') {
          navigate('/patient/dashboard');
        } else {
          navigate('/clinician/dashboard');
        }
      }, 500);
    } catch (err) {
      console.error('Google login error (frontend):', err);
      const serverMessage = err?.response?.data?.error || err?.message;
      setError(serverMessage || 'Google login failed');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google login failed');
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Patient Record Management System</h1>
          <p className="subtitle">Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group input-with-icon">
            <User className="input-icon" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
              className="large-input"
            />
          </div>

          <div className="form-group input-with-icon">
            <Lock className="input-icon" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="large-input"
            />
          </div>

          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="register-link">
          <Link to="/register" className="toggle-btn">Register</Link>
        </div>

        <div className="divider"><span>or</span></div>

        <div className="google-login-container">
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
        </div>

        <div className="login-footer">Powered by Patient Record Management System</div>
      </div>
    </div>

  );
}
