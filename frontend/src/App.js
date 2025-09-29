// 1. Külső könyvtárak
import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';

// 2. Komponensek
import Shop from './components/Shop';
import Nav from './components/Nav';
import TeacherDashboard from './components/TeacherDashboard';
import Cart from './components/Cart';
import WebshopList from './components/WebshopList';
import ManageProducts from './components/ManageProducts';
import SignatureGenerated from './components/SignatureGenerated';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

// 3. Context
import { AuthProvider } from './context/AuthContext';

// 4. Stílusok
import './App.css';

const LANGUAGES = { HU: 'hu', EN: 'en' };

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES.HU);
  const [userId, setUserId] = useState(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  return (
    <AuthProvider>
      <Suspense fallback="Loading...">
        <Router>
          <Nav currentLanguage={currentLanguage} changeLanguage={changeLanguage} />
          <Routes>
            {/* Publikus route-ok */}
            <Route path="/" element={<Navigate replace to="/webshops" />} />
            <Route path="/webshops" element={<WebshopList />} />
            <Route path="/shop/:webshopId?" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Védett route-ok */}
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart/:webshopId" 
              element={
                <ProtectedRoute>
                  <Cart userId={userId} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-products/:webshopId" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <ManageProducts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signature-generator" 
              element={
                <ProtectedRoute>
                  <SignatureGenerated />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </Suspense>
    </AuthProvider>
  );
}

export default App;