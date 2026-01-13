"use client";

import { useEffect, useState, useRef } from "react";
import {
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  Clock,
  Palette,
  Star,
  StarOff,
} from "lucide-react";
import Image from "next/image";

interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  primaryPhone: string;
  emergencyPhone?: string;
  faxNumber?: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  heroImageUrl?: string;
  bookingUrl?: string;
  patientIntakeUrl?: string;
  businessHours: string;
  timezone: string;
  isActive: boolean;
  openingSoon: boolean;
  featured: boolean;
  acceptingNewPatients: boolean;
  announcementEnabled: boolean;
  announcementTitle?: string;
  announcementMessage?: string;
  announcementType: string;
  orderIndex: number;
  _count?: {
    services: number;
    teamMembers: number;
    faqs: number;
    blogPosts: number;
    uninsuredServices: number;
  };
}

type LocationFormData = Omit<Location, "id" | "orderIndex" | "_count">;

const emptyLocation: LocationFormData = {
  name: "",
  slug: "",
  address: "",
  city: "",
  province: "Ontario",
  postalCode: "",
  primaryPhone: "",
  emergencyPhone: "",
  faxNumber: "",
  email: "",
  primaryColor: "#2563eb",
  secondaryColor: "#1e40af",
  heroImageUrl: "",
  bookingUrl: "",
  patientIntakeUrl: "",
  businessHours: "Mon-Fri: 9:00 AM - 5:00 PM",
  timezone: "America/Toronto",
  isActive: true,
  openingSoon: false,
  featured: false,
  acceptingNewPatients: true,
  announcementEnabled: false,
  announcementTitle: "",
  announcementMessage: "",
  announcementType: "info",
};

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<LocationFormData>(emptyLocation);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "branding" | "settings">("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations");
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations || []);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
    setLoading(false);
  }

  function resetForm() {
    setForm(emptyLocation);
    setEditing(null);
    setFormMode("add");
    setError(null);
    setActiveTab("basic");
  }

  function handleEdit(location: Location) {
    setEditing(location);
    setForm({
      name: location.name,
      slug: location.slug,
      address: location.address,
      city: location.city,
      province: location.province,
      postalCode: location.postalCode,
      primaryPhone: location.primaryPhone,
      emergencyPhone: location.emergencyPhone || "",
      faxNumber: location.faxNumber || "",
      email: location.email,
      primaryColor: location.primaryColor,
      secondaryColor: location.secondaryColor,
      heroImageUrl: location.heroImageUrl || "",
      bookingUrl: location.bookingUrl || "",
      patientIntakeUrl: location.patientIntakeUrl || "",
      businessHours: location.businessHours,
      timezone: location.timezone,
      isActive: location.isActive,
      openingSoon: location.openingSoon,
      featured: location.featured,
      acceptingNewPatients: location.acceptingNewPatients,
      announcementEnabled: location.announcementEnabled,
      announcementTitle: location.announcementTitle || "",
      announcementMessage: location.announcementMessage || "",
      announcementType: location.announcementType,
    });
    setFormMode("edit");
  }

  async function handleDelete(id: string) {
    const location = locations.find((l) => l.id === id);
    if (!location) return;

    const totalContent =
      (location._count?.services || 0) +
      (location._count?.teamMembers || 0) +
      (location._count?.faqs || 0) +
      (location._count?.blogPosts || 0) +
      (location._count?.uninsuredServices || 0);

    if (totalContent > 0) {
      alert(
        `Cannot delete "${location.name}" because it has ${totalContent} associated content item(s). Please reassign or delete the content first.`
      );
      return;
    }

    if (!confirm(`Delete location "${location.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/admin/locations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to delete location");
        return;
      }
      fetchLocations();
    } catch (err) {
      console.error("Error deleting location:", err);
      alert("Failed to delete location");
    }
  }

  async function handleActiveToggle(location: Location) {
    await fetch("/api/admin/locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: location.id, isActive: !location.isActive }),
    });
    fetchLocations();
  }

  async function handleFeaturedToggle(location: Location) {
    await fetch("/api/admin/locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: location.id, featured: !location.featured }),
    });
    fetchLocations();
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = locations.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= locations.length) return;

    const reordered = [...locations];
    const temp = reordered[idx];
    reordered[idx] = reordered[swapIdx];
    reordered[swapIdx] = temp;
    reordered.forEach((l, i) => (l.orderIndex = i));
    setLocations(reordered);

    await Promise.all(
      reordered.map((l) =>
        fetch("/api/admin/locations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: l.id, orderIndex: l.orderIndex }),
        })
      )
    );
    fetchLocations();
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.slug || !form.address || !form.city || !form.postalCode) {
      setError("Name, slug, address, city, and postal code are required.");
      setActiveTab("basic");
      return;
    }

    if (!form.primaryPhone || !form.email) {
      setError("Phone and email are required.");
      setActiveTab("contact");
      return;
    }

    if (!form.businessHours) {
      setError("Business hours are required.");
      setActiveTab("settings");
      return;
    }

    try {
      if (formMode === "add") {
        const res = await fetch("/api/admin/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            orderIndex: locations.length,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Failed to create location");
          return;
        }
      } else if (editing) {
        const res = await fetch("/api/admin/locations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            ...form,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Failed to update location");
          return;
        }
      }
      resetForm();
      fetchLocations();
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file must be less than 10MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", "location");
      formData.append("entityId", editing?.id || "new-location");

      const res = await fetch("/api/uploads/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setForm((f) => ({ ...f, heroImageUrl: data.data.secure_url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemoveImage() {
    setForm((f) => ({ ...f, heroImageUrl: "" }));
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: MapPin },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "settings", label: "Settings", icon: Clock },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Manage Locations</h1>

      {/* Add/Edit Form */}
      <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {formMode === "add" ? "Add New Location" : `Edit Location: ${editing?.name}`}
        </h2>

        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={18} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Location Name *</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: formMode === "add" ? generateSlug(name) : f.slug,
                    }));
                  }}
                  placeholder="e.g., Ottawa Clinic"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">URL Slug *</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g., ottawa"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /{form.slug || "slug"}
                </p>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Street Address *</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g., Unit 216, 1980 Ogilvie Road"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">City *</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="e.g., Ottawa"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Province</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  placeholder="Ontario"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Postal Code *</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                  placeholder="e.g., K1J 9L3"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Primary Phone *</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.primaryPhone}
                  onChange={(e) => setForm((f) => ({ ...f, primaryPhone: e.target.value }))}
                  placeholder="e.g., (613) 555-0123"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g., ottawa@zenithmedical.ca"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Emergency Phone</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyPhone: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Fax Number</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.faxNumber}
                  onChange={(e) => setForm((f) => ({ ...f, faxNumber: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Booking URL</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.bookingUrl}
                  onChange={(e) => setForm((f) => ({ ...f, bookingUrl: e.target.value }))}
                  placeholder="https://booking.example.com"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Patient Intake URL</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.patientIntakeUrl}
                  onChange={(e) => setForm((f) => ({ ...f, patientIntakeUrl: e.target.value }))}
                  placeholder="https://intake.example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border rounded cursor-pointer"
                    value={form.primaryColor}
                    onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  />
                  <input
                    className="flex-1 border rounded px-3 py-2"
                    value={form.primaryColor}
                    onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border rounded cursor-pointer"
                    value={form.secondaryColor}
                    onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                  />
                  <input
                    className="flex-1 border rounded px-3 py-2"
                    value={form.secondaryColor}
                    onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="flex gap-4">
                <div
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  Primary Button
                </div>
                <div
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: form.secondaryColor }}
                >
                  Secondary Button
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div>
              <label className="block font-medium mb-1">Hero Image</label>
              {form.heroImageUrl ? (
                <div className="relative mb-3">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      src={form.heroImageUrl}
                      alt="Location hero"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="mb-3 w-full h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={48} className="mb-2" />
                  <p className="text-sm">No hero image</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="location-image-upload"
                />
                <label
                  htmlFor="location-image-upload"
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                    uploading
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  <Upload size={18} className="mr-2" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Business Hours *</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={form.businessHours}
                  onChange={(e) => setForm((f) => ({ ...f, businessHours: e.target.value }))}
                  placeholder="Mon-Fri: 9:00 AM - 5:00 PM"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Timezone</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                >
                  <option value="America/Toronto">Eastern Time (Toronto)</option>
                  <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                  <option value="America/Edmonton">Mountain Time (Edmonton)</option>
                  <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                  <option value="America/Halifax">Atlantic Time (Halifax)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <span>Active (visible on website)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.openingSoon}
                    onChange={(e) => setForm((f) => ({ ...f, openingSoon: e.target.checked }))}
                  />
                  <span>Opening Soon badge</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  <span>Featured location</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.acceptingNewPatients}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, acceptingNewPatients: e.target.checked }))
                    }
                  />
                  <span>Accepting new patients</span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.announcementEnabled}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, announcementEnabled: e.target.checked }))
                    }
                  />
                  <span>Show announcement</span>
                </label>

                {form.announcementEnabled && (
                  <>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={form.announcementTitle}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, announcementTitle: e.target.value }))
                      }
                      placeholder="Announcement title"
                    />
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      value={form.announcementMessage}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, announcementMessage: e.target.value }))
                      }
                      placeholder="Announcement message"
                      rows={2}
                    />
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={form.announcementType}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, announcementType: e.target.value }))
                      }
                    >
                      <option value="info">Info (blue)</option>
                      <option value="warning">Warning (yellow)</option>
                      <option value="success">Success (green)</option>
                      <option value="error">Error (red)</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 mt-6 pt-4 border-t">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
          >
            {formMode === "add" ? "Add Location" : "Save Changes"}
          </button>
          {formMode === "edit" && (
            <button
              type="button"
              className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Locations List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Locations</h2>
        {loading ? (
          <div>Loading...</div>
        ) : locations.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            <MapPin size={48} className="mx-auto mb-2 opacity-50" />
            <p>No locations found. Add your first location above.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3">Order</th>
                <th className="py-3">Location</th>
                <th className="py-3">City</th>
                <th className="py-3">Content</th>
                <th className="py-3">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location, idx) => (
                <tr key={location.id} className="border-t hover:bg-gray-50">
                  <td className="py-3">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleReorder(location.id, "up")}
                      className="mr-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      disabled={idx === locations.length - 1}
                      onClick={() => handleReorder(location.id, "down")}
                      className="text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: location.primaryColor }}
                      />
                      <div>
                        <div className="font-semibold">{location.name}</div>
                        <div className="text-xs text-gray-500">/{location.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{location.city}</td>
                  <td className="py-3">
                    <div className="text-xs text-gray-500">
                      {location._count?.services || 0} services,{" "}
                      {location._count?.teamMembers || 0} team,{" "}
                      {location._count?.faqs || 0} FAQs
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleActiveToggle(location)}
                        title={location.isActive ? "Active" : "Inactive"}
                      >
                        {location.isActive ? (
                          <Eye size={18} className="text-green-600" />
                        ) : (
                          <EyeOff size={18} className="text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleFeaturedToggle(location)}
                        title={location.featured ? "Featured" : "Not featured"}
                      >
                        {location.featured ? (
                          <Star size={18} className="text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff size={18} className="text-gray-400" />
                        )}
                      </button>
                      {location.openingSoon && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Opening Soon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
