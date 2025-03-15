import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './css/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateAll = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    const result = await register(formData);

    if (result.success) {
      setAlert({
        show: true,
        variant: 'success',
        message: 'Registration successful! Redirecting to login...'
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setAlert({
        show: true,
        variant: 'danger',
        message: result.message || 'Registration failed'
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Your Account</h2>
        </div>

        {alert.show && (
          <div className={`alert alert-${alert.variant}`}>
            {alert.message}
            <button type="button" className="close-btn" onClick={() => setAlert({ ...alert, show: false })}>
              &times;
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} className="register-form">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={onChange}
              className={errors.firstName ? 'error' : ''}
              placeholder="Enter your first name"
              required
            />
            {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={onChange}
              className={errors.lastName ? 'error' : ''}
              placeholder="Enter your last name"
              required
            />
            {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
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
              name="password"
              value={password}
              onChange={onChange}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password"
              required
            />
            {errors.password && <div className="error-message">{errors.password}</div>}

            <div className="password-strength">
              <div className="strength-meter">
                <div
                  className={`strength-value strength-${passwordStrength}`}
                  style={{ width: `${passwordStrength * 20}%` }}
                ></div>
              </div>
              <div className="strength-label">
                {passwordStrength === 0 && 'Very Weak'}
                {passwordStrength === 1 && 'Weak'}
                {passwordStrength === 2 && 'Fair'}
                {passwordStrength === 3 && 'Good'}
                {passwordStrength === 4 && 'Strong'}
                {passwordStrength === 5 && 'Very Strong'}
              </div>
            </div>

            <small className="form-text text-muted">
              Password must be at least 8 characters long and contain letters,special character and numbers.
            </small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account?</p>
          <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
