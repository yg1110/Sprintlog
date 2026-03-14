import {
  Archive,
  BarChart3,
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Target,
} from "lucide-react";
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
  { to: "/work-logs", icon: BookOpen, label: "업무 기록" },
  { to: "/archive", icon: Archive, label: "업무 검색" },
];

export function Layout({ children, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/auth");
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#f7f8fa]">
      {/* Sidebar — desktop only */}
      <aside className="fixed top-0 left-0 hidden h-screen w-[220px] flex-col border-r border-[#e5e8eb] bg-white md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <img src="/favicon.svg" alt="Sprintlog" className="h-7 w-7" />
          <span className="text-[15px] font-bold tracking-tight text-[#191f28]">Sprintlog</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all",
                  isActive
                    ? "bg-[#ebf3ff] font-semibold text-[#3182f6]"
                    : "text-[#6b7684] hover:bg-[#f2f4f6] hover:text-[#191f28]",
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#e5e8eb] px-2.5 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-[#6b7684] transition-all hover:bg-[#f2f4f6] hover:text-[#191f28]"
          >
            <LogOut size={17} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b border-[#e5e8eb] bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="Sprintlog" className="h-6 w-6" />
          <span className="text-sm font-bold tracking-tight text-[#191f28]">Sprintlog</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center rounded-lg p-2 text-[#6b7684] transition-colors hover:bg-[#f2f4f6] hover:text-[#191f28]"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-14 pb-16 md:ml-[220px] md:pt-0 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed right-0 bottom-0 left-0 z-30 flex border-t border-[#e5e8eb] bg-white md:hidden">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors",
                isActive ? "text-[#3182f6]" : "text-[#b0b8c1]",
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
    <div className="rounded-2xl border border-[#e5e8eb] bg-white px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-wide text-[#6b7684]">{label}</p>
          <p className="text-[26px] font-bold leading-tight tracking-tight text-[#191f28]">
            {value}
          </p>
          {sub && <p className="text-[12px] font-medium text-[#b0b8c1]">{sub}</p>}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2f4f6]">
            <Icon size={18} className="text-[#6b7684]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[18px] font-bold tracking-tight text-[#191f28]">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5e8eb] py-16 text-center">
      <BarChart3 size={28} className="mb-3 text-[#b0b8c1]" />
      <p className="font-semibold text-[#6b7684]">{title}</p>
      {sub && <p className="mt-1 text-sm text-[#b0b8c1]">{sub}</p>}
    </div>
  );
}
