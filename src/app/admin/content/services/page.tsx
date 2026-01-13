"use client";

import { useEffect, useState, useRef } from "react";
import { Trash2, Edit, Eye, EyeOff, ArrowUp, ArrowDown, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  imageUrl?: string;
  orderIndex: number;
  published: boolean;
}

const emptyService: Omit<Service, "id" | "orderIndex"> = {
  title: "",
  description: "",
  features: [],
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }

  function handleEdit(service: Service) {
    setEditing(service);
    setForm({
      title: service.title,
      description: service.description,
      features: service.features,
      imageUrl: service.imageUrl || "",
      published: service.published,
    });
    setFormMode("edit");
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', 'service');
      formData.append('entityId', editing?.id || 'new-service');

      const res = await fetch('/api/uploads/images', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setForm((f) => ({ ...f, imageUrl: data.data.secure_url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleRemoveImage() {
    setForm((f) => ({ ...f, imageUrl: '' }));
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
          <label className="block font-medium mb-1">Service Image</label>

          {/* Image Preview */}
          {form.imageUrl ? (
            <div className="relative mb-3">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-100">
                <Image
                  src={form.imageUrl}
                  alt="Service preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="mb-3 w-full h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon size={48} className="mb-2" />
              <p className="text-sm">No image selected</p>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
              id="service-image-upload"
            />
            <label
              htmlFor="service-image-upload"
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                uploading
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Upload size={18} className="mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </label>
            <span className="text-xs text-slate-500">
              JPEG, PNG, WebP, or GIF (max 10MB)
            </span>
          </div>

          {/* Or enter URL manually */}
          <div className="mt-3">
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                Or enter image URL manually
              </summary>
              <input
                className="w-full border rounded px-3 py-2 mt-2"
                value={form.imageUrl || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </details>
          </div>
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
                <th className="py-2">Image</th>
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
                  <td className="py-2">
                    {service.imageUrl ? (
                      <div className="relative w-16 h-12 rounded overflow-hidden bg-slate-100">
                        <Image
                          src={service.imageUrl}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 rounded bg-slate-100 flex items-center justify-center">
                        <ImageIcon size={20} className="text-slate-400" />
                      </div>
                    )}
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
