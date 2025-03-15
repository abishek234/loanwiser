import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './css/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { requestOTP, loginWithPassword, loading } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setErrors({ ...errors, email: 'Valid email is required' });
      return false;
    }
    return true;
  };
  
  const validatePassword = () => {
    if (!password.trim()) {
      setErrors({ ...errors, password: 'Password is required' });
      return false;
    }
    return true;
  };
  
  const handleOTPRequest = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    const result = await requestOTP(email);
    
    if (result.success) {
      setAlert({
        show: true,
        variant: 'success',
        message: 'OTP sent to your email'
      });
      
      // Store email in sessionStorage to use in OTP verification
      sessionStorage.setItem('otpEmail', email);
      
      // Redirect to OTP verification
      navigate('/otp-verification');
    } else {
      setAlert({
        show: true,
        variant: 'danger',
        message: result.message || 'Failed to send OTP'
      });
    }
  };
  
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    
    if (!validateEmail() || !validatePassword()) {
      return;
    }
    
    const result = await loginWithPassword(email, password);
    
    if (result.success) {
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } else {
      setAlert({
        show: true,
        variant: 'danger',
        message: result.message || 'Login failed'
      });
    }
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: null });
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h2>Login to Your Account</h2>
        </div>
        
        {/* Alert Message */}
        {alert.show && (
          <div className={`alert alert-${alert.variant}`}>
            {alert.message}
            <button type="button" className="close-btn" onClick={() => setAlert({ ...alert, show: false })}>
              &times;
            </button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="login-tabs">
          <div 
            className={`tab ${activeTab === 'otp' ? 'active' : ''}`}
            onClick={() => setActiveTab('otp')}
          >
            Login with OTP
          </div>
          <div 
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Login with Password
          </div>
        </div>
        
        {/* OTP Login Form */}
        {activeTab === 'otp' && (
          <form onSubmit={handleOTPRequest} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP to Email'}
            </button>
          </form>
        )}
        
        {/* Password Login Form */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
                required
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
        
        {/* Register Link */}
        <div className="register-link">
          <p>Don't have an account?</p>
          <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;