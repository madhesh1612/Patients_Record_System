import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Stethoscope,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { authAPI, authHelpers } from '../utils/api';
import ArogyamNavbar from '../components/ArogyamNavbar';

export default function ClinicianLogin() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'status' ? 'status' : 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [statusQuery, setStatusQuery] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleClinicianLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setIsSubmitting(true);

    try {
      const response = await authAPI.login(username.trim(), password);
      const user = response.data.user;

      if (user.role !== 'clinician' && user.role !== 'admin') {
        setLoginError('This portal is reserved for Clinicians & Healthcare Providers. Please use the Patient Portal.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsSubmitting(false);
        return;
      }

      authHelpers.setToken(response.data.token);
      authHelpers.setUser(user);

      setLoginSuccess('Authentication verified. Redirecting to Clinician Workspace...');
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/clinician/dashboard');
        }
      }, 500);
    } catch (err) {
      console.error('Clinician login error:', err);
      const serverMessage = err?.response?.data?.error || err?.message || 'Authentication failed';
      setLoginError(serverMessage);

      if (serverMessage.toLowerCase().includes('awaiting') || serverMessage.toLowerCase().includes('approval')) {
        setStatusQuery(username);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!statusQuery.trim()) {
      setStatusError('Please enter your username or registered email address.');
      return;
    }

    setStatusError('');
    setStatusResult(null);
    setIsCheckingStatus(true);

    try {
      const response = await authAPI.checkClinicianStatus(statusQuery.trim());
      setStatusResult(response.data);
    } catch (err) {
      console.error('Status check error:', err);
      const message = err?.response?.data?.error || 'Could not find clinician application with those details.';
      setStatusError(message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="arogyam-page-canvas">
      <ArogyamNavbar />

      <main style={{ maxWidth: '520px', margin: '40px auto 80px', padding: '0 20px', width: '100%' }}>
        <div className="arogyam-card">
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--arogyam-emerald-light)',
                color: 'var(--arogyam-emerald)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Stethoscope size={14} /> Healthcare Provider Portal
            </span>
          </div>

          {/* Header */}
          <div className="arogyam-card-header">
            <h1>Clinician <em>Access</em></h1>
            <p>Electronic Health Records &amp; Clinical Management Portal</p>
          </div>

          {/* Tabs: Sign in vs Status Check */}
          <div style={{ display: 'flex', background: 'var(--arogyam-bg-subtle)', borderRadius: '9999px', padding: '4px', gap: '4px', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'login' ? '#ffffff' : 'transparent',
                color: activeTab === 'login' ? 'var(--arogyam-text-main)' : 'var(--arogyam-text-muted)',
                fontWeight: '600',
                fontSize: '0.85rem',
                boxShadow: activeTab === 'login' ? 'var(--arogyam-shadow-sm)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={15} /> Clinician Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('status'); setStatusError(''); }}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'status' ? '#ffffff' : 'transparent',
                color: activeTab === 'status' ? 'var(--arogyam-text-main)' : 'var(--arogyam-text-muted)',
                fontWeight: '600',
                fontSize: '0.85rem',
                boxShadow: activeTab === 'status' ? 'var(--arogyam-shadow-sm)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Clock size={15} /> Check Application Status
            </button>
          </div>

          {activeTab === 'login' ? (
            <div>
              {loginError && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    {loginError}
                    {loginError.toLowerCase().includes('approval') && (
                      <div style={{ marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => { setActiveTab('status'); setStatusQuery(username); }}
                          style={{ color: 'var(--arogyam-terracotta)', fontWeight: '700', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Check your application status &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loginSuccess && (
                <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <form onSubmit={handleClinicianLogin}>
                <div className="arogyam-form-group">
                  <label htmlFor="clinician-username">Clinician ID / Staff Username</label>
                  <div className="arogyam-input-wrapper">
                    <User className="arogyam-input-icon" size={18} />
                    <input
                      type="text"
                      id="clinician-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. dr_smith"
                      required
                      className="arogyam-input"
                    />
                  </div>
                </div>

                <div className="arogyam-form-group">
                  <label htmlFor="clinician-password">Password</label>
                  <div className="arogyam-input-wrapper">
                    <Lock className="arogyam-input-icon" size={18} />
                    <input
                      type="password"
                      id="clinician-password"
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
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {isSubmitting ? 'Verifying Credentials...' : (
                    <>
                      Enter Clinician Workspace <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Fill */}
              <div style={{ marginTop: '16px', background: 'var(--arogyam-bg-subtle)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--arogyam-text-muted)' }}>
                <span>Demo Clinician: <strong>dr_smith</strong></span>
                <button
                  type="button"
                  onClick={() => { setUsername('dr_smith'); setPassword('password123'); }}
                  style={{ background: 'var(--arogyam-emerald-light)', color: 'var(--arogyam-emerald)', border: '1px solid rgba(30, 94, 77, 0.2)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '700' }}
                >
                  <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> Autofill
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ padding: '12px 16px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '12px', color: '#0f766e', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px' }}>
                <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Enter your registered clinician username or email to check your administrator review status.</span>
              </div>

              {statusError && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <XCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{statusError}</span>
                </div>
              )}

              <form onSubmit={handleCheckStatus}>
                <div className="arogyam-form-group">
                  <label htmlFor="status-query">Clinician Username or Email</label>
                  <div className="arogyam-input-wrapper">
                    <Search className="arogyam-input-icon" size={18} />
                    <input
                      type="text"
                      id="status-query"
                      value={statusQuery}
                      onChange={(e) => setStatusQuery(e.target.value)}
                      placeholder="e.g. dr_smith or doctor@hospital.org"
                      required
                      className="arogyam-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-terracotta"
                  disabled={isCheckingStatus}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {isCheckingStatus ? 'Checking Status...' : (
                    <>
                      <Search size={16} /> Lookup Application Status
                    </>
                  )}
                </button>
              </form>

              {statusResult && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'var(--arogyam-bg-subtle)', borderRadius: '16px', border: '1px solid var(--arogyam-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--arogyam-text-main)' }}>{statusResult.username}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--arogyam-text-muted)' }}>{statusResult.email}</div>
                    </div>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        background: statusResult.approval_status === 'approved' ? '#dcfce7' : statusResult.approval_status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: statusResult.approval_status === 'approved' ? '#166534' : statusResult.approval_status === 'rejected' ? '#991b1b' : '#92400e',
                      }}
                    >
                      {statusResult.approval_status}
                    </span>
                  </div>

                  {statusResult.approval_status === 'pending' && (
                    <div style={{ fontSize: '0.85rem', color: '#92400e', background: '#fffbeb', padding: '10px 12px', borderRadius: '10px' }}>
                      ⏳ <strong>Under Review:</strong> Your clinician credentials are awaiting admin authorization.
                    </div>
                  )}

                  {statusResult.approval_status === 'approved' && (
                    <button
                      type="button"
                      className="btn-terracotta"
                      onClick={() => { setUsername(statusResult.username); setActiveTab('login'); }}
                      style={{ width: '100%', marginTop: '10px', padding: '10px', fontSize: '0.9rem' }}
                    >
                      ✓ Account Approved &mdash; Proceed to Sign In
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Navigation */}
          <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--arogyam-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.88rem' }}>New Healthcare Provider? </span>
              <Link to="/clinician/register" style={{ color: 'var(--arogyam-terracotta)', fontWeight: '700', textDecoration: 'none' }}>
                Register for Clinician Access
              </Link>
            </div>

            <div>
              <Link to="/login" style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.84rem', textDecoration: 'none' }}>
                &larr; Patient &amp; General Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
