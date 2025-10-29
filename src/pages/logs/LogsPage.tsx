import React from 'react';
import { FileSearch } from 'lucide-react';

export function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          View system logs, admin actions, and audit trails
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <FileSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Audit Logs</h3>
          <p className="mt-1 text-sm text-gray-500">
            This module is under development. You'll be able to view audit logs here.
          </p>
        </div>
      </div>
    </div>
  );
}
