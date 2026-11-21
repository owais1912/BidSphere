import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/helpers';
import { Eye, EyeOff, Gavel, CheckCircle2 } from 'lucide-react';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validate() {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const user = await register(formData);
      toast.success(`Welcome to BidSphere, ${user.fullName.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark"><Gavel size={18} strokeWidth={2.5} /></div>
          <span className="logo-text">BidSphere</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join thousands of collectors and sellers on BidSphere</p>
        </div>

        {errors.form && (
          <div className="alert alert-error" role="alert">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label form-label-required">Full name</label>
            <input
              id="fullName"
              type="text"
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
              autoComplete="name"
              disabled={loading}
            />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label form-label-required">Email address</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label form-label-required">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label form-label-required">Confirm password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
              autoComplete="new-password"
              disabled={loading}
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
