// 1. Külső könyvtárak
import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';

// 2. Komponensek
import Shop from './components/Shop';
import Nav from './components/Nav';
import TeacherDashboard from './components/TeacherDashboard';
import ManagePartners from './components/ManagePartners';
import Cart from './components/Cart';
import WebshopList from './components/WebshopList';
import ManageProducts from './components/ManageProducts';
import SignatureGenerated from './components/SignatureGenerated';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

// 3. Context
import { AuthProvider } from './context/AuthContext';

// 4. CSS
import './App.css';

function App() {
  const { t } = useTranslation();
  const [cart, setCart] = useState([]);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<div>Loading...</div>}>
            <Nav cart={cart} />
            <Routes>
              {/* Publikus útvonalak */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/webshops" element={<WebshopList />} />
              <Route path="/shop/:id" element={<Shop cart={cart} setCart={setCart} />} />

              {/* Védett útvonalak */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/manage-products/:webshopId"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <ManageProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/manage-partners/:webshopId"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <ManagePartners />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <Cart cart={cart} setCart={setCart} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signature-generated"
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <SignatureGenerated />
                  </ProtectedRoute>
                }
              />

              {/* Átirányítások */}
              <Route path="/" element={<Navigate to="/webshops" replace />} />
              <Route path="*" element={<Navigate to="/webshops" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;