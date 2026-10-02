import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { authAPI } from '../utils/api';
import ArogyamNavbar from '../components/ArogyamNavbar';

export default function ClinicianRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    specialty: 'General Practice',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name (with title) is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Professional email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Clinician ID is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Must be at least 3 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await authAPI.register(
        formData.name.trim(),
        formData.username.trim(),
        formData.email.trim(),
        formData.password,
        'clinician',
        formData.phone.trim()
      );

      setSuccessMessage(
        response.data.message ||
          'Application submitted successfully! An administrator will review your medical credentials.'
      );
    } catch (err) {
      console.error('Clinician registration error:', err);
      const serverMsg =
        err?.response?.data?.error ||
        err?.message ||
        'Registration could not be completed. Please try again.';
      setGeneralError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="arogyam-page-canvas">
      <ArogyamNavbar />

      <main style={{ maxWidth: '620px', margin: '40px auto 80px', padding: '0 20px', width: '100%' }}>
        <div className="arogyam-card">
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
              <Stethoscope size={14} /> Healthcare Provider Registration
            </span>
          </div>

          <div className="arogyam-card-header">
            <h1>Clinician <em>Registration</em></h1>
            <p>Apply for clinical access to manage electronic health records</p>
          </div>

          {generalError && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{generalError}</span>
            </div>
          )}

          {successMessage ? (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--arogyam-emerald-light)',
                  color: 'var(--arogyam-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '0 0 10px 0', color: 'var(--arogyam-text-main)' }}>
                Application Submitted
              </h2>

              <p style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                {successMessage}
              </p>

              <div style={{ background: 'var(--arogyam-bg-subtle)', border: '1px solid var(--arogyam-border)', borderRadius: '14px', padding: '14px 18px', textAlign: 'left', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <ShieldAlert size={22} style={{ color: 'var(--arogyam-terracotta)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--arogyam-text-main)' }}>
                  <strong>Administrator Verification:</strong>
                  <div style={{ color: 'var(--arogyam-text-muted)', marginTop: '2px' }}>
                    Hospital administrators will vet your clinical credentials from the Admin Control Panel before granting access.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  to="/clinician/login?tab=status"
                  className="btn-terracotta"
                  style={{ textDecoration: 'none', justifyContent: 'center' }}
                >
                  Track Application Status <ArrowRight size={18} />
                </Link>

                <Link
                  to="/clinician/login"
                  style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.88rem', textDecoration: 'none', marginTop: '6px' }}
                >
                  Return to Clinician Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ background: 'var(--arogyam-bg-subtle)', border: '1px solid var(--arogyam-border)', borderRadius: '12px', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', fontSize: '0.84rem', color: 'var(--arogyam-text-muted)' }}>
                <ShieldAlert size={18} style={{ color: 'var(--arogyam-terracotta)', flexShrink: 0 }} />
                <span>All clinician accounts undergo administrator approval before record access is activated.</span>
              </div>

              <div className="arogyam-form-group">
                <label htmlFor="clinician-name">Full Name &amp; Title *</label>
                <div className="arogyam-input-wrapper">
                  <User className="arogyam-input-icon" size={18} />
                  <input
                    type="text"
                    id="clinician-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Jane Smith, MD"
                    className="arogyam-input"
                  />
                </div>
                {errors.name && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="arogyam-form-group">
                  <label htmlFor="clinician-email">Professional Email *</label>
                  <div className="arogyam-input-wrapper">
                    <Mail className="arogyam-input-icon" size={18} />
                    <input
                      type="email"
                      id="clinician-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="doctor@hospital.org"
                      className="arogyam-input"
                    />
                  </div>
                  {errors.email && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.email}</span>}
                </div>

                <div className="arogyam-form-group">
                  <label htmlFor="clinician-username">Clinician ID / Staff Username *</label>
                  <div className="arogyam-input-wrapper">
                    <User className="arogyam-input-icon" size={18} />
                    <input
                      type="text"
                      id="clinician-username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. dr_smith"
                      className="arogyam-input"
                    />
                  </div>
                  {errors.username && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.username}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="arogyam-form-group">
                  <label htmlFor="clinician-phone">Contact Phone *</label>
                  <div className="arogyam-input-wrapper">
                    <Phone className="arogyam-input-icon" size={18} />
                    <input
                      type="tel"
                      id="clinician-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 019-2834"
                      className="arogyam-input"
                    />
                  </div>
                  {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.phone}</span>}
                </div>

                <div className="arogyam-form-group">
                  <label htmlFor="clinician-specialty">Clinical Department</label>
                  <div className="arogyam-input-wrapper">
                    <Building2 className="arogyam-input-icon" size={18} />
                    <select
                      id="clinician-specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="arogyam-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="General Practice">General Practice</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="arogyam-form-group">
                  <label htmlFor="clinician-password">Password *</label>
                  <div className="arogyam-input-wrapper">
                    <Lock className="arogyam-input-icon" size={18} />
                    <input
                      type="password"
                      id="clinician-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 chars"
                      className="arogyam-input"
                    />
                  </div>
                  {errors.password && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.password}</span>}
                </div>

                <div className="arogyam-form-group">
                  <label htmlFor="clinician-confirm">Confirm Password *</label>
                  <div className="arogyam-input-wrapper">
                    <Lock className="arogyam-input-icon" size={18} />
                    <input
                      type="password"
                      id="clinician-confirm"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter"
                      className="arogyam-input"
                    />
                  </div>
                  {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="btn-terracotta"
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isSubmitting ? 'Submitting Application...' : (
                  <>
                    Submit Clinician Application <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--arogyam-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.88rem' }}>Already registered? </span>
              <Link to="/clinician/login" style={{ color: 'var(--arogyam-terracotta)', fontWeight: '700', textDecoration: 'none' }}>
                Sign In to Clinician Portal
              </Link>
            </div>

            <div>
              <Link to="/register" style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.84rem', textDecoration: 'none' }}>
                &larr; Looking for Patient registration?
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
