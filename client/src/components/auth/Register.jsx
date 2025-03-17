import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  ProgressBar 
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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

  // Function to determine ProgressBar variant based on password strength
  const getStrengthVariant = () => {
    if (passwordStrength <= 1) return 'danger';
    if (passwordStrength <= 3) return 'warning';
    return 'success';
  };

  // Function to get password strength label
  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '110vh' }}>
      <Card style={{ 
        width: '100%', 
        maxWidth: '400px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}
      className="border-0"
      >
        {/* Header */}
        <Card.Header 
          className="text-center text-white py-4"
          style={{ 
            backgroundColor: '#0d6efd',
            borderRadius: '10px 10px 0 0'
          }}
        >
          <h2 className="mb-0 fs-4 fw-semibold">Create Your Account</h2>
        </Card.Header>
        
        <Card.Body className="p-0">
          {/* Alert Message */}
          {alert.show && (
            <Alert 
              variant={alert.variant} 
              className="m-3 mb-0"
              dismissible
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </Alert>
          )}
          
          <div className="p-4">
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">First Name</Form.Label>
                <Form.Control 
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={onChange}
                  isInvalid={!!errors.firstName}
                  placeholder="Enter your first name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Last Name</Form.Label>
                <Form.Control 
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={onChange}
                  isInvalid={!!errors.lastName}
                  placeholder="Enter your last name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Email Address</Form.Label>
                <Form.Control 
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  isInvalid={!!errors.email}
                  placeholder="Enter your email"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Password</Form.Label>
                <Form.Control 
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  isInvalid={!!errors.password}
                  placeholder="Create a password"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
                
                {password && (
                  <div className="mt-2">
                    <ProgressBar 
                      now={passwordStrength * 20} 
                      variant={getStrengthVariant()} 
                      style={{ height: '5px' }}
                    />
                    <div className="d-flex justify-content-end mt-1">
                      <small className="text-muted">{getStrengthLabel()}</small>
                    </div>
                  </div>
                )}
                
                <Form.Text className="text-muted">
                  Password must be at least 8 characters long and contain letters, special character and numbers.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Confirm Password</Form.Label>
                <Form.Control 
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  isInvalid={!!errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-2 mt-2"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Create Account'}
              </Button>
            </Form>
          </div>
        </Card.Body>
        
        {/* Login Link */}
        <Card.Footer className="text-center py-3 bg-light border-top">
          <p className="mb-1 text-muted">Already have an account?</p>
          <Link to="/login" className="fw-medium text-decoration-none text-primary">Login here</Link>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Register;