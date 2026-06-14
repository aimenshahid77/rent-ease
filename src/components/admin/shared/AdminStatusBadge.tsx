interface AdminStatusBadgeProps {
  status: string;
}

const statusMap: Record<string, string> = {
  active:   'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 border-emerald-300 dark:border-emerald-400/30',
  pending:  'text-amber-700   bg-amber-100   dark:text-amber-400   dark:bg-amber-400/10   border-amber-300   dark:border-amber-400/30',
  rejected: 'text-red-700     bg-red-100     dark:text-red-400     dark:bg-red-400/10     border-red-300     dark:border-red-400/30',
  rented:   'text-blue-700    bg-blue-100    dark:text-blue-400    dark:bg-blue-400/10    border-blue-300    dark:border-blue-400/30',
  paused:   'text-slate-600   bg-slate-100   dark:text-slate-400   dark:bg-slate-700      border-slate-300   dark:border-slate-600',
};

export const AdminStatusBadge = ({ status }: AdminStatusBadgeProps) => (
  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusMap[status] || statusMap.paused}`}>
    {status}
  </span>
);
