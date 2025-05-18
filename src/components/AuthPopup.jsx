import React, { useState } from 'react';
import '../styles/AuthPopup.css';
import { useFirebaseWithNotifications } from '../hooks/useFirebaseWithNotifications';

const AuthPopup = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { registerUser, loginUser, resetPassword } = useFirebaseWithNotifications();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (showResetPassword) {
        const { success, error } = await resetPassword(email);
        if (success) {
          setResetSent(true);
        } else {
          setError(error);
        }
      } else if (isLogin) {
        const { user, error } = await loginUser(email, password);
        if (user) {
          onAuthSuccess(user);
          onClose();
        } else {
          setError(error);
        }
      } else {
        const { user, error } = await registerUser(email, password, username);
        if (user) {
          onAuthSuccess(user);
          onClose();
        } else {
          setError(error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setShowResetPassword(false);
    setResetSent(false);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const toggleResetPassword = () => {
    setShowResetPassword(!showResetPassword);
    setError(null);
    setResetSent(false);
  };

  return (
    <div className="auth-popup-overlay">
      <div className="auth-popup">
        <div className="auth-header">
          <h2>
            {showResetPassword ? 'Reset Password' : isLogin ? 'Log In' : 'Sign Up'}
          </h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {resetSent ? (
          <div className="reset-confirmation">
            <p>Password reset email has been sent. Please check your inbox.</p>
            <button className="auth-btn" onClick={() => setShowResetPassword(false)}>Back to Login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isLogin && !showResetPassword && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            {!showResetPassword && (
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}
            
            {error && <div className="auth-error">{error}</div>}
            
            <div className="auth-actions">
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Processing...' : showResetPassword ? 'Send Reset Link' : isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </div>

            {isLogin && !showResetPassword && (
              <div className="forgot-password">
                <button 
                  type="button" 
                  className="toggle-btn" 
                  onClick={toggleResetPassword}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>
        )}
        
        <div className="auth-footer">
          {!showResetPassword && (
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button className="toggle-btn" onClick={toggleMode}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          )}
          
          {showResetPassword && (
            <p>
              <button className="toggle-btn" onClick={toggleResetPassword}>
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;