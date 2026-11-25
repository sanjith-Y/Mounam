import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { HowItWorks } from './pages/HowItWorks';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Communication } from './pages/Communication';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';

export const App: React.FC = () => {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="features" element={<Features />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="communication" element={<Communication />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route
                path="*"
                element={
                  <div className="py-24 text-center space-y-4">
                    <h1 className="text-5xl font-black text-brand-purple-900">404</h1>
                    <p className="text-slate-600">The page you are looking for could not be found.</p>
                    <div className="pt-4">
                      <a
                        href="/"
                        className="inline-block px-6 py-3 rounded-xl bg-brand-purple-800 text-white font-bold text-sm"
                      >
                        Return to MOUNAM Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
};

export default App;
