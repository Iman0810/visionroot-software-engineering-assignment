import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const { isAuthenticated, role } = useContext(AuthContext);
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role !== allowedRole) return <Navigate to="/login" />; // Redirect if wrong role
  
  return <>{children}</>;
};

function App() {
  const { role } = useContext(AuthContext); 

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRole="USER">
          <UserDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      
      <Route path="/profile" element={
        <ProtectedRoute allowedRole={role === 'ADMIN' ? 'ADMIN' : 'USER'}>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App