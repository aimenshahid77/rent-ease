import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  useAdminListings, useAdminProfiles, useAdminLogs,
  useUpdateListingStatus, useUpdateUserRole,
} from '../../hooks/useListings';
import { useAdminReviews, useToggleReviewVisibility } from '../../hooks/useReviews';
import { useAdminPendingOnboarding, useAdminUpdateVerification } from '../../hooks/useOnboarding';
import {
  LayoutDashboard, ListChecks, Users, Star, FileText,
  ShieldCheck, UserCheck, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminOverviewTab }  from './tabs/AdminOverviewTab';
import { AdminApprovalsTab } from './tabs/AdminApprovalsTab';
import { AdminListingsTab }  from './tabs/AdminListingsTab';
import { AdminUsersTab }     from './tabs/AdminUsersTab';
import { AdminReviewsTab }   from './tabs/AdminReviewsTab';
import { AdminLogsTab }      from './tabs/AdminLogsTab';

type AdminTab = 'overview' | 'approvals' | 'listings' | 'users' | 'reviews' | 'logs';

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const { data: listings,         isLoading: listingsLoading  } = useAdminListings();
  const { data: profiles,         isLoading: profilesLoading  } = useAdminProfiles();
  const { data: adminReviews                                   } = useAdminReviews();
  const { data: logs                                           } = useAdminLogs();
  const { data: pendingOnboarding, isLoading: approvalLoading } = useAdminPendingOnboarding();

  const { mutate: updateStatus  } = useUpdateListingStatus();
  const { mutate: updateRole    } = useUpdateUserRole();
  const { mutate: toggleReview  } = useToggleReviewVisibility();
  const { mutate: updateVerification, isPending: isVerifying } = useAdminUpdateVerification();

  const handleApprove = (userId: string, role: 'tenant' | 'landlord') => {
    if (!user) return;
    updateVerification(
      { adminId: user.id, userId, role, status: 'approved' },
      { onSuccess: () => toast.success('Account approved. The user can now access the platform.') }
    );
  };

  const handleReject = (userId: string, role: 'tenant' | 'landlord') => {
    if (!user) return;
    updateVerification(
      { adminId: user.id, userId, role, status: 'rejected' },
      { onSuccess: () => toast.success('Account rejected.') }
    );
  };

  const stats = {
    totalListings:    listings?.length || 0,
    pendingListings:  listings?.filter(l => l.status === 'pending').length || 0,
    activeListings:   listings?.filter(l => l.status === 'active').length || 0,
    totalUsers:       profiles?.length || 0,
    landlords:        profiles?.filter(p => p.role === 'landlord').length || 0,
    tenants:          profiles?.filter(p => p.role === 'tenant').length || 0,
    totalReviews:     adminReviews?.length || 0,
    hiddenReviews:    adminReviews?.filter(r => r.is_hidden).length || 0,
    pendingApprovals: pendingOnboarding?.length || 0,
  };

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview',  label: 'Overview',   icon: LayoutDashboard },
    { id: 'approvals', label: 'Approvals',  icon: UserCheck,  badge: stats.pendingApprovals },
    { id: 'listings',  label: 'Listings',   icon: ListChecks, badge: stats.pendingListings  },
    { id: 'users',     label: 'Users',      icon: Users },
    { id: 'reviews',   label: 'Reviews',    icon: Star },
    { id: 'logs',      label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Platform administration, moderation and user approvals
          </p>
        </div>
        {stats.pendingApprovals > 0 && (
          <button
            onClick={() => setActiveTab('approvals')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4" />
            {stats.pendingApprovals} pending {stats.pendingApprovals === 1 ? 'approval' : 'approvals'}
          </button>
        )}
      </div>

      {/* Tab Nav */}
      <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          stats={stats}
          onGoToApprovals={() => setActiveTab('approvals')}
          onGoToListings={() => setActiveTab('listings')}
        />
      )}

      {activeTab === 'approvals' && (
        <AdminApprovalsTab
          pendingOnboarding={pendingOnboarding}
          isLoading={approvalLoading}
          isVerifying={isVerifying}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {activeTab === 'listings' && (
        <AdminListingsTab
          listings={listings}
          isLoading={listingsLoading}
          adminId={user!.id}
          onUpdateStatus={updateStatus}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsersTab
          profiles={profiles}
          isLoading={profilesLoading}
          currentUserId={user!.id}
          adminId={user!.id}
          onUpdateRole={updateRole}
        />
      )}

      {activeTab === 'reviews' && (
        <AdminReviewsTab
          reviews={adminReviews}
          adminId={user!.id}
          onToggleVisibility={toggleReview}
        />
      )}

      {activeTab === 'logs' && (
        <AdminLogsTab logs={logs} />
      )}

    </div>
  );
};
