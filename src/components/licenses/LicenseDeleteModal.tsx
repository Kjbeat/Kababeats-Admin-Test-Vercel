import React from "react";
import { AlertTriangle } from "lucide-react";
import { License } from "@/types/license";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LicenseDeleteModalProps {
  license: License;
  onConfirm: (license: License) => void;
  onClose: () => void;
}

export function LicenseDeleteModal({ license, onConfirm, onClose }: LicenseDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm(license);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Delete License</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the license "
            <span className="font-semibold">{license.name}</span>"?  
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Warning</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Deleting this license will:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Remove this license from all available purchase options</li>
                  <li>Impact beats or users associated with this license</li>
                  <li>Permanently delete all license configuration data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete License
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
