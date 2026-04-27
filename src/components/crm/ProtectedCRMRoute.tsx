import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Protects CRM routes:
 * - Not authenticated → /login
 * - Admin route but user is intern → /crm (redirect to dashboard)
 * - Otherwise render children
 */
export default function ProtectedCRMRoute({ children, requireAdmin = false }: Props) {
  const { isAuthenticated, isAdmin, isIntern, role, isLoading } = useAuth();

  // Wait for localStorage hydration — prevents false redirect on first render
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only admin and intern can access CRM
  if (role !== 'admin' && role !== 'intern') {
    return <Navigate to="/" replace />;
  }

  // Admin-only pages: redirect intern to /crm
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/crm" replace />;
  }

  return <>{children}</>;
}
