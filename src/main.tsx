/**
 * Main entry point for the application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/Auth';
import { LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm } from './components/Auth';
import { ProfilePage } from './components/Profile';
import App from './App';
import './index.css';

// Suppress expected warnings from OrbitControls (non-passive event listeners are required for 3D camera controls)
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : String(args[0]);
    // Filter out OrbitControls non-passive listener warnings
    if (
      message.includes('non-passive event listener') &&
      message.includes('wheel')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Also filter Violation messages
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : String(args[0]);
    // Filter out OrbitControls violation warnings
    if (
      message.includes('[Violation]') &&
      message.includes('non-passive event listener') &&
      message.includes('wheel')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all: redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
