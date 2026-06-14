import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    toastRedirect(user.role);
    if (user.role === 'landlord') {
      return <Navigate to="/landlord/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/tenant/dashboard" replace />;
    }
  }

  return <Outlet />;
};

// Simple helper to warn about access issues without breaking render cycles
function toastRedirect(_role: string) {
  // We can let page level notifications show or just redirect silently
}
