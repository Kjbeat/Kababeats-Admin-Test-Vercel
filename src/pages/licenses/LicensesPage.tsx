import React, { useState } from "react";
import { Plus, Edit, Copy, Trash2, RefreshCw } from "lucide-react";
import { License } from "@/types/license";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { LicenseEditModal } from "@/components/licenses/LicenseEditModal";
import { LicenseDeleteModal } from "@/components/licenses/LicenseDeleteModal";
import {
  useLicenses,
  useDeleteLicense,
  useToggleLicense,
} from "@/hooks/useLicenses";

export function LicensesPage() {
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<License | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  // API hooks
  const { data: licenses = [], isLoading, error, refetch } = useLicenses();
  const deleteLicenseMutation = useDeleteLicense();
  const toggleLicenseMutation = useToggleLicense();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Licenses
          </h3>
          <p className="text-gray-600 mb-4">Failed to load licenses</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleActive = async (license: License) => {
    try {
      await toggleLicenseMutation.mutateAsync({
        id: license._id,
        isActive: !license.isActive,
      });
    } catch (error) {
      // handled in hook
    }
  };

  const handleEdit = (license: License) => setEditingLicense(license);
  const handleDelete = (license: License) => setDeletingLicense(license);

  const handleCopy = (license: License) => {
    const newLicense = {
      ...license,
      _id: "",
      name: `${license.name} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingLicense(newLicense);
  };

  const handleSave = () => {
    setEditingLicense(null);
    setIsCreateModalOpen(false);
  };

  const handleDeleteConfirm = async (license: License) => {
    try {
      await deleteLicenseMutation.mutateAsync(license._id);
      setDeletingLicense(null);
    } catch (error) {
      // handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Licenses</h1>
          <p className="text-gray-600">Manage beat licenses and pricing</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add License
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {Array.isArray(licenses) ? (
          licenses.map((license) => (
            <Card key={license._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{license.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Type:{" "}
                      <span className="uppercase font-mono">
                        {license.type}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={license.isActive ? "default" : "secondary"}>
                      {license.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(license)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(license)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(license)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* VISIBILITY */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Visibility</span>
                  <Switch
                    checked={license.isActive}
                    onCheckedChange={() => handleToggleActive(license)}
                  />
                </div>

                {/* BASIC INFO */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">
                      {license.type === "FREE" ? "Free" : `$${license.price}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sort Order:</span>
                    <span className="font-medium">{license.sortOrder}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Territory:</span>
                    <span className="font-medium capitalize">
                      {license.territory}
                    </span>
                  </div>
                </div>

                {/* LIMITS */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Stream Limit:</span>{" "}
                    <span className="font-medium">
                      {license.streamLimit === -1
                        ? "Unlimited"
                        : license.streamLimit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sale Limit:</span>{" "}
                    <span className="font-medium">
                      {license.saleLimit === -1
                        ? "Unlimited"
                        : license.saleLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* RIGHTS */}
                <div className="flex flex-wrap gap-2 text-xs mt-2">
                  {license.distribution && <Badge>Distribution</Badge>}
                  {license.videos && <Badge>Videos</Badge>}
                  {license.radio && <Badge>Radio</Badge>}
                  {license.live && <Badge>Live</Badge>}
                </div>

                {/* FEATURES */}
                {license.features && license.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {license.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* RESTRICTIONS */}
                {license.restrictions && license.restrictions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Restrictions:</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {license.restrictions.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-red-600">No licenses found</p>
        )}
      </div>

      {/* Modals */}
      {editingLicense && (
        <LicenseEditModal
          license={editingLicense}
          onSave={handleSave}
          onClose={() => setEditingLicense(null)}
        />
      )}

      {deletingLicense && (
        <LicenseDeleteModal
          license={deletingLicense}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingLicense(null)}
        />
      )}

      {isCreateModalOpen && (
        <LicenseEditModal
          license={null}
          onSave={handleSave}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}
