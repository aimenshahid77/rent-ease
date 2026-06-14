import { Outlet } from 'react-router-dom';
import { Loader2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useApprovalStatus } from '../../hooks/useOnboarding';
import { Link } from 'react-router-dom';

/**
 * Wraps routes that require the user to have been approved by admin.
 * - Admins always pass through.
 * - Unapproved tenants / landlords see a "pending approval" screen.
 * - Users who haven't completed onboarding are redirected by OnboardingRoute first.
 */
export const ApprovalRoute = () => {
  const { user } = useAuthStore();

  // Admins bypass all approval checks
  if (!user || user.role === 'admin') {
    return <Outlet />;
  }

  return <ApprovalCheck />;
};

const ApprovalCheck = () => {
  const { user } = useAuthStore();
  const { data: status, isLoading } = useApprovalStatus(user?.id, user?.role);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== 'approved') {
    const isRejected = status === 'rejected';

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {isRejected ? 'Account Not Approved' : 'Awaiting Admin Approval'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {isRejected
                ? 'Your account was not approved. Please contact our support team for more information or re-submit your onboarding profile.'
                : "Your profile is under review. Once our admin team approves your account you'll have full access to all features."}
            </p>
          </div>

          {!isRejected && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-left">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                ⏱ Review typically takes 1–2 business days. You'll have access as soon as your account is approved.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Back to Home
            </Link>
            {isRejected && (
              <Link
                to="/onboarding"
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold bg-secondary hover:bg-secondary/90 text-white rounded-xl transition-colors shadow-lg"
              >
                Re-submit Profile <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
