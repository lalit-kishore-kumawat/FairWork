import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, Save, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/src/layouts/DashboardLayout';
import { AdminLayout } from '@/src/layouts/AdminLayout';
import { Avatar } from '@/src/components/common/Avatar';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  skillsText: z.string().optional(),
  portfolioText: z.string().optional(),
  bio: z.string().max(400, 'Bio must be 400 characters or fewer').optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const { currentUser, updateCurrentUser, loginAsRole, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      skillsText: currentUser?.skills.join(', ') || '',
      portfolioText: currentUser?.portfolioLinks.join(', ') || '',
      bio: currentUser?.bio || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  if (!currentUser) return null;

  const onSaveProfile = profileForm.handleSubmit((values) => {
    updateCurrentUser({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || '',
      skills: (values.skillsText || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      portfolioLinks: (values.portfolioText || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio: values.bio?.trim() || '',
    });
    addToast({
      variant: 'success',
      title: 'Profile settings saved',
      description: 'Your FairWork profile details have been updated.',
    });
  });

  const onSavePassword = passwordForm.handleSubmit(() => {
    passwordForm.reset();
    addToast({
      variant: 'success',
      title: 'Password updated (Prototype)',
      description: 'Password validation passed. Backend endpoint integration ready.',
    });
  });

  const toggleNotificationPref = (
    key: keyof typeof currentUser.notificationPrefs
  ) => {
    updateCurrentUser({
      notificationPrefs: {
        ...currentUser.notificationPrefs,
        [key]: !currentUser.notificationPrefs[key],
      },
    });
    addToast({ variant: 'info', title: 'Notification preference updated' });
  };

  const togglePrivacyPref = (key: keyof typeof currentUser.privacyPrefs) => {
    updateCurrentUser({
      privacyPrefs: {
        ...currentUser.privacyPrefs,
        [key]: !currentUser.privacyPrefs[key],
      },
    });
    addToast({ variant: 'info', title: 'Privacy preference updated' });
  };

  const Layout = currentUser.role === 'admin' ? AdminLayout : DashboardLayout;

  return (
    <Layout title="Settings & Profile" breadcrumb="Workspace · Settings">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Segmented Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-white p-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Profile Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                activeTab === 'account'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Account &amp; Security
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#64748B]">Demo Switch:</span>
            {(['client', 'freelancer', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  const next = loginAsRole(r);
                  addToast({ variant: 'info', title: `Switched to ${next.name} (${r})` });
                  navigate(
                    r === 'admin'
                      ? '/admin/dashboard'
                      : r === 'freelancer'
                        ? '/freelancer/dashboard'
                        : '/client/dashboard'
                  );
                }}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${
                  currentUser.role === r
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                    : 'border-[#E2E8F0] bg-white text-[#0F172A]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'profile' ? (
          <form
            onSubmit={onSaveProfile}
            className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-6"
          >
            <div className="flex flex-wrap items-center gap-4 border-b border-[#E2E8F0] pb-5">
              <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="xl" />
              <div>
                <h2 className="font-display text-lg font-bold text-[#0F172A]">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-[#64748B]">
                  {currentUser.title} · Role: <span className="capitalize">{currentUser.role}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Full Name
                </label>
                <input
                  {...profileForm.register('name')}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-[#DC2626]">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Email Address
                </label>
                <input
                  {...profileForm.register('email')}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
                {profileForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-[#DC2626]">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Phone Number
                </label>
                <input
                  {...profileForm.register('phone')}
                  placeholder="+1 (555) 000-0000"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Skills (comma separated)
                </label>
                <input
                  {...profileForm.register('skillsText')}
                  placeholder="React, TypeScript, Product Strategy"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Portfolio Links (comma separated URLs)
              </label>
              <input
                {...profileForm.register('portfolioText')}
                placeholder="https://portfolio.dev, https://github.com/username"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Bio</label>
              <textarea
                {...profileForm.register('bio')}
                rows={3}
                className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Change Password */}
            <form
              onSubmit={onSavePassword}
              className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4"
            >
              <h2 className="font-display text-base font-semibold text-[#0F172A]">
                Change Password
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748B]">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748B]">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register('newPassword')}
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748B]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Update Password
                </button>
              </div>
            </form>

            {/* Notification & Privacy Preferences */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4">
                <h3 className="font-display text-base font-semibold text-[#0F172A]">
                  Notification Preferences
                </h3>
                <div className="space-y-3 text-sm">
                  {(
                    [
                      ['milestoneUpdates', 'Milestone deadline reminders'],
                      ['deliverableSubmissions', 'Deliverable upload & review alerts'],
                      ['paymentStatusChanges', 'Payment ledger status changes'],
                      ['inactivityAlerts', 'Inactivity & SLA alerts'],
                      ['disputeUpdates', 'Dispute comment & resolution updates'],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="text-[#0F172A]">{label}</span>
                      <input
                        type="checkbox"
                        checked={currentUser.notificationPrefs[key]}
                        onChange={() => toggleNotificationPref(key)}
                        className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-[#0F172A]">
                  <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                  <span>Privacy Settings</span>
                </h3>
                <div className="space-y-3 text-sm">
                  {(
                    [
                      ['showPortfolioPublicly', 'Display portfolio links to collaborators'],
                      ['allowDirectInvites', 'Allow direct project agreement invitations'],
                      ['shareActivityTimestamps', 'Include timestamps in shared audit logs'],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="text-[#0F172A]">{label}</span>
                      <input
                        type="checkbox"
                        checked={currentUser.privacyPrefs[key]}
                        onChange={() => togglePrivacyPref(key)}
                        className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB]"
                      />
                    </label>
                  ))}
                </div>

                <div className="border-t border-[#E2E8F0] pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-[#DC2626] hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout of Session</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
