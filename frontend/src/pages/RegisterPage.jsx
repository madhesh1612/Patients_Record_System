import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { authAPI, authHelpers } from '../utils/api';
import ArogyamNavbar from '../components/ArogyamNavbar';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pwd) => pwd.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Patient Username / ID is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const response = await authAPI.register(
        formData.name.trim(),
        formData.username.trim(),
        formData.email.trim(),
        formData.password,
        'patient',
        formData.phone.trim() || null
      );

      authHelpers.setToken(response.data.token);
      authHelpers.setUser(response.data.user);

      setSuccess('Patient account created! Opening health vault...');
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 600);
    } catch (err) {
      console.error('Patient registration error:', err);
      const serverMessage =
        err?.response?.data?.error || err?.message || 'Registration failed. Please try again.';
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

      <main style={{ maxWidth: '520px', margin: '40px auto 80px', padding: '0 20px', width: '100%' }}>
        <div className="arogyam-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#e0f2fe',
                color: '#0284c7',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <HeartPulse size={14} /> Patient Health Vault
            </span>
          </div>

          <div className="arogyam-card-header">
            <h1>Create Patient <em>Account</em></h1>
            <p>Access and control your personal electronic health records</p>
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

          <form onSubmit={handleRegister}>
            <div className="arogyam-form-group">
              <label htmlFor="name">Full Name *</label>
              <div className="arogyam-input-wrapper">
                <User className="arogyam-input-icon" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  className="arogyam-input"
                />
              </div>
              {errors.name && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.name}</span>}
            </div>

            <div className="arogyam-form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="arogyam-input-wrapper">
                <Mail className="arogyam-input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="arogyam-input"
                />
              </div>
              {errors.email && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.email}</span>}
            </div>

            <div className="arogyam-form-group">
              <label htmlFor="username">Patient ID / Username *</label>
              <div className="arogyam-input-wrapper">
                <User className="arogyam-input-icon" size={18} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. john_patient"
                  required
                  className="arogyam-input"
                />
              </div>
              {errors.username && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.username}</span>}
            </div>

            <div className="arogyam-form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <div className="arogyam-input-wrapper">
                <Phone className="arogyam-input-icon" size={18} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="arogyam-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="arogyam-form-group">
                <label htmlFor="password">Password *</label>
                <div className="arogyam-input-wrapper">
                  <Lock className="arogyam-input-icon" size={18} />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 chars"
                    required
                    className="arogyam-input"
                  />
                </div>
                {errors.password && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.password}</span>}
              </div>

              <div className="arogyam-form-group">
                <label htmlFor="confirmPassword">Confirm *</label>
                <div className="arogyam-input-wrapper">
                  <Lock className="arogyam-input-icon" size={18} />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter"
                    required
                    className="arogyam-input"
                  />
                </div>
                {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="btn-terracotta"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Creating Account...' : (
                <>
                  Register Patient Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Clinician Redirect */}
          <div style={{ marginTop: '22px', padding: '14px', background: 'var(--arogyam-emerald-light)', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--arogyam-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Stethoscope size={16} /> Healthcare Provider or Doctor?
            </div>
            <Link
              to="/clinician/register"
              style={{ color: 'var(--arogyam-emerald)', fontSize: '0.88rem', fontWeight: '800', textDecoration: 'underline' }}
            >
              Register via Clinician Portal &rarr;
            </Link>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--arogyam-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--arogyam-terracotta)', fontWeight: '700', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
