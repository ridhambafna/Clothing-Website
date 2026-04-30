import AdminNotifications from "./AdminNotifications";

export default function PageShell({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode; }) {
  return (
    <div>
      <div className="mb-10 flex items-end justify-between border-b border-neutral-200 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">Admin</p>
          <h1 className="font-heading text-3xl uppercase tracking-[0.15em]">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 mt-1 font-light">{subtitle}</p>}
        </div>
        <div className="flex gap-4 items-center">
          {actions}
          <div className="border-l border-neutral-200 pl-4 h-6 flex items-center">
            <AdminNotifications />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
