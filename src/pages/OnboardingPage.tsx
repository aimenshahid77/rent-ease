import { Navigate } from 'react-router-dom';
import { Home, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStatus } from '../hooks/useOnboarding';
import { TenantOnboardingForm } from '../components/onboarding/TenantOnboardingForm';
import { LandlordOnboardingForm } from '../components/onboarding/LandlordOnboardingForm';

export default function OnboardingPage() {
  const { user, loading } = useAuthStore();
  const { data: isComplete, isLoading: checkingOnboarding } = useOnboardingStatus(user?.id, user?.role);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isComplete) {
    const dashboard = user.role === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard';
    return <Navigate to={dashboard} replace />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-black text-slate-900 text-2xl tracking-tight">
              Rent<span className="text-primary">Ease</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 text-center">
            Complete your profile to start using RentEase as a{' '}
            <span className="font-semibold text-primary capitalize">{user.role}</span>
          </p>
        </div>

        {user.role === 'tenant' ? <TenantOnboardingForm /> : <LandlordOnboardingForm />}
      </div>
    </div>
  );
}
