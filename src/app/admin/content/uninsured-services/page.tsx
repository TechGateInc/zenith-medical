"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  DollarSign,
  FileText,
  Briefcase,
  Shield,
} from "lucide-react";

// Categories for uninsured services
const CATEGORIES = [
  { key: "clinical", name: "Clinical Services", icon: FileText },
  {
    key: "work_educational_government",
    name: "Work, Educational & Government",
    icon: Briefcase,
  },
  { key: "insurance_admin", name: "Insurance Administrative", icon: Shield },
];

interface UninsuredService {
  id: string;
  category: string;
  title: string;
  description: string | null;
  price: string;
  isInsured: boolean;
  orderIndex: number;
  published: boolean;
}

const emptyService: Omit<UninsuredService, "id" | "orderIndex"> = {
  category: "clinical",
  title: "",
  description: "",
  price: "",
  isInsured: false,
  published: true,
};

export default function AdminUninsuredServicesPage() {
  const [services, setServices] = useState<UninsuredService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UninsuredService | null>(null);
  const [form, setForm] = useState(emptyService);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("clinical");

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content/uninsured-services");
      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
    setLoading(false);
  }

  function resetForm() {
    setForm({ ...emptyService, category: activeCategory });
    setEditing(null);
    setFormMode("add");
    setError(null);
  }

  function handleEdit(service: UninsuredService) {
    setEditing(service);
    setForm({
      category: service.category,
      title: service.title,
      description: service.description || "",
      price: service.price,
      isInsured: service.isInsured,
      published: service.published,
    });
    setFormMode("edit");
    setActiveCategory(service.category);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch("/api/admin/content/uninsured-services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchServices();
  }

  async function handlePublishToggle(service: UninsuredService) {
    await fetch("/api/admin/content/uninsured-services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, published: !service.published }),
    });
    fetchServices();
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const categoryServices = services.filter(
      (s) => s.category === activeCategory
    );
    const idx = categoryServices.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categoryServices.length) return;

    // Get the two services to swap
    const service1 = categoryServices[idx];
    const service2 = categoryServices[swapIdx];

    // Swap order indices
    await Promise.all([
      fetch("/api/admin/content/uninsured-services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service1.id,
          orderIndex: service2.orderIndex,
        }),
      }),
      fetch("/api/admin/content/uninsured-services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service2.id,
          orderIndex: service1.orderIndex,
        }),
      }),
    ]);
    fetchServices();
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.price) {
      setError("Title and price are required.");
      return;
    }

    const categoryServices = services.filter(
      (s) => s.category === form.category
    );

    if (formMode === "add") {
      await fetch("/api/admin/content/uninsured-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          orderIndex: categoryServices.length,
        }),
      });
    } else if (editing) {
      await fetch("/api/admin/content/uninsured-services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    }
    resetForm();
    fetchServices();
  }

  const filteredServices = services.filter(
    (s) => s.category === activeCategory
  );

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Manage Uninsured Service Fees</h1>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                resetForm();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon size={18} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-xl shadow p-6 mb-10"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} />
          {formMode === "add" ? "Add New Service Fee" : "Edit Service Fee"}
        </h2>
        {error && (
          <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Price</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="e.g. $180 or $40 (1-4 lesions)"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Service name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={form.description || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Additional details about this service"
            rows={2}
          />
        </div>

        <div className="flex gap-6 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={form.isInsured}
              onChange={(e) =>
                setForm((f) => ({ ...f, isInsured: e.target.checked }))
              }
              id="isInsured"
              className="w-4 h-4"
            />
            <label htmlFor="isInsured" className="ml-2">
              This is an insured service (will show explanatory note)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
              id="published"
              className="w-4 h-4"
            />
            <label htmlFor="published" className="ml-2">
              Published
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            {formMode === "add" ? "Add Service" : "Save Changes"}
          </button>
          {formMode === "edit" && (
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded transition-colors"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Services List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {CATEGORIES.find((c) => c.key === activeCategory)?.name} - Fee
          Schedule
        </h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : filteredServices.length === 0 ? (
          <div className="text-slate-500 py-8 text-center">
            No services in this category yet. Add one above.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 w-20">Order</th>
                <th className="py-2">Service</th>
                <th className="py-2">Price</th>
                <th className="py-2 w-20">Status</th>
                <th className="py-2 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service, idx) => (
                <tr key={service.id} className="border-t hover:bg-gray-50">
                  <td className="py-3">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleReorder(service.id, "up")}
                      className="mr-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      disabled={idx === filteredServices.length - 1}
                      onClick={() => handleReorder(service.id, "down")}
                      className="text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="font-medium">{service.title}</div>
                    {service.description && (
                      <div className="text-sm text-gray-500">
                        {service.description}
                      </div>
                    )}
                    {service.isInsured && (
                      <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1">
                        Insured Service
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-semibold text-blue-600">
                    {service.price}
                  </td>
                  <td className="py-3">
                    <button onClick={() => handlePublishToggle(service)}>
                      {service.published ? (
                        <Eye size={18} className="text-green-600" />
                      ) : (
                        <EyeOff size={18} className="text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-800"
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

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">
          About Uninsured Services
        </h3>
        <p className="text-sm text-blue-700">
          These fees are displayed on the Services page under
          &quot;Patient&apos;s Guide to Uninsured Services&quot;. Items marked
          as &quot;Insured Service&quot; will be shown with a note explaining
          they are covered by OHIP.
        </p>
      </div>
    </div>
  );
}
