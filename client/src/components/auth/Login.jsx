import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
  Container, 
  Card, 
  Nav, 
  Form, 
  Button, 
  Alert, 
  Row, 
  Col 
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ 
        width: '100%', 
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        borderRadius: '12px',
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
          <h2 className="mb-0 fs-4 fw-semibold">Login to Your Account</h2>
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
          
          {/* Login Tabs */}
          <Nav 
            variant="tabs" 
            className="border-bottom"
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key)}
          >
            <Nav.Item style={{ flex: 1 }}>
              <Nav.Link 
                eventKey="otp" 
                className="text-center py-3 rounded-0 border-0"
                style={{ 
                  color: activeTab === 'otp' ? '#0d6efd' : '#495057',
                  backgroundColor: activeTab === 'otp' ? 'rgba(13, 110, 253, 0.05)' : 'transparent',
                  borderBottom: activeTab === 'otp' ? '2px solid #0d6efd' : 'none'
                }}
              >
                Login with OTP
              </Nav.Link>
            </Nav.Item>
            <Nav.Item style={{ flex: 1 }}>
              <Nav.Link 
                eventKey="password" 
                className="text-center py-3 rounded-0 border-0"
                style={{ 
                  color: activeTab === 'password' ? '#0d6efd' : '#495057',
                  backgroundColor: activeTab === 'password' ? 'rgba(13, 110, 253, 0.05)' : 'transparent',
                  borderBottom: activeTab === 'password' ? '2px solid #0d6efd' : 'none'
                }}
              >
                Login with Password
              </Nav.Link>
            </Nav.Item>
          </Nav>
          
          <div className="p-4">
            {/* OTP Login Form */}
            {activeTab === 'otp' && (
              <Form onSubmit={handleOTPRequest}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control 
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter your email"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send OTP to Email'}
                </Button>
              </Form>
            )}
            
            {/* Password Login Form */}
            {activeTab === 'password' && (
              <Form onSubmit={handlePasswordLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control 
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
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
                    value={password}
                    onChange={handlePasswordChange}
                    isInvalid={!!errors.password}
                    placeholder="Enter your password"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            )}
          </div>
        </Card.Body>
        
        {/* Register Link */}
        <Card.Footer className="text-center py-3 bg-light border-top">
          <p className="mb-1 text-muted">Don't have an account?</p>
          <Link to="/register" className="fw-medium text-decoration-none">Register here</Link>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Login;