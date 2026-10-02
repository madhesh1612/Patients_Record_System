import { Link } from 'react-router-dom';
import {
  Stethoscope,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  FileText,
  Activity,
  HeartPulse,
  Lock,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import ArogyamNavbar from '../components/ArogyamNavbar';

export default function HomePage() {
  return (
    <div className="arogyam-page-canvas">
      {/* Floating Pill Header */}
      <ArogyamNavbar />

      {/* Main Hero Container */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 80px', width: '100%' }}>
        {/* Pill Badges / Announcement Chips (As shown in reference image) */}
        <div className="arogyam-pill-badges">
          <Link to="/login" className="arogyam-badge-chip coral">
            <span className="badge-tag-pill">NEW</span>
            <span>The Nalam patient health app is now live</span>
            <ArrowRight size={14} />
          </Link>

          <Link to="/clinician/login" className="arogyam-badge-chip emerald">
            <span className="badge-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> NEW
            </span>
            <span>CAREPRO: CLINICIAN PORTAL &amp; DIGITAL ASSISTANT</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Hero Title with editorial serif */}
        <h1 className="arogyam-hero-title">
          Run a smarter clinic, <br />
          powered by <em>frontier AI.</em>
        </h1>

        {/* Hero Subtitle */}
        <p className="arogyam-hero-subtitle">
          An AI-powered clinic platform — charting, medical records, and multi-channel patient engagement in <strong>one connected platform</strong>, so your clinic runs itself and you run the medicine.
        </p>

        {/* Action Buttons */}
        <div className="arogyam-hero-actions">
          <Link to="/clinician/login" className="btn-terracotta">
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-pill-white">
            Patient Portal &rarr;
          </Link>
        </div>

        {/* Three-Column Role Access Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '24px', marginTop: '40px' }}>
          {/* Card 1: Clinician */}
          <div className="arogyam-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--arogyam-emerald-light)', color: 'var(--arogyam-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Stethoscope size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 8px 0', color: 'var(--arogyam-text-main)' }}>
                Clinician Workspace
              </h3>
              <p style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Review patient history, request record access, upload diagnostic documents, write doctor notes, and manage treatment plans.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/clinician/login" className="btn-terracotta" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
                Clinician Sign In
              </Link>
              <Link to="/clinician/register" className="btn-pill-white" style={{ padding: '10px 16px', fontSize: '0.88rem' }}>
                Register
              </Link>
            </div>
          </div>

          {/* Card 2: Patient */}
          <div className="arogyam-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <HeartPulse size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 8px 0', color: 'var(--arogyam-text-main)' }}>
                Patient Health Vault
              </h3>
              <p style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Full ownership of your electronic health records. Authorize physician access with 1-click and download records securely.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn-terracotta" style={{ padding: '10px 18px', fontSize: '0.88rem', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
                Patient Sign In
              </Link>
              <Link to="/register" className="btn-pill-white" style={{ padding: '10px 16px', fontSize: '0.88rem' }}>
                Register
              </Link>
            </div>
          </div>

          {/* Card 3: Administrator */}
          <div className="arogyam-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 8px 0', color: 'var(--arogyam-text-main)' }}>
                Administrator Hub
              </h3>
              <p style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Vet healthcare provider registrations, approve or reject clinician privileges, and maintain medical compliance.
              </p>
            </div>
            <div>
              <Link to="/login" className="btn-pill-white" style={{ padding: '10px 18px', fontSize: '0.88rem', width: '100%', justifyContent: 'center' }}>
                Admin Portal Login &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Live Features Bar */}
        <div style={{ marginTop: '50px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', border: '1px solid var(--arogyam-border)', borderRadius: '20px', padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--arogyam-text-main)' }}>100%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--arogyam-text-muted)', marginTop: '4px' }}>HIPAA / Compliance Ready</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--arogyam-terracotta)' }}>256-bit</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--arogyam-text-muted)', marginTop: '4px' }}>Encrypted EHR Vault</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--arogyam-emerald)' }}>Role-Based</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--arogyam-text-muted)', marginTop: '4px' }}>Admin Clinician Approvals</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--arogyam-text-main)' }}>Real-Time</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--arogyam-text-muted)', marginTop: '4px' }}>Audit &amp; Access Logs</div>
          </div>
        </div>
      </main>
    </div>
  );
}
