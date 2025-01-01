import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check for admin role in both places
  const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';
  if (!isAdmin) {
    console.log('Access denied: User is not an admin', { role: user?.role, metadata: user?.user_metadata });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}