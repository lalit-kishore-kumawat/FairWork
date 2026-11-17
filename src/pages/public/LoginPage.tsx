import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { PublicLayout } from '@/src/layouts/PublicLayout';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { UserRole } from '@/src/types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loginAsRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const redirectForRole = (role: UserRole) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'freelancer') navigate('/freelancer/dashboard');
    else navigate('/client/dashboard');
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await login(values.email, values.password);
    if (!result.ok || !result.user) {
      setServerError(result.error || 'Unable to sign in.');
      return;
    }
    addToast({
      variant: 'success',
      title: `Signed in as ${result.user.name}`,
      description: `Loaded ${result.user.role} workspace.`,
    });
    redirectForRole(result.user.role);
  });

  const handleDemoLogin = (role: UserRole) => {
    const user = loginAsRole(role);
    addToast({
      variant: 'info',
      title: `Prototype Demo: ${user.name}`,
      description: `Switched into ${role} experience.`,
    });
    redirectForRole(role);
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:py-16">
        {/* Login Card */}
        <div className="flex-1 rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">
            Sign in to FairWork
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            Access your milestones, deliverable reviews, and project agreements.
          </p>

          {serverError && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#DC2626]"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="login-email"
                  type="email"
                  {...register('email')}
                  placeholder="you@company.com"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] pl-9 pr-10 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#64748B] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-[#64748B]">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB]"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgot((prev) => !prev);
                  setForgotSent(false);
                }}
                className="font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              >
                Forgot password?
              </button>
            </div>

            {showForgot && (
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2.5">
                <p className="text-xs font-medium text-[#0F172A]">
                  Reset Password (Prototype Preview)
                </p>
                {forgotSent ? (
                  <p className="text-xs text-[#16A34A]">
                    Password reset instructions simulated for {forgotEmail}.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter account email"
                      className="h-9 flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs"
                    />
                    <button
                      type="button"
                      disabled={!forgotEmail.includes('@')}
                      onClick={() => setForgotSent(true)}
                      className="rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                    >
                      Send Link
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Don&apos;t have a FairWork account?{' '}
            <Link to="/register" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Create an account
            </Link>
          </p>
        </div>

        {/* Prototype Role Explorer */}
        <div className="w-full rounded-xl border border-[#E2E8F0] bg-white p-6 lg:w-88">
          <h2 className="font-display text-base font-semibold text-[#0F172A]">
            Prototype Role Switcher
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">
            Explore each FairWork role directly using pre-populated prototype accounts.
          </p>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('client')}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-left transition-colors hover:border-[#2563EB] hover:bg-blue-50/40"
            >
              <p className="text-sm font-semibold text-[#0F172A]">Client · Maya Lin</p>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Create projects, review deliverables, approve milestones, raise disputes.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('freelancer')}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-left transition-colors hover:border-[#2563EB] hover:bg-blue-50/40"
            >
              <p className="text-sm font-semibold text-[#0F172A]">Freelancer · Devon Brooks</p>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Accept invitations, track deadlines, upload deliverables, monitor earnings.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-left transition-colors hover:border-[#2563EB] hover:bg-blue-50/40"
            >
              <p className="text-sm font-semibold text-[#0F172A]">Administrator · Marcus Vance</p>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Manage users, review dispute evidence, and record compliance decisions.
              </p>
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
