import { Archive, BarChart3, BookOpen, FolderKanban, LayoutDashboard, LogOut, Target } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { cn } from "../lib/cn";

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { to: "/okrs", icon: Target, label: "OKR" },
  { to: "/projects", icon: FolderKanban, label: "프로젝트" },
  { to: "/work-logs", icon: BookOpen, label: "업무기록" },
  { to: "/archive", icon: Archive, label: "업무 아카이브" },
];

export function Layout({ children, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/auth");
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#f8f8f8]">
      {/* Sidebar — desktop only */}
      <aside className="fixed top-0 left-0 hidden h-screen w-60 flex-col border-r border-black/5 bg-white md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-6">
          <img src="/favicon.svg" alt="Sprintlog" className="h-8 w-8" />
          <span className="text-base font-black tracking-tight">Sprintlog</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-black text-white"
                    : "text-black/50 hover:bg-black/5 hover:text-black",
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-black/5 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-black/40 transition-all hover:bg-black/5 hover:text-black"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b border-black/5 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black">
            <img src="/favicon.svg" alt="Sprintlog" className="h-8 w-8" />
          </div>
          <span className="text-sm font-black tracking-tight">Sprintlog</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center rounded-lg p-2 text-black/40 transition-colors hover:bg-black/5 hover:text-black"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-14 pb-16 md:ml-60 md:pt-0 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed right-0 bottom-0 left-0 z-30 flex border-t border-black/5 bg-white md:hidden">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold transition-colors",
                isActive ? "text-black" : "text-black/30",
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest text-black/30 uppercase">{label}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
          {sub && <p className="text-xs font-medium text-black/30">{sub}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5">
            <Icon size={20} className="text-black/40" />
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 py-16 text-center">
      <BarChart3 size={32} className="mb-4 text-black/10" />
      <p className="font-bold text-black/30">{title}</p>
      {sub && <p className="mt-1 text-sm text-black/20">{sub}</p>}
    </div>
  );
}
