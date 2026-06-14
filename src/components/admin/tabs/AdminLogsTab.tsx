import { FileText } from 'lucide-react';
import { AdminEmptyState } from '../shared/AdminEmptyState';
import type { AuditLog, Profile } from '../../../types';

type AdminLog = AuditLog & { admin?: Profile };

interface AdminLogsTabProps {
  logs: AdminLog[] | undefined;
}

export const AdminLogsTab = ({ logs }: AdminLogsTabProps) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-bold text-foreground">Audit Logs</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        A complete record of all admin actions taken on the platform
      </p>
    </div>

    {!logs || logs.length === 0 ? (
      <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl">
        <AdminEmptyState icon={FileText} title="No audit logs yet" body="Actions you take will appear here." />
      </div>
    ) : (
      <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Admin</th>
              <th className="px-5 py-3.5 font-semibold">Action</th>
              <th className="px-5 py-3.5 hidden md:table-cell font-semibold">Target</th>
              <th className="px-5 py-3.5 hidden lg:table-cell font-semibold">Notes</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-foreground">{log.admin?.full_name || 'Admin'}</td>
                <td className="px-5 py-3.5">
                  <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-mono">
                    {log.action.replace(/_/g, ' ')}
                  </code>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground text-xs capitalize">
                  {log.target_type}
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-xs max-w-[200px] truncate">
                  {log.notes || 'No notes'}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
