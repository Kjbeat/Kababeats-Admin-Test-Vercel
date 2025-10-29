import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types';

const suspendSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
});

type SuspendForm = z.infer<typeof suspendSchema>;

interface UserSuspendModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuspend: (id: string, reason: string) => void;
  loading?: boolean;
}

export function UserSuspendModal({ user, open, onOpenChange, onSuspend, loading }: UserSuspendModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuspendForm>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = async (data: SuspendForm) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await onSuspend(user._id, data.reason);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Suspend User</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to suspend <strong>{user?.username}</strong>? 
            This will prevent them from accessing their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Suspension</label>
              <Input
                placeholder="Enter the reason for suspending this user..."
                {...register('reason')}
              />
              {errors.reason?.message && (
                <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                This reason will be logged and may be shared with the user.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive" 
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Suspending...' : 'Suspend User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
