import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/src/components/common/Modal';
import { Milestone } from '@/src/types';

const milestoneFormSchema = z.object({
  title: z.string().min(3, 'Milestone title is required'),
  description: z.string().min(8, 'Provide a clear deliverable description'),
  amount: z.number({ message: 'Enter a valid amount' }).min(50, 'Amount must be at least $50'),
  dueDate: z.string().min(1, 'Due date is required'),
  deliverableLabel: z.string().min(2, 'Deliverable label is required'),
  acceptanceCriteriaText: z.string().min(4, 'Add at least one acceptance criterion'),
});

type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

interface MilestoneFormModalProps {
  open: boolean;
  onClose: () => void;
  existingMilestone?: Milestone | null;
  onSave: (data: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    deliverableLabel: string;
    acceptanceCriteria: string[];
  }) => void;
}

export function MilestoneFormModal({
  open,
  onClose,
  existingMilestone,
  onSave,
}: MilestoneFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 2000,
      dueDate: '2026-12-10',
      deliverableLabel: '',
      acceptanceCriteriaText: '',
    },
  });

  useEffect(() => {
    if (existingMilestone) {
      reset({
        title: existingMilestone.title,
        description: existingMilestone.description,
        amount: existingMilestone.amount,
        dueDate: existingMilestone.dueDate,
        deliverableLabel: existingMilestone.deliverableLabel,
        acceptanceCriteriaText: existingMilestone.acceptanceCriteria.join('\n'),
      });
    } else {
      reset({
        title: '',
        description: '',
        amount: 2000,
        dueDate: '2026-12-10',
        deliverableLabel: '',
        acceptanceCriteriaText: '',
      });
    }
  }, [existingMilestone, reset, open]);

  const onSubmit = handleSubmit((values) => {
    onSave({
      title: values.title,
      description: values.description,
      amount: Number(values.amount),
      dueDate: values.dueDate,
      deliverableLabel: values.deliverableLabel,
      acceptanceCriteria: values.acceptanceCriteriaText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
    });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
      subtitle="Define clear acceptance criteria, payment amount, and due date."
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
          >
            {existingMilestone ? 'Save Changes' : 'Create Milestone'}
          </button>
        </>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0F172A]">Milestone Title</label>
          <input
            {...register('title')}
            placeholder="e.g., API Integration & Unit Tests"
            className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-[#DC2626]">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F172A]">
              Payment Amount ($)
            </label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 font-mono text-sm tabular-nums focus:border-[#2563EB] focus:outline-none"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.amount.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F172A]">Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0F172A]">
            Expected Deliverable
          </label>
          <input
            {...register('deliverableLabel')}
            placeholder="e.g., Verified Staging Build & Test Report"
            className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm focus:border-[#2563EB] focus:outline-none"
          />
          {errors.deliverableLabel && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.deliverableLabel.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0F172A]">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Detailed scope of work for this milestone..."
            className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0F172A]">
            Acceptance Criteria (one per line)
          </label>
          <textarea
            {...register('acceptanceCriteriaText')}
            rows={3}
            placeholder="Responsive layout tested at 375px and 1440px&#10;All unit tests passing"
            className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
          />
          {errors.acceptanceCriteriaText && (
            <p className="mt-1 text-xs text-[#DC2626]">
              {errors.acceptanceCriteriaText.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
