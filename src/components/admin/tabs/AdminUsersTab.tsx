import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { AdminEmptyState } from '../shared/AdminEmptyState';
import { AVATAR_IMAGE_FALLBACK, setImageFallback } from '../../../utils/imageFallbacks';
import type { Profile } from '../../../types';

interface AdminUsersTabProps {
  profiles: Profile[] | undefined;
  isLoading: boolean;
  currentUserId: string;
  onUpdateRole: (args: { adminId: string; targetUserId: string; newRole: 'tenant' | 'landlord' | 'admin' }) => void;
  adminId: string;
}

export const AdminUsersTab = ({
  profiles,
  isLoading,
  currentUserId,
  onUpdateRole,
  adminId,
}: AdminUsersTabProps) => {
  const [search, setSearch] = useState('');

  const filtered = (profiles || []).filter(p =>
    !search || (p.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">All Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage user accounts and roles</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground w-60"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl">
          <AdminEmptyState icon={Users} title="No users found" body="No users match your search." />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 hidden md:table-cell font-semibold">Joined</th>
                <th className="px-5 py-3.5 font-semibold">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${profile.full_name}`}
                        alt={profile.full_name || 'User'}
                        className="w-8 h-8 rounded-full border border-border"
                        onError={(e) => setImageFallback(e, AVATAR_IMAGE_FALLBACK)}
                      />
                      <span className="font-semibold text-foreground">{profile.full_name || 'Unnamed User'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`capitalize text-xs font-bold px-2.5 py-1 rounded-full border ${
                      profile.role === 'admin'
                        ? 'text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-400/10 border-violet-300 dark:border-violet-400/30'
                        : profile.role === 'landlord'
                          ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 border-blue-300 dark:border-blue-400/30'
                          : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground text-xs">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    {profile.id !== currentUserId ? (
                      <select
                        value={profile.role}
                        onChange={e => onUpdateRole({ adminId, targetUserId: profile.id, newRole: e.target.value as any })}
                        className="bg-white dark:bg-slate-900 border border-border text-foreground text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                      >
                        <option value="tenant">Tenant</option>
                        <option value="landlord">Landlord</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">This is you</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
