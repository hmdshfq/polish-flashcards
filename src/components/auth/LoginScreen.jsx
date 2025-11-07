import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginScreen.css';

export function LoginScreen() {
  const navigate = useNavigate();
  const { signIn, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <div className="login-background"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-text">PF</span>
          </div>
          <div className="login-branding">
            <h1 className="login-title">Polish Flashcards</h1>
            <p className="login-subtitle">Admin Portal</p>
          </div>
        </div>

        <p className="login-description">
          {isSignUp
            ? 'Create a new administrator account to manage flashcards, categories, and learning content.'
            : 'Manage and organize Polish learning content for your students.'}
        </p>

        {(error || validationError) && (
          <div className="login-error" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error || validationError}</span>
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
            <div className="password-label-wrapper">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
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
              <p className="form-help">At least 6 characters</p>
            )}
          </div>

          {isSignUp && (
            <div className="form-group">
              <div className="password-label-wrapper">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
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
            className="btn-primary btn-login"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider"></div>

        <div className="login-footer">
          <p className="login-mode-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="btn-tertiary btn-toggle"
              onClick={handleToggleMode}
              disabled={loading}
            >
              {isSignUp ? 'Sign In instead' : 'Create account'}
            </button>
          </p>

          <p className="login-support">
            Need help?{' '}
            <a href="mailto:support@polishflashcards.com" className="support-link">
              Contact support
            </a>
          </p>
        </div>

        <footer className="login-footer-bottom">
          <p>© 2025 Polish Flashcards. Educational admin panel.</p>
        </footer>
      </div>
    </div>
  );
}
