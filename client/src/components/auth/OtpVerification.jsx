import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Row, 
  Col,
  InputGroup
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const OtpVerification = () => {
  const navigate = useNavigate();
  const { verifyOTP, requestOTP, loading } = useContext(AuthContext);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = Array(6).fill(0).map(() => useRef(null));
  const formRef = useRef(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('otpEmail');
    if (!storedEmail) {
      navigate('/login');
      return;
    }

    setEmail(storedEmail);
    inputRefs[0].current.focus();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Auto-submit when all 6 digits are filled and valid
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && /^\d{6}$/.test(otpValue)) {
      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }, [otp]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleChange = (index, e) => {
    const value = e.target.value;

    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs[5].current.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    const result = await requestOTP(email);

    if (result.success) {
      setAlert({
        show: true,
        variant: 'success',
        message: 'OTP resent to your email'
      });

      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current.focus();
    } else {
      setAlert({
        show: true,
        variant: 'danger',
        message: result.message || 'Failed to resend OTP'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6 || isNaN(otpValue)) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Please enter a valid 6-digit OTP'
      });
      return;
    }

    const result = await verifyOTP(email, otpValue);

    if (result.success) {
      setAlert({
        show: true,
        variant: 'success',
        message: 'OTP verified successfully! Redirecting...'
      });

      sessionStorage.removeItem('otpEmail');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setAlert({
        show: true,
        variant: 'danger',
        message: result.message || 'OTP verification failed'
      });

      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current.focus();
    }
  };

  // Custom CSS for OTP input focus animation
  const otpInputStyle = {
    width: '50px',
    height: '60px',
    fontSize: '1.5rem',
    textAlign: 'center',
    borderRadius: '8px'
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card 
        className="border-0 shadow" 
        style={{ 
          maxWidth: '480px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          animation: 'slideUp 0.5s ease-out'
        }}
      >
        <Card.Header 
          className="text-center text-white py-4"
          style={{ 
            backgroundColor: '#0d6efd',
            borderRadius: '10px 10px 0 0'
          }}
        >
          <h2 className="mb-0 fs-4 fw-semibold">Verify OTP</h2>
        </Card.Header>

        <Card.Body className="p-4">
          {alert.show && (
            <Alert 
              variant={alert.variant} 
              dismissible
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </Alert>
          )}

          <p className="text-center mb-4">
            Enter the 6-digit verification code sent to:
            <span className="d-block fw-bold text-primary mt-1">{email}</span>
          </p>

          <Form ref={formRef} onSubmit={handleSubmit}>
            <div className="d-flex justify-content-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <Form.Control
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  style={otpInputStyle}
                  className="text-center"
                  required
                />
              ))}
            </div>

            <div className="text-center text-secondary mb-3" style={{ fontSize: '0.875rem' }}>
              {!canResend ? (
                <span>Resend code in {formatTime(timeLeft)}</span>
              ) : (
                <span>Didn't receive the code?</span>
              )}
            </div>

            <div className="d-grid gap-2">
              <Button
                variant={canResend ? "outline-primary" : "outline-secondary"}
                className="py-2"
                onClick={handleResendOTP}
                disabled={!canResend || loading}
              >
                Resend OTP
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Custom CSS for animations */}
      <style type="text/css">
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .form-control:focus {
            border-color: #86b7fe;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
            animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
            }
            70% {
              box-shadow: 0 0 0 5px rgba(13, 110, 253, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
            }
          }
          
          @media (max-width: 576px) {
            .form-control {
              width: 45px !important;
              height: 55px !important;
              font-size: 1.4rem !important;
            }
          }
          
          @media (max-width: 400px) {
            .form-control {
              width: 38px !important;
              height: 50px !important;
              font-size: 1.2rem !important;
            }
          }
        `}
      </style>
    </Container>
  );
};

export default OtpVerification;