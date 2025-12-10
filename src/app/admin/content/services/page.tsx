"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

// Medical icon options for easy selection
const MEDICAL_ICONS = [
  {
    name: "Heart",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`,
  },
  {
    name: "Shield",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`,
  },
  {
    name: "Chart",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`,
  },
  {
    name: "Stethoscope",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  },
  {
    name: "Pill",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>`,
  },
  {
    name: "Microscope",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>`,
  },
  {
    name: "User",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`,
  },
  {
    name: "Calendar",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`,
  },
  {
    name: "Phone",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>`,
  },
  {
    name: "Document",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
  },
  {
    name: "Settings",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  },
  {
    name: "Plus",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>`,
  },
  {
    name: "Check",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
  },
  {
    name: "Star",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>`,
  },
  {
    name: "Home",
    svg: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
  },
  {
    name: "Custom",
    svg: "",
  },
];

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon?: string;
  imageUrl?: string;
  orderIndex: number;
  published: boolean;
}

const emptyService: Omit<Service, "id" | "orderIndex"> = {
  title: "",
  description: "",
  features: [],
  icon: "",
  imageUrl: "",
  published: true,
};

export default function AdminServicesPage() {
  // TODO: Replace with real admin auth check
  // const { data: session, status } = useSession()
  // const router = useRouter()

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyService);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [showCustomIcon, setShowCustomIcon] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const res = await fetch("/api/admin/content/services");
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  }

  function resetForm() {
    setForm(emptyService);
    setEditing(null);
    setFormMode("add");
    setError(null);
    setSelectedIcon("");
    setShowCustomIcon(false);
  }

  function handleEdit(service: Service) {
    setEditing(service);
    setForm({
      title: service.title,
      description: service.description,
      features: service.features,
      icon: service.icon || "",
      published: service.published,
    });
    setFormMode("edit");

    // Set selected icon based on current icon
    const currentIcon = service.icon || "";
    const foundIcon = MEDICAL_ICONS.find((icon) => icon.svg === currentIcon);
    if (foundIcon && foundIcon.name !== "Custom") {
      setSelectedIcon(foundIcon.name);
      setShowCustomIcon(false);
    } else {
      setSelectedIcon("Custom");
      setShowCustomIcon(true);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch("/api/admin/content/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchServices();
  }

  async function handlePublishToggle(service: Service) {
    await fetch("/api/admin/content/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, published: !service.published }),
    });
    fetchServices();
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = services.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= services.length) return;
    // Optimistic UI
    const reordered = [...services];
    const temp = reordered[idx];
    reordered[idx] = reordered[swapIdx];
    reordered[swapIdx] = temp;
    // Update orderIndex
    reordered.forEach((s, i) => (s.orderIndex = i));
    setServices(reordered);
    // Persist
    await Promise.all(
      reordered.map((s) =>
        fetch("/api/admin/content/services", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: s.id, orderIndex: s.orderIndex }),
        })
      )
    );
    fetchServices();
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.description) {
      setError("Title and description are required.");
      return;
    }
    if (formMode === "add") {
      await fetch("/api/admin/content/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          features: form.features.filter(Boolean),
          orderIndex: services.length,
        }),
      });
    } else if (editing) {
      await fetch("/api/admin/content/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          ...form,
          features: form.features.filter(Boolean),
        }),
      });
    }
    resetForm();
    fetchServices();
  }

  function handleFeatureChange(idx: number, value: string) {
    setForm((f) => ({
      ...f,
      features: f.features.map((feat, i) => (i === idx ? value : feat)),
    }));
  }
  function handleAddFeature() {
    setForm((f) => ({ ...f, features: [...f.features, ""] }));
  }
  function handleRemoveFeature(idx: number) {
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, i) => i !== idx),
    }));
  }

  function handleIconSelect(iconName: string) {
    setSelectedIcon(iconName);
    if (iconName === "Custom") {
      setShowCustomIcon(true);
      setForm((f) => ({ ...f, icon: "" }));
    } else {
      setShowCustomIcon(false);
      const selectedIconData = MEDICAL_ICONS.find(
        (icon) => icon.name === iconName
      );
      if (selectedIconData) {
        setForm((f) => ({ ...f, icon: selectedIconData.svg }));
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Manage Services</h1>

      {/* Add/Edit Form */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-xl shadow p-6 mb-10"
      >
        <h2 className="text-xl font-semibold mb-4">
          {formMode === "add" ? "Add New Service" : "Edit Service"}
        </h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mb-4">
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Features</label>
          {form.features.map((feature, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                className="w-full border rounded px-3 py-2"
                value={feature}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                required
              />
              <button
                type="button"
                className="ml-2 text-red-500"
                onClick={() => handleRemoveFeature(idx)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded"
            onClick={handleAddFeature}
          >
            Add Feature
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Icon</label>

          {/* Icon Grid */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-2">Quick Select:</div>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {MEDICAL_ICONS.filter((icon) => icon.name !== "Custom").map(
                (icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-2 rounded border-2 transition-colors ${
                      selectedIcon === icon.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    title={icon.name}
                  >
                    <div className="w-6 h-6 text-gray-600 flex items-center justify-center">
                      <span dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Icon Selection Dropdown */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Or select from dropdown:
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedIcon}
              onChange={(e) => handleIconSelect(e.target.value)}
            >
              <option value="">Select an icon...</option>
              {MEDICAL_ICONS.map((icon) => (
                <option key={icon.name} value={icon.name}>
                  {icon.name}
                </option>
              ))}
            </select>
          </div>

          {/* Icon Preview */}
          {form.icon && (
            <div className="mb-3 p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-600 mb-2">Icon Preview:</div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <span dangerouslySetInnerHTML={{ __html: form.icon }} />
              </div>
            </div>
          )}

          {/* Custom Icon Input */}
          {showCustomIcon && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Custom SVG Icon
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.icon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, icon: e.target.value }))
                }
                placeholder="<svg class='h-8 w-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>...</svg>"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter SVG code with class=&quot;h-8 w-8&quot; for proper sizing
              </p>
            </div>
          )}
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((f) => ({ ...f, published: e.target.checked }))
            }
            id="published"
          />
          <label htmlFor="published" className="ml-2">
            Published
          </label>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
          >
            {formMode === "add" ? "Add Service" : "Save Changes"}
          </button>
          {formMode === "edit" && (
            <button
              type="button"
              className="bg-gray-200 px-6 py-2 rounded"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Services List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Services</h2>
        {loading ? (
          <div>Loading...</div>
        ) : services.length === 0 ? (
          <div className="text-slate-500">No services found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Order</th>
                <th className="py-2">Title</th>
                <th className="py-2">Published</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, idx) => (
                <tr key={service.id} className="border-t">
                  <td className="py-2">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleReorder(service.id, "up")}
                      className="mr-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      disabled={idx === services.length - 1}
                      onClick={() => handleReorder(service.id, "down")}
                      className="text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </td>
                  <td className="py-2 font-semibold">{service.title}</td>
                  <td className="py-2">
                    <button onClick={() => handlePublishToggle(service)}>
                      {service.published ? (
                        <Eye size={18} className="text-green-600" />
                      ) : (
                        <EyeOff size={18} className="text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
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
