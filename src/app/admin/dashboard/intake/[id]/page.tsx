"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../lib/auth/use-auth";
import { FormSkeleton } from "@/components/UI/SkeletonLoader";

interface FullIntakeSubmission {
  id: string;
  legalFirstName: string;
  legalLastName: string;
  preferredName?: string;
  dateOfBirth: string;
  phoneNumber: string;
  emailAddress: string;
  streetAddress: string;
  city: string;
  provinceState: string;
  postalZipCode: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  relationshipToPatient: string;
  status:
    | "SUBMITTED"
    | "REVIEWED"
    | "APPOINTMENT_SCHEDULED"
    | "CHECKED_IN"
    | "COMPLETED"
    | "CANCELLED";
  appointmentBooked: boolean;
  appointmentBookedAt?: string;
  privacyPolicyAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
  dependents?: Array<{
    id: string;
    legalFirstName: string;
    legalLastName: string;
    middleName?: string;
    preferredName?: string;
    dateOfBirth: string;
    gender?: string;
    healthInformationNumber: string;
    relationshipToPatient: string;
    streetAddress: string;
    city: string;
    provinceState: string;
    postalZipCode: string;
    sameAddressAsPatient: boolean;
  }>;
}

const statusOptions = [
  { value: "SUBMITTED", label: "Pending Review", color: "yellow" },
  { value: "REVIEWED", label: "Reviewed", color: "blue" },
  {
    value: "APPOINTMENT_SCHEDULED",
    label: "Appointment Scheduled",
    color: "green",
  },
  { value: "CHECKED_IN", label: "Checked In", color: "purple" },
  { value: "COMPLETED", label: "Completed", color: "gray" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
];

export default function IntakeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const [submission, setSubmission] = useState<FullIntakeSubmission | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch submission details
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/intake/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Intake submission not found");
          }
          throw new Error("Failed to fetch submission details");
        }

        const data = await response.json();
        setSubmission(data.submission);
        setNewStatus(data.submission.status);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load submission"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [isAuthenticated, id]);

  const updateStatus = async (status: string) => {
    if (!submission || !isAdmin) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/intake/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      setSubmission(data.submission);
      setNewStatus(data.submission.status);

      // Show success message
      alert("Status updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert(
        "Failed to update status: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setUpdating(false);
    }
  };

  const markAppointmentBooked = async () => {
    if (!submission || !isAdmin) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/intake/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          appointmentBooked: true,
          status: "APPOINTMENT_SCHEDULED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark appointment as booked");
      }

      const data = await response.json();
      setSubmission(data.submission);
      setNewStatus(data.submission.status);

      alert("Appointment marked as booked!");
    } catch (err) {
      console.error("Update error:", err);
      alert(
        "Failed to update appointment status: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig =
      statusOptions.find((s) => s.value === status) || statusOptions[0];
    const colorClasses = {
      yellow: "bg-yellow-500 text-white shadow-lg",
      blue: "bg-blue-500 text-white shadow-lg",
      green: "bg-green-500 text-white shadow-lg",
      purple: "bg-purple-500 text-white shadow-lg",
      gray: "bg-gray-500 text-white shadow-lg",
      red: "bg-red-500 text-white shadow-lg",
    };

    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${colorClasses[statusConfig.color as keyof typeof colorClasses]}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Submission
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/admin/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <FormSkeleton />;
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Submission Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested intake submission could not be found.
          </p>
          <Link
            href="/admin/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <Link
                href="/admin/dashboard"
                className="text-blue-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                title="Back to Dashboard"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Patient Intake Details
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-blue-100 text-sm font-medium">
                      ID: {submission.id}
                    </p>
                    <span className="text-blue-200">•</span>
                    <p className="text-blue-100 text-sm">
                      {submission.legalFirstName} {submission.legalLastName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Status Badge */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                {getStatusBadge(submission.status)}
              </div>

              {/* Communication Button - Only show in development */}

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
                title="Print Details"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a4 4 0 118 0v4m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Submitted:{" "}
                  {new Date(submission.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>{submission.emailAddress}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{submission.phoneNumber}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {submission.appointmentBooked && (
                <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Appointment Booked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Legal First Name
                  </label>
                  <p className="text-gray-900">{submission.legalFirstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Legal Last Name
                  </label>
                  <p className="text-gray-900">{submission.legalLastName}</p>
                </div>
                {submission.preferredName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Preferred Name
                    </label>
                    <p className="text-gray-900">{submission.preferredName}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Date of Birth
                  </label>
                  <p className="text-gray-900">{submission.dateOfBirth}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Phone Number
                  </label>
                  <p className="text-gray-900">{submission.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email Address
                  </label>
                  <p className="text-gray-900">{submission.emailAddress}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Street Address
                  </label>
                  <p className="text-gray-900">{submission.streetAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    City
                  </label>
                  <p className="text-gray-900">{submission.city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Province/State
                  </label>
                  <p className="text-gray-900">{submission.provinceState}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Postal/ZIP Code
                  </label>
                  <p className="text-gray-900">{submission.postalZipCode}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Next of Kin
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Contact Name
                  </label>
                  <p className="text-gray-900">{submission.nextOfKinName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Contact Phone
                  </label>
                  <p className="text-gray-900">{submission.nextOfKinPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Relationship to Patient
                  </label>
                  <p className="text-gray-900">
                    {submission.relationshipToPatient}
                  </p>
                </div>
              </div>
            </div>

            {/* Dependent Information */}
            {submission.dependents && submission.dependents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Dependent Enrollment Information (
                  {submission.dependents.length})
                </h2>
                <div className="space-y-6">
                  {submission.dependents.map(
                    (dependent: any, index: number) => (
                      <div
                        key={dependent.id}
                        className="border-l-4 border-blue-200 pl-4"
                      >
                        <h3 className="text-md font-medium text-gray-800 mb-3">
                          Dependent #{index + 1}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              First Name
                            </label>
                            <p className="text-gray-900">
                              {dependent.legalFirstName}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Last Name
                            </label>
                            <p className="text-gray-900">
                              {dependent.legalLastName}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Health Number
                            </label>
                            <p className="text-gray-900">
                              {dependent.healthInformationNumber}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Date of Birth
                            </label>
                            <p className="text-gray-900">
                              {dependent.dateOfBirth}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Gender
                            </label>
                            <p className="text-gray-900">{dependent.gender}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Relationship
                            </label>
                            <p className="text-gray-900">
                              {dependent.relationship}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500">
                              Address
                            </label>
                            {dependent.residenceAddressSameAsSection1 ? (
                              <p className="text-gray-900">
                                Same as main applicant
                              </p>
                            ) : (
                              <div className="text-gray-900">
                                {dependent.residenceApartmentNumber && (
                                  <span>
                                    {dependent.residenceApartmentNumber}{" "}
                                  </span>
                                )}
                                <span>{dependent.residenceStreetAddress}</span>
                                <br />
                                <span>
                                  {dependent.residenceCity},{" "}
                                  {dependent.residencePostalCode}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Management
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => updateStatus(newStatus)}
                    disabled={updating || newStatus === submission.status}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>

                  {!submission.appointmentBooked && (
                    <button
                      onClick={markAppointmentBooked}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Mark Appointment Booked
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Submission Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submission Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Submitted
                  </label>
                  <p className="text-gray-900">
                    {new Date(submission.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {new Date(submission.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Privacy Policy
                  </label>
                  <p className="text-gray-900">
                    {submission.privacyPolicyAccepted
                      ? "Accepted"
                      : "Not Accepted"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Appointment Status
                  </label>
                  <p className="text-gray-900">
                    {submission.appointmentBooked ? "Booked" : "Not Booked"}
                  </p>
                </div>
                {submission.appointmentBookedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Appointment Booked At
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        submission.appointmentBookedAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Information */}
            {submission.ipAddress && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Audit Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      IP Address
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {submission.ipAddress}
                    </p>
                  </div>
                  {submission.userAgent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        User Agent
                      </label>
                      <p className="text-gray-900 text-sm break-all">
                        {submission.userAgent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
