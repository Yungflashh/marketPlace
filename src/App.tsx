import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import AppShell from './components/nav/AppShell';
import AppSplash from './components/AppSplash';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
import AdminNotifications from './pages/admin/AdminNotifications';

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const minDelay = new Promise((resolve) => setTimeout(resolve, 900));
    const fontsReady = (document as any).fonts?.ready ?? Promise.resolve();
    Promise.all([minDelay, fontsReady]).then(() => setAppReady(true));
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {showSplash && <AppSplash exiting={appReady} onExited={() => setShowSplash(false)} />}
          <AppShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />

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

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppShell>
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
            theme="dark"
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
