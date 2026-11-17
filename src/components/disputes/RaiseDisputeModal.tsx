import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/src/components/common/Modal';
import {
  FileUploadDropzone,
  UploadedFilePreview,
} from '@/src/components/common/FileUploadDropzone';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';
import { useToast } from '@/src/context/ToastContext';
import { DisputeCategory } from '@/src/types';

const disputeSchema = z.object({
  projectId: z.string().min(1, 'Select a project'),
  milestoneId: z.string().min(1, 'Select a milestone'),
  category: z.enum([
    'Freelancer stopped responding',
    'Missed deadline',
    'Incomplete deliverables',
    'Payment not received',
    'Client not responding',
    'Scope disagreement',
    'Other',
  ]),
  description: z
    .string()
    .min(20, 'Please provide at least 20 characters of factual detail and timeline context'),
});

type DisputeFormValues = z.infer<typeof disputeSchema>;

interface RaiseDisputeModalProps {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

const CATEGORIES: DisputeCategory[] = [
  'Freelancer stopped responding',
  'Missed deadline',
  'Incomplete deliverables',
  'Payment not received',
  'Client not responding',
  'Scope disagreement',
  'Other',
];

export function RaiseDisputeModal({
  open,
  onClose,
  defaultProjectId,
}: RaiseDisputeModalProps) {
  const { currentUser } = useAuth();
  const { projects, milestones, raiseDispute } = useAppData();
  const { addToast } = useToast();
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedFilePreview[]>([]);

  const eligibleProjects = projects.filter((p) => p.status !== 'Cancelled');

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      projectId: defaultProjectId || eligibleProjects[0]?.id || '',
      milestoneId: '',
      category: 'Freelancer stopped responding',
      description: '',
    },
  });

  const selectedProjectId = watch('projectId');
  const projectMilestones = milestones.filter((m) => m.projectId === selectedProjectId);

  const onSubmit = handleSubmit((values) => {
    if (!currentUser) return;
    const project = projects.find((p) => p.id === values.projectId);
    const milestone = milestones.find((m) => m.id === values.milestoneId);
    if (!project || !milestone) return;

    const created = raiseDispute({
      project,
      milestone,
      user: currentUser,
      category: values.category,
      description: values.description,
      evidenceFileNames: evidenceFiles.map((f) => f.name),
    });

    addToast({
      variant: 'warning',
      title: `Dispute ${created.id} submitted`,
      description: 'Project status updated to Disputed and assigned for evidence review.',
    });
    setEvidenceFiles([]);
    reset();
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Raise Evidence-Based Dispute"
      subtitle="Attach factual timeline context and supporting files for FairWork compliance review."
      maxWidth="lg"
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
            className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Submit Dispute
          </button>
        </>
      }
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F172A]">Project</label>
            <select
              {...register('projectId')}
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
            >
              <option value="">Select project...</option>
              {eligibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.projectId.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F172A]">Milestone</label>
            <select
              {...register('milestoneId')}
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
            >
              <option value="">Select milestone...</option>
              {projectMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  M{m.order}: {m.title}
                </option>
              ))}
            </select>
            {errors.milestoneId && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.milestoneId.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0F172A]">
            Dispute Category
          </label>
          <select
            {...register('category')}
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[#2563EB] focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#0F172A]">
            Detailed Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Summarize missed deadlines, unresponsive dates, or specific discrepancies against the signed scope..."
            className="w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2563EB] focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.description.message}</p>
          )}
        </div>

        <FileUploadDropzone
          label="Supporting Evidence Files (Optional)"
          files={evidenceFiles}
          onChange={setEvidenceFiles}
          helperText="Attach message transcripts, commit logs, or exported screenshots."
        />
      </form>
    </Modal>
  );
}
