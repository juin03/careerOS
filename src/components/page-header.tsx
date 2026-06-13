// Consistent page header used across all dashboard pages — establishes hierarchy
// (large title, quiet subtitle) and an optional action slot on the right.
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// A stat card with optional trend hint and icon. The headline number is the
// dominant element — the rest recedes.
export function StatTile({
  icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block cursor-pointer rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
      >
        {inner}
      </a>
    );
  }
  return <div className="rounded-xl border bg-card p-5">{inner}</div>;
}
