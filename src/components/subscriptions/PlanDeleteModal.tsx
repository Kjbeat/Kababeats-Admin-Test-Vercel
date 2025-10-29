import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PlanDeleteModalProps {
  plan: SubscriptionPlan;
  onConfirm: (plan: SubscriptionPlan) => void;
  onClose: () => void;
}

export function PlanDeleteModal({ plan, onConfirm, onClose }: PlanDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm(plan);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Delete Subscription Plan</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the "{plan.name}" plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Warning
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Deleting this plan will:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Remove the plan from your subscription options</li>
                  <li>Affect any users currently subscribed to this plan</li>
                  <li>Permanently delete all plan configuration data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
