import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/src/components/common/Modal';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { formatCurrency } from '@/src/utils/formatters';

const milestoneSchema = z.object({
  title: z.string().min(3, 'Milestone title is required'),
  description: z.string().min(6, 'Describe what will be delivered'),
  amount: z.number({ message: 'Enter a valid amount' }).min(50, 'Minimum milestone amount is $50'),
  dueDate: z.string().min(1, 'Due date is required'),
  deliverableLabel: z.string().min(2, 'Deliverable label is required'),
  acceptanceCriteriaText: z.string().min(3, 'Add at least one acceptance criterion'),
});

const createProjectSchema = z.object({
  title: z.string().min(4, 'Project title must be at least 4 characters'),
  category: z.string().min(2, 'Select a category'),
  freelancerName: z.string().min(2, 'Freelancer name is required'),
  freelancerEmail: z.string().email('Enter a valid freelancer email'),
  summary: z.string().min(10, 'Provide a clear project summary'),
  scope: z.string().min(15, 'Outline the agreed scope and deliverables'),
  objectivesText: z.string().min(5, 'List at least one objective'),
  deliverablesSummary: z.string().min(5, 'Describe final deliverables'),
  deadline: z.string().min(1, 'Project deadline is required'),
  revisionPolicy: z.string().min(10, 'Specify a clear revision policy'),
  milestones: z.array(milestoneSchema).min(1, 'Add at least one milestone'),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
}

const STEPS = ['Scope & Freelancer', 'Milestone Breakdown', 'Policy & Send'];

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const { currentUser } = useAuth();
  const { createProject, users } = useAppData();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);

  const freelancers = users.filter((u) => u.role === 'freelancer' && u.status === 'Active');

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      category: 'Web Application',
      freelancerName: freelancers[0]?.name || 'Devon Brooks',
      freelancerEmail: freelancers[0]?.email || 'devon@brooksdigital.dev',
      summary: '',
      scope: '',
      objectivesText: '',
      deliverablesSummary: '',
      deadline: '2026-12-20',
      revisionPolicy: 'Up to 2 structured revision rounds per milestone within 5 business days of submission.',
      milestones: [
        {
          title: 'Discovery & Architecture Blueprint',
          description: 'Deliver technical specification and initial repository setup.',
          amount: 2500,
          dueDate: '2026-12-01',
          deliverableLabel: 'Architecture Spec & Setup PR',
          acceptanceCriteriaText: 'Specification signed off by client; Repo builds cleanly',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });

  const watchedMilestones = watch('milestones');
  const totalBudget = watchedMilestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const handleNextStep = async () => {
    if (step === 0) {
      const valid = await trigger([
        'title',
        'category',
        'freelancerName',
        'freelancerEmail',
        'summary',
        'scope',
        'objectivesText',
        'deliverablesSummary',
        'deadline',
      ]);
      if (valid) setStep(1);
    } else if (step === 1) {
      const valid = await trigger(['milestones']);
      if (valid) setStep(2);
    }
  };

  const submitForm = (asDraft: boolean) =>
    handleSubmit((values) => {
      if (!currentUser) return;
      const matchedFreelancer = freelancers.find(
        (f) => f.email.toLowerCase() === values.freelancerEmail.toLowerCase()
      );
      const created = createProject({
        title: values.title,
        category: values.category,
        summary: values.summary,
        scope: values.scope,
        objectives: values.objectivesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        deliverablesSummary: values.deliverablesSummary,
        revisionPolicy: values.revisionPolicy,
        client: currentUser,
        freelancerName: values.freelancerName,
        freelancerEmail: values.freelancerEmail,
        freelancerId: matchedFreelancer?.id,
        deadline: values.deadline,
        milestones: values.milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amount: Number(m.amount),
          dueDate: m.dueDate,
          deliverableLabel: m.deliverableLabel,
          acceptanceCriteria: m.acceptanceCriteriaText
            .split(';')
            .map((c) => c.trim())
            .filter(Boolean),
        })),
        asDraft,
      });

      addToast({
        variant: 'success',
        title: asDraft ? 'Project saved as draft' : 'Project invitation sent',
        description: asDraft
          ? `${created.title} is saved in your drafts.`
          : `Agreement sent to ${created.freelancerName} for review.`,
      });
      reset();
      setStep(0);
      onClose();
      onCreated?.(created.id);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Project Agreement"
      subtitle="Structure scope, milestones, deadlines, and revision rules before work starts."
      maxWidth="xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={submitForm(true)}
                  className="whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={submitForm(false)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
                >
                  <Check className="h-4 w-4" />
                  <span>Send Invitation</span>
                </button>
              </>
            )}
          </div>
        </div>
      }
    >
      {/* Step Indicator */}
      <div className="mb-6 grid grid-cols-3 gap-2 border-b border-[#E2E8F0] pb-4">
        {STEPS.map((label, idx) => {
          const active = idx === step;
          const done = idx < step;
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                  done
                    ? 'bg-[#16A34A] text-white'
                    : active
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-slate-100 text-[#64748B]'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <span
                className={`truncate text-xs font-medium ${
                  active || done ? 'text-[#0F172A]' : 'text-[#64748B]'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <form className="space-y-4">
        {step === 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                  Project Title
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g., Customer Onboarding Portal"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Web Application">Web Application</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Backend Engineering">Backend Engineering</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Engineering">Data Engineering</option>
                  <option value="Documentation & UX">Documentation & UX</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0F172A]">
                  Assign Freelancer
                </span>
                <div className="flex flex-wrap gap-2">
                  {freelancers.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setValue('freelancerName', f.name);
                        setValue('freelancerEmail', f.email);
                      }}
                      className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-medium text-[#0F172A] hover:border-[#2563EB]"
                    >
                      Use {f.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748B]">
                    Freelancer Name
                  </label>
                  <input
                    {...register('freelancerName')}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                  {errors.freelancerName && (
                    <p className="mt-1 text-xs text-[#DC2626]">{errors.freelancerName.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748B]">
                    Freelancer Email
                  </label>
                  <input
                    {...register('freelancerEmail')}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                  {errors.freelancerEmail && (
                    <p className="mt-1 text-xs text-[#DC2626]">{errors.freelancerEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                Executive Summary
              </label>
              <input
                {...register('summary')}
                placeholder="Concise 1-2 sentence overview of the project goal"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
              />
              {errors.summary && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.summary.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                Agreed Project Scope
              </label>
              <textarea
                {...register('scope')}
                rows={3}
                placeholder="Define exact boundaries, integrations, and what is included in the agreement..."
                className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
              />
              {errors.scope && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.scope.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                  Key Objectives (one per line)
                </label>
                <textarea
                  {...register('objectivesText')}
                  rows={3}
                  placeholder="Ship responsive checkout&#10;Pass WCAG AA audit"
                  className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
                {errors.objectivesText && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.objectivesText.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                    Final Deliverables Summary
                  </label>
                  <input
                    {...register('deliverablesSummary')}
                    placeholder="Source repo, Figma library, docs"
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                  {errors.deliverablesSummary && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {errors.deliverablesSummary.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                    Target Project Deadline
                  </label>
                  <input
                    type="date"
                    {...register('deadline')}
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                  {errors.deadline && (
                    <p className="mt-1 text-xs text-[#DC2626]">{errors.deadline.message}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Milestone Schedule ({fields.length})
                </p>
                <p className="text-xs text-[#64748B]">
                  Total calculated budget:{' '}
                  <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                    {formatCurrency(totalBudget)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  append({
                    title: '',
                    description: '',
                    amount: 1500,
                    dueDate: '2026-12-15',
                    deliverableLabel: '',
                    acceptanceCriteriaText: '',
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Milestone {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#DC2626] hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <input
                      {...register(`milestones.${index}.title`)}
                      placeholder="Milestone title"
                      className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                    />
                    {errors.milestones?.[index]?.title && (
                      <p className="mt-1 text-xs text-[#DC2626]">
                        {errors.milestones[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      {...register(`milestones.${index}.amount`, { valueAsNumber: true })}
                      placeholder="Amount ($)"
                      className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 font-mono text-sm tabular-nums focus:border-[#2563EB] focus:outline-none"
                    />
                    {errors.milestones?.[index]?.amount && (
                      <p className="mt-1 text-xs text-[#DC2626]">
                        {errors.milestones[index]?.amount?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <input
                      {...register(`milestones.${index}.deliverableLabel`)}
                      placeholder="Deliverable name (e.g., Staging Build)"
                      className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      {...register(`milestones.${index}.dueDate`)}
                      className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                </div>

                <textarea
                  {...register(`milestones.${index}.description`)}
                  rows={2}
                  placeholder="Milestone description"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-sm focus:border-[#2563EB] focus:outline-none"
                />

                <input
                  {...register(`milestones.${index}.acceptanceCriteriaText`)}
                  placeholder="Acceptance criteria (separate multiple items with semicolons ;)"
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0F172A]">
                Revision & Review Policy
              </label>
              <textarea
                {...register('revisionPolicy')}
                rows={3}
                className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
              />
              {errors.revisionPolicy && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.revisionPolicy.message}</p>
              )}
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
              <h4 className="text-sm font-semibold text-[#0F172A]">Agreement Summary</h4>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-xs text-[#64748B]">Project Title</span>
                  <p className="font-medium text-[#0F172A]">{watch('title') || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-[#64748B]">Freelancer</span>
                  <p className="font-medium text-[#0F172A]">
                    {watch('freelancerName')} ({watch('freelancerEmail')})
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[#64748B]">Total Structured Budget</span>
                  <p className="font-mono font-semibold text-[#0F172A] tabular-nums">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[#64748B]">Target Deadline</span>
                  <p className="font-medium text-[#0F172A]">{watch('deadline')}</p>
                </div>
              </div>
              <div className="border-t border-[#E2E8F0] pt-3">
                <span className="text-xs text-[#64748B]">Milestones Included</span>
                <ul className="mt-1.5 space-y-1">
                  {watchedMilestones.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-xs text-[#0F172A]"
                    >
                      <span>
                        {i + 1}. {m.title} ({m.dueDate})
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatCurrency(Number(m.amount) || 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
