import {
  Building2, Clock, TrendingUp, Users, Home,
  UserCheck, EyeOff, ListChecks,
} from 'lucide-react';
import { AdminStatCard } from '../shared/AdminStatCard';

interface AdminOverviewTabProps {
  stats: {
    totalListings: number;
    pendingListings: number;
    activeListings: number;
    totalUsers: number;
    landlords: number;
    tenants: number;
    totalReviews: number;
    hiddenReviews: number;
    pendingApprovals: number;
  };
  onGoToApprovals: () => void;
  onGoToListings: () => void;
}

export const AdminOverviewTab = ({ stats, onGoToApprovals, onGoToListings }: AdminOverviewTabProps) => (
  <div className="space-y-8">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <AdminStatCard label="Total Listings"   value={stats.totalListings}    icon={Building2}  accent="bg-primary/10 text-primary" />
      <AdminStatCard label="Pending Approval" value={stats.pendingListings}  icon={Clock}      accent="bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400" />
      <AdminStatCard label="Active Listings"  value={stats.activeListings}   icon={TrendingUp} accent="bg-emerald-100 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400" />
      <AdminStatCard label="Total Users"      value={stats.totalUsers}       icon={Users}      accent="bg-violet-100 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400" />
      <AdminStatCard label="Landlords"        value={stats.landlords}        icon={Home}       accent="bg-blue-100 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400" />
      <AdminStatCard label="Tenants"          value={stats.tenants}          icon={Users}      accent="bg-cyan-100 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400" />
      <AdminStatCard label="Pending Accounts" value={stats.pendingApprovals} icon={UserCheck}  accent="bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400" />
      <AdminStatCard label="Hidden Reviews"   value={stats.hiddenReviews}    icon={EyeOff}     accent="bg-red-100 dark:bg-red-400/10 text-red-600 dark:text-red-400" />
    </div>

    {(stats.pendingApprovals > 0 || stats.pendingListings > 0) && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.pendingApprovals > 0 && (
          <button
            onClick={onGoToApprovals}
            className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl text-left hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">User Approvals Needed</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {stats.pendingApprovals} {stats.pendingApprovals === 1 ? 'account is' : 'accounts are'} waiting for your review
            </p>
          </button>
        )}
        {stats.pendingListings > 0 && (
          <button
            onClick={onGoToListings}
            className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-left hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary text-sm">Listings Pending Review</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingListings} {stats.pendingListings === 1 ? 'listing is' : 'listings are'} waiting for approval
            </p>
          </button>
        )}
      </div>
    )}
  </div>
);
