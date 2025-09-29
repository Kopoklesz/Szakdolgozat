import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  // Betöltés közben ne jelenítsen meg semmit
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Betöltés...
      </div>
    );
  }

  // Ha nincs bejelentkezve, irányítsa át a login oldalra
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ha van szerepkör megkötés, ellenőrizzük
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#d32f2f',
        fontSize: '18px'
      }}>
        Nincs jogosultságod ehhez az oldalhoz.
      </div>
    );
  }

  // Ha minden rendben, jelenítse meg az oldalt
  return children;
}

export default ProtectedRoute;