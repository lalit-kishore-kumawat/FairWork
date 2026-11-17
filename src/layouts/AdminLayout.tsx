import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { Avatar } from '@/src/components/common/Avatar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
}

export function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
    { label: 'Disputes', to: '/admin/disputes', icon: AlertTriangle },
    { label: 'Payments', to: '/admin/payments', icon: CreditCard },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0F172A] text-white">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>FairWork</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin sidebar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3">
          <p className="text-xs font-medium text-slate-400">Compliance & Admin Console</p>
        </div>

        <nav aria-label="Administrator navigation" className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 p-3">
        {currentUser && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-950/60 hover:text-red-300"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] lg:flex">
      <aside className="hidden w-64 shrink-0 bg-[#0F172A] lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{SidebarContent}</div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-[1px]"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-[#0F172A] shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin navigation"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                {breadcrumb && (
                  <p className="truncate text-xs font-medium text-[#64748B]">{breadcrumb}</p>
                )}
                <h1 className="truncate font-display text-lg font-bold text-[#0F172A] sm:text-xl">
                  {title}
                </h1>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#0F172A]">
              Admin Governance View
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
