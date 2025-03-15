import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Register from './components/auth/Register';
import Login from './components/auth/Login';
import OtpVerification from './components/auth/OtpVerification';
import DocumentUpload from './components/document/DocumentUpload';
import NotFound from './components/layout/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DocumentUpload />
                  </ProtectedRoute>
                } 
              />
          
              <Route path="*" element={<NotFound />} />
            </Routes>
    
      </Router>
    </AuthProvider>
  );
}

export default App;