import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { License } from "@/types/license";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateLicense, useUpdateLicense } from "@/hooks/useLicenses";

interface LicenseEditModalProps {
  license: License | null;
  onSave: (license: License) => void;
  onClose: () => void;
}

export function LicenseEditModal({
  license,
  onSave,
  onClose,
}: LicenseEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "MP3" as License["type"],
    description: "",
    price: 0,
    features: [""],
    usageRights: "",
    restrictions: [""],
    isActive: true,
    sortOrder: 0,
    territory: "worldwide" as License["territory"],
    streamLimit: -1,
    saleLimit: -1,
    distribution: true,
    videos: true,
    radio: true,
    live: true,
  });

  const [customTypeMode, setCustomTypeMode] = useState(false);

  const createLicenseMutation = useCreateLicense();
  const updateLicenseMutation = useUpdateLicense();
  const isEditing = !!license?._id;

  const licenseTypes = ["FREE", "MP3", "WAV", "STEMS", "EXCLUSIVE"];
  const territories = [
    "worldwide",
    "us-only",
    "north-america",
    "europe",
    "custom",
  ];

  useEffect(() => {
    if (license) {
      setFormData({
        name: license.name,
        type: license.type,
        description: license.description,
        price: license.price,
        features: license.features?.length ? license.features : [""],
        usageRights: license.usageRights || "",
        restrictions: license.restrictions?.length
          ? license.restrictions
          : [""],
        isActive: license.isActive,
        sortOrder: license.sortOrder || 0,

        territory: license.territory || "worldwide",
        streamLimit: license.streamLimit ?? -1,
        saleLimit: license.saleLimit ?? -1,
        distribution: license.distribution ?? true,
        videos: license.videos ?? true,
        radio: license.radio ?? true,
        live: license.live ?? true,
      });
    }
  }, [license]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: "features" | "restrictions",
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      [field]: updated,
    }));
  };

  const addArrayItem = (field: "features" | "restrictions") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (
    field: "features" | "restrictions",
    index: number
  ) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim(),
      price: formData.price,
      features: formData.features.filter((f) => f.trim() !== ""),
      usageRights: formData.usageRights.trim(),
      restrictions: formData.restrictions.filter((r) => r.trim() !== ""),
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,

      territory: formData.territory,
      streamLimit: formData.streamLimit,
      saleLimit: formData.saleLimit,
      distribution: formData.distribution,
      videos: formData.videos,
      radio: formData.radio,
      live: formData.live,
    };

    try {
      if (isEditing && license?._id) {
        await updateLicenseMutation.mutateAsync({ id: license._id, data });
      } else {
        await createLicenseMutation.mutateAsync(data);
      }
      onSave(license!);
    } catch (error) {
      // handled in mutation hooks
    }
  };

  if (!licenseTypes.includes(formData.type) && formData.type !== "") {
    licenseTypes.push(formData.type);
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit License" : "Create License"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">License Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>

              {!customTypeMode ? (
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    if (value === "__custom__") {
                      setCustomTypeMode(true);
                      handleInputChange("type", "");
                    } else {
                      handleInputChange("type", value as License["type"]);
                    }
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent>
                    {licenseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Custom Type...</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    id="customType"
                    placeholder="Enter new type (e.g. PREMIUM)"
                    value={formData.type}
                    onChange={(e) =>
                      handleInputChange("type", e.target.value.toUpperCase())
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCustomTypeMode(false);
                      handleInputChange("type", "MP3");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Price & Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleInputChange("sortOrder", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>

          {/* Territory */}
          <div>
            <Label>Territory</Label>
            <Select
              value={formData.territory}
              onValueChange={(value) =>
                handleInputChange("territory", value as License["territory"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select territory" />
              </SelectTrigger>
              <SelectContent>
                {territories.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stream & Sale Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stream Limit</Label>
              <Input
                type="number"
                value={formData.streamLimit}
                onChange={(e) =>
                  handleInputChange(
                    "streamLimit",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="-1 for unlimited"
              />
            </div>
            <div>
              <Label>Sale Limit</Label>
              <Input
                type="number"
                value={formData.saleLimit}
                onChange={(e) =>
                  handleInputChange("saleLimit", parseInt(e.target.value) || 0)
                }
                placeholder="-1 for unlimited"
              />
            </div>
          </div>

          {/* Usage Options */}
          <div>
            <Label>Allowed Uses</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {["distribution", "videos", "radio", "live"].map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Switch
                    checked={
                      formData[field as keyof typeof formData] as boolean
                    }
                    onCheckedChange={(checked) =>
                      handleInputChange(field, checked)
                    }
                  />
                  <Label className="capitalize">{field}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            {formData.features.map((feature, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <Input
                  value={feature}
                  onChange={(e) =>
                    handleArrayChange("features", i, e.target.value)
                  }
                  placeholder="Add a feature"
                />
                {formData.features.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem("features", i)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("features")}
            >
              Add Feature
            </Button>
          </div>

          {/* Usage Rights */}
          <div>
            <Label>Usage Rights</Label>
            <Textarea
              value={formData.usageRights}
              onChange={(e) => handleInputChange("usageRights", e.target.value)}
              placeholder="Describe allowed usage..."
              rows={3}
            />
          </div>

          {/* Restrictions */}
          <div>
            <Label>Restrictions</Label>
            {formData.restrictions.map((restriction, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <Input
                  value={restriction}
                  onChange={(e) =>
                    handleArrayChange("restrictions", i, e.target.value)
                  }
                  placeholder="Add a restriction"
                />
                {formData.restrictions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem("restrictions", i)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("restrictions")}
            >
              Add Restriction
            </Button>
          </div>

          {/* Active Switch */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Active License</Label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={
                createLicenseMutation.isPending ||
                updateLicenseMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createLicenseMutation.isPending ||
                updateLicenseMutation.isPending
              }
            >
              {createLicenseMutation.isPending ||
              updateLicenseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update License"
              ) : (
                "Create License"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
