interface AdminEmptyStateProps {
  icon: React.ElementType;
  title: string;
  body: string;
}

export const AdminEmptyState = ({ icon: Icon, title, body }: AdminEmptyStateProps) => (
  <div className="text-center py-16 px-4">
    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-7 w-7 text-primary" />
    </div>
    <p className="font-semibold text-foreground mb-1">{title}</p>
    <p className="text-sm text-muted-foreground">{body}</p>
  </div>
);
