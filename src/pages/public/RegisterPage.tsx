import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Eye, EyeOff, UserCheck } from 'lucide-react';
import { PublicLayout } from '@/src/layouts/PublicLayout';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';

const registerSchema = z
  .object({
    accountType: z.enum(['client', 'freelancer']),
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: 'client',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedType = watch('accountType');

  const onSubmit = handleSubmit(async (values) => {
    const res = await registerAccount({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      role: values.accountType,
    });

    if (res.ok && res.user) {
      addToast({
        variant: 'success',
        title: 'FairWork account created',
        description: `Welcome, ${res.user.name}. Your ${res.user.role} workspace is ready.`,
      });
      navigate(
        res.user.role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard'
      );
    }
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">
            Create your FairWork account
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            Choose your account type to start managing structured project agreements.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <span className="mb-2 block text-sm font-medium text-[#0F172A]">
                Account Type
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setValue('accountType', 'client')}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === 'client'
                      ? 'border-[#2563EB] bg-blue-50/40'
                      : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                  }`}
                >
                  <Briefcase
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      selectedType === 'client' ? 'text-[#2563EB]' : 'text-[#64748B]'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">Client</p>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      Hire freelancers &amp; verify milestones
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('accountType', 'freelancer')}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === 'freelancer'
                      ? 'border-[#2563EB] bg-blue-50/40'
                      : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                  }`}
                >
                  <UserCheck
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      selectedType === 'freelancer' ? 'text-[#2563EB]' : 'text-[#64748B]'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">Freelancer</p>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      Deliver milestones &amp; track earnings
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                {...register('fullName')}
                placeholder="Alex Morgan"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                {...register('email')}
                placeholder="alex@company.com"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-pass" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Minimum 8 characters"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 pr-10 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#64748B]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Re-enter password"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {isSubmitting ? 'Creating Account...' : 'Create FairWork Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
