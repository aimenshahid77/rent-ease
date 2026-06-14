import { CheckCircle, XCircle } from 'lucide-react';
import { AdminEmptyState } from '../shared/AdminEmptyState';
import { AVATAR_IMAGE_FALLBACK, setImageFallback } from '../../../utils/imageFallbacks';

interface AdminApprovalsTabProps {
  pendingOnboarding: any[] | undefined;
  isLoading: boolean;
  isVerifying: boolean;
  onApprove: (userId: string, role: 'tenant' | 'landlord') => void;
  onReject: (userId: string, role: 'tenant' | 'landlord') => void;
}

export const AdminApprovalsTab = ({
  pendingOnboarding,
  isLoading,
  isVerifying,
  onApprove,
  onReject,
}: AdminApprovalsTabProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-foreground">Pending Account Approvals</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review onboarding submissions and approve or reject user accounts
        </p>
      </div>
      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-400/30">
        {pendingOnboarding?.length || 0} pending
      </span>
    </div>

    {isLoading ? (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse border border-border" />
        ))}
      </div>
    ) : !pendingOnboarding || pendingOnboarding.length === 0 ? (
      <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl">
        <AdminEmptyState icon={CheckCircle} title="All caught up" body="No pending account approvals at this time." />
      </div>
    ) : (
      <div className="space-y-3">
        {pendingOnboarding.map((entry: any) => {
          const profile = entry.profile;
          const name = profile?.full_name || entry.full_name || 'Unknown User';
          const isLandlord = entry.role === 'landlord';

          return (
            <div
              key={`${entry.role}-${entry.user_id}`}
              className="p-5 bg-white dark:bg-slate-800 border border-border hover:border-primary/30 rounded-2xl flex flex-col sm:flex-row sm:items-start gap-5 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${name}`}
                  alt={name}
                  className="w-11 h-11 rounded-full border-2 border-border shrink-0"
                  onError={(e) => setImageFallback(e, AVATAR_IMAGE_FALLBACK)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-bold text-foreground">{name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                      isLandlord
                        ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 border-blue-300 dark:border-blue-400/30'
                        : 'text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-400/10 border-cyan-300 dark:border-cyan-400/30'
                    }`}>
                      {entry.role}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 border-amber-300 dark:border-amber-400/30">
                      Pending Review
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    {entry.phone && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Phone</span> {entry.phone}
                      </span>
                    )}
                    {entry.occupation && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Occupation</span> {entry.occupation}
                      </span>
                    )}
                    {entry.cnic_number && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">CNIC</span> {entry.cnic_number}
                      </span>
                    )}
                    {!isLandlord && entry.preferred_city && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Preferred city</span> {entry.preferred_city}
                      </span>
                    )}
                    {!isLandlord && entry.budget_min != null && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Budget</span> ${entry.budget_min} to ${entry.budget_max}/mo
                      </span>
                    )}
                    {!isLandlord && entry.household_size != null && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Household size</span> {entry.household_size}
                      </span>
                    )}
                    {isLandlord && entry.property_city && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Property city</span> {entry.property_city}
                      </span>
                    )}
                    {isLandlord && entry.expected_listings_count != null && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Expected listings</span> {entry.expected_listings_count}
                      </span>
                    )}
                    {isLandlord && entry.ownership_status && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-primary">Ownership</span> {entry.ownership_status}
                      </span>
                    )}
                    {entry.reason_for_using && (
                      <span className="sm:col-span-2 lg:col-span-3 italic text-muted-foreground line-clamp-2 mt-0.5">
                        &ldquo;{entry.reason_for_using}&rdquo;
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 sm:self-center">
                <button
                  onClick={() => onApprove(entry.user_id, entry.role)}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-400/30 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  onClick={() => onReject(entry.user_id, entry.role)}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-400/10 dark:hover:bg-red-400/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-400/30 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
