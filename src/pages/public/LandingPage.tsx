import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileCheck2,
  FileText,
  Scale,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { PublicLayout } from '@/src/layouts/PublicLayout';

const FAQS = [
  {
    q: 'How does FairWork prevent freelancers from disappearing mid-project?',
    a: 'Every project starts with a signed milestone breakdown, explicit acceptance criteria, and automated inactivity monitoring. If deadlines slip or communication stops, FairWork logs timestamped inactivity alerts and structures evidence for rapid resolution.',
  },
  {
    q: 'How does FairWork protect freelancers from scope creep or delayed approvals?',
    a: 'All deliverables, revision limits, and milestone amounts are locked in the project agreement before work begins. When a freelancer submits deliverables, review timestamps and acceptance criteria create an objective record.',
  },
  {
    q: 'Does FairWork process real escrow payments in this frontend prototype?',
    a: 'No. This frontend prototype demonstrates the structured agreement, milestone tracking, deliverable verification, and payment ledger UI using clearly labeled mock data. Live payment settlement integrates via verified backend payment provider webhooks.',
  },
  {
    q: 'What happens when a client and freelancer disagree on a deliverable?',
    a: 'Either party can open an evidence-based dispute tied to a specific milestone. FairWork aggregates the original signed agreement, submission files, revision history, and communication logs for structured administrative review.',
  },
];

type PreviewTab = 'milestones' | 'deliverable' | 'dispute';

