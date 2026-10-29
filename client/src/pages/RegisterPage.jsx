import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, BookOpen, BatteryCharging, Wrench, Trophy, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name, email, password, phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Brand Panel */}
      <div className="auth-hero-panel">
        <div>
          <div className="auth-hero-brand">
            <div className="sidebar-logo-icon" style={{ width: '42px', height: '42px' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                <circle cx="9" cy="9" r="4" />
                <circle cx="16" cy="14" r="3.5" />
                <path d="M4 19c0-2.8 2.2-5 5-5h2" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div>
              <div className="auth-hero-title">BorrowBuddy</div>
              <div className="auth-hero-sub">Borrow & Return Tracker</div>
            </div>
          </div>
          <p className="auth-tagline">Share items. Build better habits.</p>
        </div>

        {/* Bottom icon categories */}
        <div className="auth-category-pills">
          <div className="auth-cat-item">
            <BookOpen size={16} />
            <span>Books</span>
          </div>
          <div className="auth-cat-item">
            <BatteryCharging size={16} />
            <span>Chargers</span>
          </div>
          <div className="auth-cat-item">
            <Wrench size={16} />
            <span>Tools</span>
          </div>
          <div className="auth-cat-item">
            <Trophy size={16} />
            <span>Sports</span>
          </div>
          <div className="auth-cat-item">
            <MoreHorizontal size={16} />
            <span>And more...</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2 className="auth-heading">Create Account</h2>
          <p className="auth-subheading">Join BorrowBuddy today!</p>

          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FCE8E6', color: '#C5221F', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon-left" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-with-icon">
                <Mail className="input-icon-left" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px' }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <div className="auth-switch-prompt">
              Already have an account?{' '}
              <Link to="/login" className="auth-switch-link">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
