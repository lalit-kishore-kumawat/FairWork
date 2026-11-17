import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CheckSquare,
  CreditCard,
  FileUp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { Avatar } from '@/src/components/common/Avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
  primaryAction?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  breadcrumb,
  primaryAction,
}: DashboardLayoutProps) {
  const { currentUser, logout } = useAuth();
  const { notifications } = useAppData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = currentUser?.role || 'client';
  const unreadCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.read
  ).length;

  const clientNav = [
    { label: 'Overview', to: '/client/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', to: '/client/projects', icon: FolderKanban },
    { label: 'Find Freelancers', to: '/client/find-freelancers', icon: Users },
    { label: 'Payments', to: '/payments', icon: CreditCard },
    { label: 'Disputes', to: '/disputes', icon: AlertTriangle },
    { label: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const freelancerNav = [
    { label: 'Overview', to: '/freelancer/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', to: '/freelancer/projects', icon: FolderKanban },
    { label: 'Project Invitations', to: '/freelancer/invitations', icon: Mail },
    { label: 'Milestones', to: '/freelancer/milestones', icon: CheckSquare },
    { label: 'Deliverables', to: '/freelancer/deliverables', icon: FileUp },
    { label: 'Earnings', to: '/payments', icon: CreditCard },
    { label: 'Disputes', to: '/disputes', icon: AlertTriangle },
    { label: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const navItems = role === 'freelancer' ? freelancerNav : clientNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <Link
            to={role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard'}
            className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#0F172A]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>FairWork</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="px-2 text-xs font-medium text-[#64748B]">
            {role === 'freelancer' ? 'Freelancer Workspace' : 'Client Workspace'}
          </p>
        </div>

        <nav aria-label="Workspace sidebar" className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB]'
                      : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                  }`
                }
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="rounded-md bg-[#2563EB] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white tabular-nums">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#E2E8F0] p-3">
        {currentUser && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0F172A]">{currentUser.name}</p>
              <p className="truncate text-xs text-[#64748B]">{currentUser.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-red-50 hover:text-[#DC2626]"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] lg:flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[#E2E8F0] bg-white lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{SidebarContent}</div>
      </aside>

      {/* Mobile / Tablet Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[1px]"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] border-r border-[#E2E8F0] bg-white shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation drawer"
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

            <div className="flex items-center gap-3 shrink-0">
              {primaryAction}
              <Link
                to="/notifications"
                aria-label={`Notifications (${unreadCount} unread)`}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {currentUser && (
                <Link
                  to="/settings"
                  className="hidden sm:flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white py-1 pl-1.5 pr-3 hover:bg-slate-50"
                >
                  <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="xs" />
                  <span className="text-xs font-medium text-[#0F172A] whitespace-nowrap">
                    {currentUser.name}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
