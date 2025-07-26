import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Placeholder components for routes not yet implemented
const Products: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
    <p className="mt-4 text-gray-600">Product management interface coming soon...</p>
  </div>
);

const Customers: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
    <p className="mt-4 text-gray-600">Customer management interface coming soon...</p>
  </div>
);

const Reports: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
    <p className="mt-4 text-gray-600">Sales reporting interface coming soon...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
