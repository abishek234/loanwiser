import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './css/OtpVerification.css';

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

  // ✅ Auto-submit when all 6 digits are filled and valid
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

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <h2>Verify OTP</h2>
        </div>

        {alert.show && (
          <div className={`alert alert-${alert.variant}`}>
            {alert.message}
            <button type="button" className="close-btn" onClick={() => setAlert({ ...alert, show: false })}>
              &times;
            </button>
          </div>
        )}

        <div className="otp-content">
          <p className="otp-message">
            Enter the 6-digit verification code sent to:
            <span className="email-highlight"> {email}</span>
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="otp-form">
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="otp-input"
                  required
                />
              ))}
            </div>

            <div className="timer">
              {!canResend ? (
                <span>Resend code in {formatTime(timeLeft)}</span>
              ) : (
                <span>Didn't receive the code?</span>
              )}
            </div>

            <div className="otp-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || otp.some(digit => digit === '')}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                className={`btn btn-outline ${canResend ? 'btn-active' : 'btn-disabled'}`}
                onClick={handleResendOTP}
                disabled={!canResend || loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
