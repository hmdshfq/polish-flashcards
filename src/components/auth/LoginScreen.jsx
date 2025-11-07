import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginScreen.css';

export function LoginScreen() {
  const navigate = useNavigate();
  const { signIn, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateForm = () => {
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // Redirect to admin panel on successful login
      navigate('/admin');
    } catch (err) {
      // Error is handled by useAuth hook and displayed via error state
      console.error('Auth error:', err);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setValidationError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">
          {isSignUp ? 'Create a new admin account' : 'Sign in to the admin panel'}
        </p>

        {(error || validationError) && (
          <div className="login-error" role="alert">
            {error || validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={loading}
              aria-label="Email address"
              autoComplete={isSignUp ? 'email' : 'email'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              aria-label="Password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
            {isSignUp && (
              <p className="password-hint">At least 6 characters</p>
            )}
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                aria-label="Confirm password"
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="toggle-mode-button"
              onClick={handleToggleMode}
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
