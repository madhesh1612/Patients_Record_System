import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, authHelpers } from '../utils/api';
import '../styles/Login.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any stale auth data when the register page mounts
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate password strength
  const isValidPassword = (pwd) => {
    return pwd.length >= 6;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username (Patient ID) is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Clear any stale auth data before attempting registration
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const response = await authAPI.register(
        formData.name,
        formData.username,
        formData.email,
        formData.password,
        formData.role,
        formData.phone || null
      );

      authHelpers.setToken(response.data.token);
      authHelpers.setUser(response.data.user);

      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => {
        if (response.data.user.role === 'patient') {
          navigate('/patient/dashboard');
        } else {
          navigate('/clinician/dashboard');
        }
      }, 500);
    } catch (err) {
      console.error('Registration error (frontend):', err);
      const serverMessage =
        err?.response?.data?.error || err?.message || 'Registration failed';
      setError(serverMessage);
      // Ensure no partially-stored auth data remains
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Create Your Account</h1>
          <p className="subtitle">Join the Patient Record Management System</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleRegister} className="login-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            {errors.name && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@gmail.com"
              required
            />
            {errors.email && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.email}</span>}
          </div>

          {/* Username (Patient ID) */}
          <div className="form-group">
            <label htmlFor="username">Username (Patient ID) *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="patient_id_123"
              required
            />
            {errors.username && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.username}</span>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
            {errors.password && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{errors.confirmPassword}</span>}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role">I am a: *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="patient">Patient</option>
              <option value="clinician">Clinician</option>
            </select>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="login-toggle">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="toggle-btn">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="login-info">
        <h2>Why Register?</h2>
        <div className="demo-box">
          <h3>For Patients:</h3>
          <p>Securely manage your medical records and approve access for clinicians.</p>
        </div>
        <div className="demo-box">
          <h3>For Clinicians:</h3>
          <p>Request access to patient records and upload medical documents.</p>
        </div>
        <div className="demo-box">
          <h3>Demo Accounts:</h3>
          <p><strong>Patient:</strong> john_patient / password123</p>
          <p><strong>Clinician:</strong> dr_smith / password123</p>
        </div>
      </div>
    </div>
  );
}