export function LandingPage() {
  const [activePreview, setActivePreview] = useState<PreviewTab>('milestones');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-sm font-semibold text-[#2563EB]">
                FairWork · Trust. Track. Deliver. Get Paid.
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#0F172A] text-balance sm:text-5xl">
                Freelance Projects Deserve Better Accountability.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
                Manage milestones, track progress, protect payments, and build trust between
                clients and freelancers.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-slate-50"
                >
                  <span>Explore Features</span>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#E2E8F0] pt-6 text-xs font-medium text-[#64748B]">
                <span>Structured milestone agreements</span>
                <span aria-hidden="true">·</span>
                <span>Timestamped deliverable sign-offs</span>
                <span aria-hidden="true">·</span>
                <span>Evidence-backed dispute audit logs</span>
              </div>
            </div>

            {/* Interactive Dashboard Preview Mockup */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-[#64748B]">
                      Project Agreement · Northstar Analytics v2
                    </p>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      Maya Lin (Client) &amp; Devon Brooks (Freelancer)
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                    {(
                      [
                        { id: 'milestones', label: 'Milestones' },
                        { id: 'deliverable', label: 'Review' },
                        { id: 'dispute', label: 'Audit Log' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePreview(tab.id)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                          activePreview === tab.id
                            ? 'bg-white text-[#0F172A] shadow-xs'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {activePreview === 'milestones' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
                          <p className="text-[11px] text-[#64748B]">Project Budget</p>
                          <p className="mt-1 font-mono text-base font-bold text-[#0F172A] tabular-nums">
                            $14,500
                          </p>
                        </div>
                        <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
                          <p className="text-[11px] text-[#64748B]">Completion</p>
                          <p className="mt-1 font-mono text-base font-bold text-[#2563EB] tabular-nums">
                            77%
                          </p>
                        </div>
                        <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
                          <p className="text-[11px] text-[#64748B]">Revision Policy</p>
                          <p className="mt-1 text-xs font-semibold text-[#0F172A]">
                            2 Rounds / Milestone
                          </p>
                        </div>
                      </div>

                      <div className="divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0] bg-white">
                        {[
                          {
                            title: 'M1. Information Architecture & API Layer',
                            amount: '$4,500',
                            status: 'Paid',
                            tone: 'text-[#16A34A]',
                          },
                          {
                            title: 'M2. Interactive Charts & Data Grid',
                            amount: '$5,500',
                            status: 'Submitted',
                            tone: 'text-[#2563EB]',
                          },
                          {
                            title: 'M3. PDF Export & Handoff Docs',
                            amount: '$4,500',
                            status: 'In Progress',
                            tone: 'text-[#64748B]',
                          },
                        ].map((row) => (
                          <div
                            key={row.title}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                          >
                            <span className="font-medium text-[#0F172A] truncate">{row.title}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                                {row.amount}
                              </span>
                              <span className={`font-semibold ${row.tone}`}>{row.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePreview === 'deliverable' && (
                    <div className="space-y-3 rounded-lg border border-[#E2E8F0] bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#0F172A]">
                          Milestone 2 Deliverable Submitted
                        </span>
                        <span className="font-mono text-[11px] text-[#64748B] tabular-nums">
                          Nov 16, 2026
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#64748B]">
                        Staging build verified with 10,000-row grid virtualization and CSV export
                        matching acceptance criteria.
                      </p>
                      <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
                        <img
                          src="/src/assets/images/deliverable_preview_ui_1794911671129.jpg"
                          alt="Deliverable UI preview"
                          referrerPolicy="no-referrer"
                          className="h-36 w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <span className="rounded-md border border-[#E2E8F0] px-2.5 py-1 text-xs font-medium text-[#64748B]">
                          Request Revision
                        </span>
                        <span className="rounded-md bg-[#16A34A] px-2.5 py-1 text-xs font-medium text-white">
                          Approve Milestone
                        </span>
                      </div>
                    </div>
                  )}

                  {activePreview === 'dispute' && (
                    <div className="space-y-2.5 rounded-lg border border-[#E2E8F0] bg-white p-4">
                      <p className="text-xs font-semibold text-[#0F172A]">
                        Accountability &amp; Activity Record
                      </p>
                      <ul className="space-y-2 text-xs text-[#64748B]">
                        <li className="flex items-center justify-between gap-2">
                          <span>Agreement signed by both parties</span>
                          <span className="font-mono tabular-nums">Oct 01</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span>Milestone 1 approved by Maya Lin</span>
                          <span className="font-mono tabular-nums">Oct 20</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span>Milestone 2 deliverable uploaded</span>
                          <span className="font-mono tabular-nums">Nov 16</span>
                        </li>
                        <li className="flex items-center justify-between gap-2 text-[#16A34A] font-medium">
                          <span>Zero missed deadlines · 0 open disputes</span>
                          <span className="font-mono tabular-nums">On Track</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Explanation */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Why freelance projects break down after the first deposit
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#64748B]">
            Informal chats and vague invoices leave both clients and independent contractors
            exposed when expectations drift.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-[#0F172A]">
              What Clients Experience
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#64748B]">
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>
                  Freelancers become unresponsive or abandon work after receiving an upfront
                  advance.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
                <span>
                  No visibility into interim progress until a final deadline has already slipped.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" />
                <span>
                  Deliverables arrive incomplete without structured acceptance criteria to evaluate
                  against.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-[#0F172A]">
              What Freelancers Experience
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#64748B]">
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
                <span>
                  Clients delay feedback or deliverable sign-off for weeks without accountability.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>
                  Unbounded revision requests and shifting scope after work has been delivered.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" />
                <span>
                  Payment disputes without a unified record of submitted files and client approvals.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How FairWork Works / Core Features Asymmetric Bento */}
      <section id="features" className="border-y border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div id="how-it-works" className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Accountability built into every milestone
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#64748B]">
              FairWork replaces fragmented email threads with a single operational ledger shared
              by clients, freelancers, and platform compliance reviewers.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 md:col-span-2">
              <FileCheck2 className="h-5 w-5 text-[#2563EB]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-[#0F172A]">
                01. Structured Project Agreements &amp; Milestone Breakdown
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                Lock scope, objectives, deliverables, revision limits, and per-milestone budgets
                before a single line of work begins. Both parties confirm the exact agreement terms
                on record.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <Bell className="h-5 w-5 text-[#F59E0B]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-[#0F172A]">
                02. Deadline &amp; Inactivity Alerts
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                Automated reminders flag approaching milestone due dates and silent periods before
                projects stall.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-[#0F172A]">
                03. Deliverable Submission &amp; Approval
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                Freelancers upload files, screenshots, and progress notes. Clients approve with
                confirmation or request revisions with mandatory written reasons.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <CreditCard className="h-5 w-5 text-[#2563EB]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-[#0F172A]">
                04. Transparent Payment Status Tracking
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                Track every milestone payment state from Pending and Processing to Successful or
                Disputed with immutable transaction references.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <Scale className="h-5 w-5 text-[#0F172A]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-[#0F172A]">
                05. Evidence-Based Dispute Resolution
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                Administrators review the signed agreement, submission history, and uploaded
                evidence to record auditable resolutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Clients & Freelancers + Three-Step Workflow */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#2563EB]">
              <UserCheck className="h-4 w-4" />
              <span>Benefits for Clients</span>
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-[#0F172A]">
              Verify work before funds move forward
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[#64748B]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Break large budgets into verifiable, sequential milestone deliverables.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Spot stalled projects early with inactivity alerts and timeline logs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Keep all contracts, staging screenshots, and revision notes in one audit trail.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#16A34A]">
              <ShieldCheck className="h-4 w-4" />
              <span>Benefits for Freelancers</span>
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-[#0F172A]">
              Protect your scope, time, and completed work
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[#64748B]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Review clear milestone budgets and revision caps before accepting work.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Require explicit written reasons whenever a client requests revisions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Build a verified delivery track record across every completed milestone.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Three-Step Workflow */}
        <div className="mt-14 rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-10">
          <h2 className="font-display text-2xl font-bold text-[#0F172A]">
            Three steps to accountable project delivery
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01. Agree on Milestones',
                desc: 'Client defines project scope, milestone deliverables, amounts, deadlines, and revision policy. Freelancer reviews and accepts.',
              },
              {
                step: '02. Track & Submit Work',
                desc: 'Freelancer uploads deliverables, screenshots, and progress notes per milestone while deadlines are tracked automatically.',
              },
              {
                step: '03. Verify & Resolve Fairly',
                desc: 'Client approves deliverables or logs structured revision requests. Payment records update, and disputes use documented evidence.',
              },
            ].map((item) => (
              <div key={item.step} className="border-t border-[#E2E8F0] pt-4">
                <h3 className="font-display text-base font-semibold text-[#0F172A]">
                  {item.step}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-base font-semibold text-[#0F172A]">{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-lg font-bold text-[#0F172A]">
                Ready to run your next project with clear milestones?
              </h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Create a client or freelancer workspace, or explore the live role demos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/login"
                className="whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                Explore Demo Roles
              </Link>
              <Link
                to="/register"
                className="whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
