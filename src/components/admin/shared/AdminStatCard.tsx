interface AdminStatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}

export const AdminStatCard = ({ label, value, icon: Icon, accent }: AdminStatCardProps) => (
  <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-2xl font-extrabold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);
