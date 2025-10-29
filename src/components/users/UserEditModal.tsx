import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { User } from '@/types';

const userEditSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  isActive: z.boolean(),
  isVerified: z.boolean(),
});

type UserEditForm = z.infer<typeof userEditSchema>;

interface UserEditModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<User>) => void;
  loading?: boolean;
}

export function UserEditModal({ user, open, onOpenChange, onSave, loading }: UserEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      isActive: true,
      isVerified: false,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isActive: user.isActive,
        isVerified: user.isVerified,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserEditForm) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await onSave(user._id, data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
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
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and account status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <Input
                {...register('firstName')}
              />
              {errors.firstName?.message && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <Input
                {...register('lastName')}
              />
              {errors.lastName?.message && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Status</label>
                <Select
                  {...register('isActive', { setValueAs: (value) => value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Suspended</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Verification Status</label>
                <Select
                  {...register('isVerified', { setValueAs: (value) => value === 'true' })}
                >
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
