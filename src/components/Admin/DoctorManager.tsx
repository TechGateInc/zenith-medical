/**
 * Doctor Manager Component
 * Admin interface for managing doctor profiles with CRUD operations
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  User,
  Loader2,
  Stethoscope,
  GraduationCap,
  Award,
  Building,
} from "lucide-react";
import ImageUpload from "./ImageUpload";
import Modal from "../UI/Modal";
import toast from "react-hot-toast";
import { useApiAuth } from "@/lib/auth/use-api-auth";
import { TableSkeleton } from "@/components/UI/SkeletonLoader";

// Types
interface DoctorProfile {
  id: string;
  teamMemberId: string;
  professionalBio: string;
  medicalSchool?: string;
  graduationYear?: number;
  residency?: string;
  fellowship?: string;
  boardCertifications: string[];
  hospitalAffiliations: string[];
  researchInterests: string[];
  publications: string[];
  awards: string[];
  memberships: string[];
  consultationFee?: string;
  availability?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;

  orderIndex: number;
  published: boolean;
  isDoctor: boolean;
  credentials?: string;
  experience?: string;
  education: string[];
  certifications: string[];
  languages: string[];
  doctor?: DoctorProfile;
  createdAt: string;
  updatedAt: string;
}

interface DoctorFormData {
  teamMemberId: string;
  professionalBio: string;
  medicalSchool?: string;
  graduationYear?: number;
  residency?: string;
  fellowship?: string;
  boardCertifications: string[];
  hospitalAffiliations: string[];
  researchInterests: string[];
  publications: string[];
  awards: string[];
  memberships: string[];
  consultationFee?: string;
  availability?: string;
  emergencyContact?: string;
}

// TagInput component for managing arrays of strings
function TagInput({
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-2 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {value.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-0 border-0 focus:ring-0 text-sm"
      />
    </div>
  );
}

export default function DoctorManager() {
  const [doctors, setDoctors] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublished, setFilterPublished] = useState<
    "all" | "published" | "unpublished"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>({
    teamMemberId: "",
    professionalBio: "",
    medicalSchool: "",
    graduationYear: undefined,
    residency: "",
    fellowship: "",
    boardCertifications: [],
    hospitalAffiliations: [],
    researchInterests: [],
    publications: [],
    awards: [],
    memberships: [],
    consultationFee: "",
    availability: "",
    emergencyContact: "",
  });
  const [availableTeamMembers, setAvailableTeamMembers] = useState<
    TeamMember[]
  >([]);
  const [photoChanged, setPhotoChanged] = useState(false);

  const { handleApiError } = useApiAuth();

  // Lightweight API helper that reuses our auth error handling
  const apiCall = useCallback(
    async (
      url: string,
      method: "GET" | "POST" | "PUT" | "DELETE",
      body?: unknown
    ) => {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP ${response.status}`);
        if (handleApiError(error, response)) {
          throw error;
        }
        throw error;
      }

      return response.json();
    },
    [handleApiError]
  );

  // Fetch doctors and available team members
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall("/api/admin/content/doctors", "GET");
      if (response.success) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchAvailableTeamMembers = useCallback(async () => {
    try {
      const response = await apiCall("/api/admin/content/team", "GET");
      if (response.success) {
        // Filter for team members who are doctors or can be made doctors
        const available = response.data.filter(
          (member: TeamMember) => member.isDoctor || !member.doctor
        );
        setAvailableTeamMembers(available);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    }
  }, [apiCall]);

  // Refresh function for manual updates
  const refreshData = useCallback(async () => {
    await Promise.all([fetchDoctors(), fetchAvailableTeamMembers()]);
  }, [fetchDoctors, fetchAvailableTeamMembers]);

  // Only fetch data once on component mount
  useEffect(() => {
    refreshData();
  }, [refreshData]); // Include refreshData in dependencies

  // Filter doctors based on search and filter criteria
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterPublished === "all" ||
      (filterPublished === "published" && doctor.published) ||
      (filterPublished === "unpublished" && !doctor.published);

    return matchesSearch && matchesFilter;
  });

  const handleCreateDoctor = () => {
    setEditingDoctor(null);
    setFormData({
      teamMemberId: "",
      professionalBio: "",
      medicalSchool: "",
      graduationYear: undefined,
      residency: "",
      fellowship: "",
      boardCertifications: [],
      hospitalAffiliations: [],
      researchInterests: [],
      publications: [],
      awards: [],
      memberships: [],
      consultationFee: "",
      availability: "",
      emergencyContact: "",
    });
    setPhotoChanged(false);
    setShowModal(true);
  };

  const handleEditDoctor = (doctor: TeamMember) => {
    setEditingDoctor(doctor);
    setPhotoChanged(false);
    if (doctor.doctor) {
      setFormData({
        teamMemberId: doctor.id,
        professionalBio: doctor.doctor.professionalBio,
        medicalSchool: doctor.doctor.medicalSchool || "",
        graduationYear: doctor.doctor.graduationYear,
        residency: doctor.doctor.residency || "",
        fellowship: doctor.doctor.fellowship || "",
        boardCertifications: doctor.doctor.boardCertifications,
        hospitalAffiliations: doctor.doctor.hospitalAffiliations,
        researchInterests: doctor.doctor.researchInterests,
        publications: doctor.doctor.publications,
        awards: doctor.doctor.awards,
        memberships: doctor.doctor.memberships,
        consultationFee: doctor.doctor.consultationFee || "",
        availability: doctor.doctor.availability || "",
        emergencyContact: doctor.doctor.emergencyContact || "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDoctor) {
        // Update existing doctor
        const response = await apiCall(
          `/api/admin/content/doctors/${editingDoctor.id}`,
          "PUT",
          formData
        );
        if (response.success) {
          // If there's a photo change, also update the team member
          if (photoChanged && editingDoctor.photoUrl !== undefined) {
            try {
              await apiCall(
                `/api/admin/content/team/${editingDoctor.id}`,
                "PUT",
                {
                  photoUrl: editingDoctor.photoUrl,
                }
              );
            } catch (photoError) {
              console.error("Failed to update photo:", photoError);
              // Don't fail the entire operation if photo update fails
            }
          }

          toast.success("Doctor profile updated successfully");
          setShowModal(false);
          setPhotoChanged(false);
          // Fetch fresh data directly
          const freshResponse = await apiCall(
            "/api/admin/content/doctors",
            "GET"
          );
          if (freshResponse.success) {
            setDoctors(freshResponse.data);
          }
        }
      } else {
        // Create new doctor
        const response = await apiCall(
          "/api/admin/content/doctors",
          "POST",
          formData
        );
        if (response.success) {
          toast.success("Doctor profile created successfully");
          setShowModal(false);
          // Fetch fresh data directly
          const freshResponse = await apiCall(
            "/api/admin/content/doctors",
            "GET"
          );
          if (freshResponse.success) {
            setDoctors(freshResponse.data);
          }
        }
      }
    } catch (error) {
      console.error("Failed to save doctor profile:", error);
      toast.error("Failed to save doctor profile");
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this doctor profile? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await apiCall(
        `/api/admin/content/doctors/${doctorId}`,
        "DELETE"
      );
      if (response.success) {
        toast.success("Doctor profile deleted successfully");
        // Fetch fresh data directly
        const freshResponse = await apiCall(
          "/api/admin/content/doctors",
          "GET"
        );
        if (freshResponse.success) {
          setDoctors(freshResponse.data);
        }
      }
    } catch (error) {
      console.error("Failed to delete doctor profile:", error);
      toast.error("Failed to delete doctor profile");
    }
  };

  const handleTogglePublished = async (
    doctorId: string,
    currentPublished: boolean
  ) => {
    try {
      const response = await apiCall(
        `/api/admin/content/doctors/${doctorId}/toggle-published`,
        "PUT",
        {
          published: !currentPublished,
        }
      );
      if (response.success) {
        toast.success(
          `Doctor profile ${!currentPublished ? "published" : "unpublished"} successfully`
        );
        // Fetch fresh data directly
        const freshResponse = await apiCall(
          "/api/admin/content/doctors",
          "GET"
        );
        if (freshResponse.success) {
          setDoctors(freshResponse.data);
        }
      }
    } catch (error) {
      console.error("Failed to toggle published status:", error);
      toast.error("Failed to update published status");
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} columns={8} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Profiles</h1>
          <p className="text-gray-600">
            Manage doctor profiles and professional information
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            title="Refresh data"
          >
            <Loader2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateDoctor}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor Profile
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search doctors by name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterPublished}
            onChange={(e) =>
              setFilterPublished(
                e.target.value as "all" | "published" | "unpublished"
              )
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="unpublished">Unpublished Only</option>
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Doctors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credentials
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {doctor.photoUrl ? (
                          <Image
                            src={doctor.photoUrl}
                            alt={doctor.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {doctor.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {doctor.credentials || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {doctor.experience || "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doctor.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {doctor.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doctor.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          handleTogglePublished(doctor.id, doctor.published)
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          doctor.published
                            ? "text-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={doctor.published ? "Unpublish" : "Publish"}
                      >
                        {doctor.published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditDoctor(doctor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12 px-6">
            <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No doctors found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterPublished !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first doctor profile."}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDoctor ? "Edit Doctor Profile" : "Create Doctor Profile"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team Member *
            </label>
            <select
              value={formData.teamMemberId}
              onChange={(e) =>
                setFormData({ ...formData, teamMemberId: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a team member...</option>
              {availableTeamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.title}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload - Moved to top for prominence */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor Photo <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Upload a professional photo for the doctor. This photo will be
              displayed on their profile page and in the doctors listing.
              {!editingDoctor &&
                " For new doctor profiles, a photo is highly recommended."}
            </p>
            <div className="bg-white p-3 rounded-lg border border-gray-300">
                              <ImageUpload
                  uploadType="team-member"
                  entityId={editingDoctor?.id || formData.teamMemberId}
                  currentImageUrl={editingDoctor?.photoUrl}
                  onUploadSuccess={(uploadResult) => {
                    // Update the team member's photo URL
                    if (editingDoctor) {
                      // Update the local state to reflect the new photo
                      setEditingDoctor({
                        ...editingDoctor,
                        photoUrl: uploadResult.secure_url,
                      });
                      setPhotoChanged(true);
                    }
                    toast.success("Photo uploaded successfully");
                  }}
                  onUploadError={(error) => {
                    toast.error(`Failed to upload photo: ${error}`);
                  }}
                  onImageRemove={() => {
                    if (editingDoctor) {
                      setEditingDoctor({
                        ...editingDoctor,
                        photoUrl: undefined,
                      });
                      setPhotoChanged(true);
                    }
                    toast.success("Photo removed");
                  }}
                  className="max-w-xs"
                />
            </div>
          </div>

          {/* Professional Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Biography *
            </label>
            <textarea
              value={formData.professionalBio}
              onChange={(e) =>
                setFormData({ ...formData, professionalBio: e.target.value })
              }
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the doctor's professional biography..."
            />
          </div>

          {/* Education Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical School
              </label>
              <input
                type="text"
                value={formData.medicalSchool}
                onChange={(e) =>
                  setFormData({ ...formData, medicalSchool: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., University of Oxford"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Graduation Year
              </label>
              <input
                type="number"
                value={formData.graduationYear || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    graduationYear: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2010"
                min="1950"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residency
              </label>
              <input
                type="text"
                value={formData.residency}
                onChange={(e) =>
                  setFormData({ ...formData, residency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Family Medicine, University of Toronto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fellowship
              </label>
              <input
                type="text"
                value={formData.fellowship}
                onChange={(e) =>
                  setFormData({ ...formData, fellowship: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Sports Medicine"
              />
            </div>
          </div>

          {/* Certifications and Affiliations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Board Certifications
              </label>
              <TagInput
                value={formData.boardCertifications}
                onChange={(value) =>
                  setFormData({ ...formData, boardCertifications: value })
                }
                placeholder="Add certification..."
                icon={Award}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Affiliations
              </label>
              <TagInput
                value={formData.hospitalAffiliations}
                onChange={(value) =>
                  setFormData({ ...formData, hospitalAffiliations: value })
                }
                placeholder="Add hospital..."
                icon={Building}
              />
            </div>
          </div>

          {/* Research and Publications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Interests
              </label>
              <TagInput
                value={formData.researchInterests}
                onChange={(value) =>
                  setFormData({ ...formData, researchInterests: value })
                }
                placeholder="Add research interest..."
                icon={GraduationCap}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publications
              </label>
              <TagInput
                value={formData.publications}
                onChange={(value) =>
                  setFormData({ ...formData, publications: value })
                }
                placeholder="Add publication..."
                icon={GraduationCap}
              />
            </div>
          </div>

          {/* Awards and Memberships */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Awards & Honors
              </label>
              <TagInput
                value={formData.awards}
                onChange={(value) =>
                  setFormData({ ...formData, awards: value })
                }
                placeholder="Add award..."
                icon={Award}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Memberships
              </label>
              <TagInput
                value={formData.memberships}
                onChange={(value) =>
                  setFormData({ ...formData, memberships: value })
                }
                placeholder="Add membership..."
                icon={User}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fee
              </label>
              <input
                type="text"
                value={formData.consultationFee}
                onChange={(e) =>
                  setFormData({ ...formData, consultationFee: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., $150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Emergency contact info"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {editingDoctor ? "Update Profile" : "Create Profile"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
