import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { User, Lock, Stethoscope, ArrowRight, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authAPI, authHelpers } from '../utils/api';
import ArogyamNavbar from '../components/ArogyamNavbar';

const dashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'patient') return '/patient/dashboard';
  return '/clinician/dashboard';
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const response = await authAPI.login(username.trim(), password);
      authHelpers.setToken(response.data.token);
      authHelpers.setUser(response.data.user);

      setSuccess('Signed in successfully! Redirecting...');
      setTimeout(() => {
        navigate(dashboardPath(response.data.user.role));
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      const serverMessage = err?.response?.data?.error || err?.message || 'Invalid credentials';
      setError(serverMessage);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const response = await authAPI.googleLogin(credentialResponse.credential);
      authHelpers.setToken(response.data.token);
      authHelpers.setUser(response.data.user);

      setSuccess('Google sign-in verified! Redirecting...');
      setTimeout(() => {
        const userRole = response.data.user.role || 'patient';
        navigate(dashboardPath(userRole));
      }, 500);
    } catch (err) {
      console.error('Google login error:', err);
      const serverMessage = err?.response?.data?.error || err?.message || 'Google sign-in failed';
      setError(serverMessage);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arogyam-page-canvas">
      <ArogyamNavbar />

      <main style={{ maxWidth: '480px', margin: '40px auto 80px', padding: '0 20px', width: '100%' }}>
        <div className="arogyam-card">
          {/* Card Header */}
          <div className="arogyam-card-header">
            <h1>Sign in to <em>Nalam</em></h1>
            <p>Access your personal health records and medical vault</p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="arogyam-form-group">
              <label htmlFor="username">Username or Patient ID</label>
              <div className="arogyam-input-wrapper">
                <User className="arogyam-input-icon" size={18} />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john_patient or admin"
                  required
                  className="arogyam-input"
                />
              </div>
            </div>

            <div className="arogyam-form-group">
              <label htmlFor="password">Password</label>
              <div className="arogyam-input-wrapper">
                <Lock className="arogyam-input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="arogyam-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-terracotta"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Helpers */}
          <div style={{ marginTop: '16px', background: 'var(--arogyam-bg-subtle)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--arogyam-text-muted)' }}>
            <span>Demo: <strong>john_patient</strong> / <strong>admin</strong></span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => { setUsername('john_patient'); setPassword('password123'); }}
                style={{ background: '#ffffff', border: '1px solid var(--arogyam-border)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', cursor: 'pointer', fontWeight: '600' }}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                style={{ background: '#ffffff', border: '1px solid var(--arogyam-border)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', cursor: 'pointer', fontWeight: '600' }}
              >
                Admin
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--arogyam-border)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--arogyam-text-subtle)' }}>or sign in with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--arogyam-border)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => setError('Google sign-in failed')} />
          </div>

          {/* Switch to Clinician Portal */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--arogyam-border)', textAlign: 'center' }}>
            <Link
              to="/clinician/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '11px 16px',
                borderRadius: '9999px',
                background: 'var(--arogyam-emerald)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(30, 94, 77, 0.25)',
              }}
            >
              <Stethoscope size={16} /> Healthcare Provider Portal &rarr;
            </Link>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--arogyam-text-muted)' }}>
            New to Nalam?{' '}
            <Link to="/register" style={{ color: 'var(--arogyam-terracotta)', fontWeight: '700', textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
