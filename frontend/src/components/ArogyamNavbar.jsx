import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Stethoscope,
  User,
  Shield,
  LogOut,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  HeartPulse,
} from 'lucide-react';
import { authHelpers } from '../utils/api';

export default function ArogyamNavbar({ activeTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = authHelpers.getUser();
  const isAuthenticated = authHelpers.isAuthenticated();

  const handleLogout = () => {
    authHelpers.logout();
    navigate('/login');
  };

  return (
    <header className="arogyam-nav-wrapper">
      <nav className="arogyam-pill-nav">
        {/* Brand Logo */}
        <Link to="/" className="arogyam-brand">
          <div className="arogyam-logo-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nalamGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#c06c50" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="28" height="28" rx="8" fill="#242926" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"/>
              <path d="M9 22V10L17.5 22V10" stroke="url(#nalamGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="23" cy="10" r="2.2" fill="#c06c50" />
              <path d="M12.5 16H19.5" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="arogyam-brand-text">
            Nalam <span className="arogyam-brand-dot" style={{ color: '#2dd4bf' }}>Health</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="arogyam-nav-links">
          <Link
            to="/"
            className={`arogyam-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Features
          </Link>
          <Link
            to="/clinician/login"
            className={`arogyam-nav-link ${location.pathname.startsWith('/clinician') ? 'active' : ''}`}
          >
            For Clinicians
          </Link>
          <Link
            to="/login"
            className={`arogyam-nav-link ${location.pathname === '/login' || location.pathname.startsWith('/patient') ? 'active' : ''}`}
          >
            For Patients
          </Link>
          <Link
            to="/clinician/login?tab=status"
            className="arogyam-nav-link"
          >
            Status Check
          </Link>
        </div>

        {/* Right CTA Actions */}
        <div className="arogyam-nav-actions">
          {isAuthenticated && user ? (
            <div className="arogyam-user-menu">
              <button
                type="button"
                className="arogyam-user-pill"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="arogyam-avatar-circle">
                  {user.role === 'clinician' && <Stethoscope size={14} />}
                  {user.role === 'admin' && <Shield size={14} />}
                  {user.role === 'patient' && <User size={14} />}
                </div>
                <span className="arogyam-user-name">{user.username}</span>
                <span className={`arogyam-role-tag role-${user.role}`}>
                  {user.role}
                </span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="arogyam-dropdown">
                  <div className="arogyam-dropdown-header">
                    <strong>{user.username}</strong>
                    <small>{user.email}</small>
                  </div>
                  <div className="arogyam-dropdown-divider" />
                  {user.role === 'patient' && (
                    <Link to="/patient/dashboard" className="arogyam-dropdown-item">
                      <HeartPulse size={15} /> Patient Dashboard
                    </Link>
                  )}
                  {user.role === 'clinician' && (
                    <Link to="/clinician/dashboard" className="arogyam-dropdown-item">
                      <Stethoscope size={15} /> Clinician Workspace
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="arogyam-dropdown-item">
                      <Shield size={15} /> Admin Control Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="arogyam-dropdown-item logout"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="arogyam-guest-actions">
              <Link to="/login" className="arogyam-login-link">
                Log in
              </Link>
              <Link to="/register" className="arogyam-trial-btn">
                Start Free Trial
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="arogyam-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="arogyam-mobile-drawer">
          <Link to="/" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link to="/login" onClick={() => setMobileOpen(false)}>For Patients</Link>
          <Link to="/clinician/login" onClick={() => setMobileOpen(false)}>For Clinicians</Link>
          <Link to="/clinician/login?tab=status" onClick={() => setMobileOpen(false)}>Check Application Status</Link>
          <div className="arogyam-mobile-divider" />
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="arogyam-mobile-logout">
              Sign Out ({user?.username})
            </button>
          ) : (
            <div className="arogyam-mobile-btns">
              <Link to="/login" className="arogyam-mobile-btn-outline" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="arogyam-mobile-btn-solid" onClick={() => setMobileOpen(false)}>
                Start Free Trial
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
