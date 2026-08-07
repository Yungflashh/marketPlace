import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wallet from './pages/Wallet';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminWallet from './pages/admin/AdminWallet';
import AdminTransactions from './pages/admin/AdminTransactions';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEmails from './pages/admin/AdminEmails';
import AdminEmailComposer from './pages/admin/AdminEmailComposer';
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods';
import Profile from './pages/Profile';

const AppContent: React.FC = () => {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isAuthRoute && <Navbar />}
      <main className="flex-1 pb-12">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/store" element={<Home />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/cart" element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                } />
                
                <Route path="/wallet" element={
                  <PrivateRoute>
                    <Wallet />
                  </PrivateRoute>
                } />
                
                <Route path="/orders" element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                } />
                
                <Route path="/order/:id" element={
                  <PrivateRoute>
                    <OrderDetails />
                  </PrivateRoute>
                } />

                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />
                <Route path="/admin/notifications" element={
                  <AdminRoute>
                    <AdminNotifications />
                  </AdminRoute>
                } />
                
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />
                
                <Route path="/admin/wallet" element={
                  <AdminRoute>
                    <AdminWallet />
                  </AdminRoute>
                } />
                <Route path="/admin/transactions" element={
                  <AdminRoute>
                    <AdminTransactions />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />
                <Route path="/admin/emails" element={
                  <AdminRoute>
                    <AdminEmails />
                  </AdminRoute>
                } />
                <Route path="/admin/emails/:id" element={
                  <AdminRoute>
                    <AdminEmailComposer />
                  </AdminRoute>
                } />
                <Route path="/admin/payment-methods" element={
                  <AdminRoute>
                    <AdminPaymentMethods />
                  </AdminRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
      {!isAuthRoute && <Footer />}
      {!isAuthRoute && <ChatWidget />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;