import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, X } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const handleHashNav = (hash: string) => {
    setMobileOpen(false);
    if (isLanding) {
      const target = document.getElementById(hash);
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>FairWork</span>
          </Link>

          {/* Zone 2: 4 single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#64748B]"
          >
            {isLanding ? (
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  handleHashNav('how-it-works');
                }}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0F172A]"
              >
                How It Works
              </a>
            ) : (
              <Link
                to="/#how-it-works"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0F172A]"
              >
                How It Works
              </Link>
            )}
            {isLanding ? (
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  handleHashNav('features');
                }}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0F172A]"
              >
                Features
              </a>
            ) : (
              <Link
                to="/#features"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0F172A]"
              >
                Features
              </Link>
            )}
            {isLanding ? (
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  handleHashNav('faq');
                }}
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0F172A]"
              >
                FAQ
              </a>
            ) : (
              <Link
                to="/#faq"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0F172A]"
              >
                FAQ
              </Link>
            )}
            <Link
              to="/login"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0F172A]"
            >
              Sign In
            </Link>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/register"
              className="hidden sm:inline-flex whitespace-nowrap shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3 text-sm font-medium text-[#0F172A]">
              <Link
                to="/#how-it-works"
                onClick={() => handleHashNav('how-it-works')}
                className="rounded-lg px-2 py-2 hover:bg-slate-50"
              >
                How It Works
              </Link>
              <Link
                to="/#features"
                onClick={() => handleHashNav('features')}
                className="rounded-lg px-2 py-2 hover:bg-slate-50"
              >
                Features
              </Link>
              <Link
                to="/#faq"
                onClick={() => handleHashNav('faq')}
                className="rounded-lg px-2 py-2 hover:bg-slate-50"
              >
                FAQ
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-display text-lg font-bold text-[#0F172A]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>FairWork</span>
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#64748B]">
                Trust. Track. Deliver. Get Paid. Structured milestone agreements and evidence-based
                accountability for independent professionals and hiring teams.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#0F172A]">Platform</h4>
              <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
                <li>
                  <a href="#how-it-works" className="hover:text-[#0F172A]">
                    How FairWork Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#0F172A]">
                    Core Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#0F172A]">
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#0F172A]">Access</h4>
              <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
                <li>
                  <Link to="/login" className="hover:text-[#0F172A]">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#0F172A]">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#0F172A]">
                    Role Demo Preview
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-[#E2E8F0] pt-6 text-xs text-[#64748B] sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} FairWork Accountability Systems. Frontend Prototype.</p>
            <p>Clear agreements · Milestone verification · Evidence-based resolution</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
