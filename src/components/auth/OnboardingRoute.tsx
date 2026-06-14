import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStatus } from '../../hooks/useOnboarding';

export const OnboardingRoute = () => {
  const { user } = useAuthStore();
  const { data: isComplete, isLoading } = useOnboardingStatus(user?.id, user?.role);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
