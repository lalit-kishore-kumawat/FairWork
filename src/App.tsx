import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { AppDataProvider } from '@/src/context/AppDataContext';
import { ToastProvider } from '@/src/context/ToastContext';
import { UserRole } from '@/src/types';

// Public Pages
import { LandingPage } from '@/src/pages/public/LandingPage';
import { LoginPage } from '@/src/pages/public/LoginPage';
import { RegisterPage } from '@/src/pages/public/RegisterPage';

// Client Pages
import { ClientDashboard } from '@/src/pages/client/ClientDashboard';
import { FindFreelancersPage } from '@/src/pages/client/FindFreelancersPage';

// Freelancer Pages
import { FreelancerDashboard } from '@/src/pages/freelancer/FreelancerDashboard';

// Shared & Project Pages
import { ProjectsListPage } from '@/src/pages/projects/ProjectsListPage';
import { ProjectDetailsPage } from '@/src/pages/projects/ProjectDetailsPage';
import { ProjectMilestonesPage } from '@/src/pages/projects/ProjectMilestonesPage';
import { DeliverablesPage } from '@/src/pages/projects/DeliverablesPage';
import { PaymentsPage } from '@/src/pages/payments/PaymentsPage';
import { DisputesPage } from '@/src/pages/disputes/DisputesPage';
import { NotificationsPage } from '@/src/pages/notifications/NotificationsPage';
import { SettingsPage } from '@/src/pages/settings/SettingsPage';

// Admin Pages
import { AdminDashboard } from '@/src/pages/admin/AdminDashboard';

function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const fallback =
      currentUser.role === 'admin'
        ? '/admin/dashboard'
        : currentUser.role === 'freelancer'
          ? '/freelancer/dashboard'
          : '/client/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Client Routes */}
      <Route
        path="/client/dashboard"
        element={
          <RequireAuth allowedRoles={['client', 'admin']}>
            <ClientDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/client/projects"
        element={
          <RequireAuth allowedRoles={['client', 'admin']}>
            <ProjectsListPage pageTitle="Client Projects" />
          </RequireAuth>
        }
      />
      <Route
        path="/client/find-freelancers"
        element={
          <RequireAuth allowedRoles={['client', 'admin']}>
            <FindFreelancersPage />
          </RequireAuth>
        }
      />

      {/* Freelancer Routes */}
      <Route
        path="/freelancer/dashboard"
        element={
          <RequireAuth allowedRoles={['freelancer', 'admin']}>
            <FreelancerDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/freelancer/projects"
        element={
          <RequireAuth allowedRoles={['freelancer', 'admin']}>
            <ProjectsListPage pageTitle="My Projects" />
          </RequireAuth>
        }
      />
      <Route
        path="/freelancer/invitations"
        element={
          <RequireAuth allowedRoles={['freelancer', 'admin']}>
            <ProjectsListPage
              defaultStatusFilter="Awaiting Acceptance"
              pageTitle="Project Invitations"
            />
          </RequireAuth>
        }
      />
      <Route
        path="/freelancer/milestones"
        element={
          <RequireAuth allowedRoles={['freelancer', 'admin']}>
            <ProjectMilestonesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/freelancer/deliverables"
        element={
          <RequireAuth allowedRoles={['freelancer', 'admin']}>
            <DeliverablesPage />
          </RequireAuth>
        }
      />

      {/* Shared Project & Workspace Routes */}
      <Route
        path="/projects/:id"
        element={
          <RequireAuth>
            <ProjectDetailsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/:id/milestones"
        element={
          <RequireAuth>
            <ProjectMilestonesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/:id/deliverables"
        element={
          <RequireAuth>
            <DeliverablesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/payments"
        element={
          <RequireAuth>
            <PaymentsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/disputes"
        element={
          <RequireAuth>
            <DisputesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />

      {/* Administrator Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminDashboard section="overview" />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminDashboard section="users" />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminDashboard section="projects" />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminDashboard section="disputes" />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminDashboard section="payments" />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminDashboard section="reports" />
          </RequireAuth>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppDataProvider>
            <AppRoutes />
          </AppDataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
