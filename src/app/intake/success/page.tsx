"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout/Layout";
import Button from "../../../components/UI/Button";
import Link from "next/link";

interface BookingProvider {
  name: string;
  type: string;
  active: boolean;
}

interface AppointmentBookingResult {
  success: boolean;
  appointment?: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    provider: string;
  };
  redirectUrl?: string;
  bookingUrl?: string;
  error?: string;
  fallbackMessage?: string;
}

export default function IntakeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [, setRedirectCountdown] = useState<number | null>(
    null
  );
  const [bookingProviders, setBookingProviders] = useState<BookingProvider[]>(
    []
  );
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] =
    useState<AppointmentBookingResult | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "Consultation",
    notes: "",
  });
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const id = searchParams.get("id");
    setSubmissionId(id);

    // Load patient data from localStorage if available
    const savedPatientData = localStorage.getItem("intakePatientData");
    if (savedPatientData) {
      try {
        const data = JSON.parse(savedPatientData);
        setPatientData({
          name: `${data.legalFirstName || ""} ${data.legalLastName || ""}`.trim(),
          email: data.emailAddress || "",
          phone: data.phoneNumber || "",
        });
      } catch (error) {
        console.error("Error parsing patient data:", error);
      }
    }

    // Load available booking providers
    fetchBookingProviders();

    // If no submission ID, redirect back to intake form after a short delay
    if (!id) {
      setTimeout(() => {
        router.push("/intake");
      }, 5000);
    }
  }, [searchParams, router]);

  const fetchBookingProviders = async () => {
    try {
      const response = await fetch("/api/appointments/providers");
      if (response.ok) {
        const data = await response.json();
        setBookingProviders(data.providers || []);

        // Set default provider
        const activeProviders =
          data.providers?.filter((p: BookingProvider) => p.active) || [];
        if (activeProviders.length > 0) {
          setSelectedProvider(activeProviders[0].type);
        }
      }
    } catch (error) {
      console.error("Error fetching booking providers:", error);
    }
  };

  const handleAppointmentBooking = async () => {
    if (
      !selectedProvider ||
      !appointmentData.appointmentDate ||
      !appointmentData.appointmentTime
    ) {
      setShowBookingForm(true);
      return;
    }

    setIsBooking(true);
    setBookingResult(null);

    try {
      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientIntakeId: submissionId,
          patientName: patientData.name,
          patientEmail: patientData.email,
          patientPhone: patientData.phone,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          appointmentType: appointmentData.appointmentType,
          notes: appointmentData.notes,
          preferredProvider: selectedProvider,
        }),
      });

      const result = await response.json();
      setBookingResult(result);

      if (result.success && result.redirectUrl) {
        // Redirect to booking provider's interface
        setTimeout(() => {
          window.open(result.redirectUrl, "_blank");
        }, 2000);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingResult({
        success: false,
        error: "Failed to connect to booking system",
        fallbackMessage:
          "Please call <a href='tel:2498060128' className='text-blue-600 hover:underline'>249 806 0128</a> to schedule your appointment.",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const renderBookingForm = () => {
    if (!showBookingForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Book Your Appointment
              </h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {bookingProviders.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Booking System
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {bookingProviders.map((provider) => (
                    <option key={provider.type} value={provider.type}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={appointmentData.appointmentDate}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      appointmentDate: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Time *
                </label>
                <select
                  value={appointmentData.appointmentTime}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      appointmentTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointmentData.appointmentType}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      appointmentType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Consultation">Initial Consultation</option>
                  <option value="Follow-up">Follow-up Appointment</option>
                  <option value="Checkup">Annual Checkup</option>
                  <option value="Urgent">Urgent Care</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Any specific concerns or requests..."
                />
              </div>
            </div>

            {bookingResult && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  bookingResult.success
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {bookingResult.success ? (
                  <div>
                    <p className="font-medium">
                      Appointment booked successfully!
                    </p>
                    {bookingResult.appointment && (
                      <p className="text-sm mt-1">
                        {bookingResult.appointment.appointmentDate} at{" "}
                        {bookingResult.appointment.appointmentTime}
                      </p>
                    )}
                    {bookingResult.redirectUrl && (
                      <p className="text-sm mt-1">
                        Redirecting to booking system...
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Booking failed</p>
                    <p className="text-sm mt-1">{bookingResult.error}</p>
                    {bookingResult.fallbackMessage && (
                      <p className="text-sm mt-2 font-medium">
                        {bookingResult.fallbackMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4 mt-8">
              <Button
                onClick={handleAppointmentBooking}
                disabled={
                  isBooking ||
                  !appointmentData.appointmentDate ||
                  !appointmentData.appointmentTime
                }
                className="flex-1"
                size="lg"
              >
                {isBooking ? "Booking..." : "Book Appointment"}
              </Button>
              <Button
                onClick={() => setShowBookingForm(false)}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const nextSteps = [
    {
      step: 1,
      title: "Book Your Appointment",
      description: "Schedule your first visit using our secure booking system.",
      action: "Book Now",
      urgent: true,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      step: 2,
      title: "Prepare for Your Visit",
      description:
        "Bring your ID, insurance card, and any relevant medical records.",
      action: "View Checklist",
      urgent: false,
      icon: (
        <svg
          className="h-6 w-6"
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
      ),
    },
    {
      step: 3,
      title: "Arrive Early",
      description:
        "Please arrive 15 minutes before your scheduled appointment.",
      action: "Get Directions",
      urgent: false,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <Layout className="bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {submissionId ? (
          <>
            {/* Hero Section */}
            <section className="bg-slate-50 py-20">
              <div className="max-w-6xl mx-auto">
                {/* Section Badge */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                    <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                      Form Submitted
                    </span>
                  </div>
                </div>

                {/* Success Confirmation */}
                <div className="text-center mb-12">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg
                      className="h-12 w-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                    Intake Form Submitted Successfully!
                  </h1>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Thank you for completing your patient intake form. Your
                    information has been securely submitted and encrypted
                    using industry-standard security.
                  </p>
                </div>
              </div>
            </section>



            <div className="max-w-6xl mx-auto">
              {/* Submission Details */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-slate-800">
                    Submission Confirmation
                  </h2>
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg
                      className="h-6 w-6"
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
                    <span className="font-medium">Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-slate-700 mb-3">
                      Submission ID
                    </h3>
                    <p className="text-slate-600 font-mono text-sm bg-slate-50 px-4 py-3 rounded-lg border">
                      {submissionId}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Please keep this ID for your records
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-700 mb-3">
                      Submitted On
                    </h3>
                    <p className="text-slate-600">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary CTA - Book Appointment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
                {/* Left Content */}
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                    Ready to Start Your Healthcare Journey?
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Experience comprehensive healthcare with efficient medical
                    expertise and compassionate patient care. Join thousands of
                    patients who trust Zenith Medical Centre for their
                    healthcare needs.
                  </p>

                  {/* Feature Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="h-8 w-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        Walk-In Patients Welcome
                      </h3>
                      <p className="text-sm text-slate-600">
                        Walk-in anytime - care provided based on doctor
                        availability.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="h-8 w-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        Secure Health Records
                      </h3>
                      <p className="text-sm text-slate-600">
                                                      Secure digital records with patient
                        portal access.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="h-8 w-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-5 5v-5zM9 3v12m0 0l3-3m-3 3l-3-3m12-9a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        Instant Updates
                      </h3>
                      <p className="text-sm text-slate-600">
                        Get real-time notifications about appointments and
                        health updates.
                      </p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-lg whitespace-nowrap"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Schedule Appointment
                    </Link>
                    {submissionId && process.env.NODE_ENV === 'development' && (
                      <Link
                        href={`/messages/${submissionId}`}
                        className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-lg whitespace-nowrap"
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Message Portal
                      </Link>
                    )}
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-lg whitespace-nowrap"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
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
                      Contact Us
                    </Link>
                  </div>
                </div>

                {/* Right Content - Visual Element */}
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="h-12 w-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-blue-800 mb-2">
                          Your Health Journey
                        </h3>
                        <p className="text-blue-700">
                          Starts with a single appointment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Success/Error Display */}
              {bookingResult && !showBookingForm && (
                <div
                  className={`rounded-2xl p-6 mb-12 border ${
                    bookingResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        bookingResult.success ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {bookingResult.success ? (
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-medium ${
                          bookingResult.success
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {bookingResult.success
                          ? "Appointment Booked!"
                          : "Booking Failed"}
                      </h3>
                      <p
                        className={`text-base mt-2 ${
                          bookingResult.success
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {bookingResult.success
                          ? `Your appointment has been scheduled. You'll be redirected to complete the booking process.`
                          : bookingResult.error}
                      </p>
                      {bookingResult.fallbackMessage && (
                        <p className="text-base mt-3 font-medium text-red-700">
                          {bookingResult.fallbackMessage}
                        </p>
                      )}
                      {bookingResult.success && (
                        <Button
                          onClick={() => setShowBookingForm(true)}
                          variant="outline"
                          size="sm"
                          className="mt-4 text-green-700 border-green-300 hover:bg-green-50"
                        >
                          Book another appointment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-slate-200">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                    <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                      Next Steps
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">
                    What Happens Next?
                  </h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Follow these steps to complete your healthcare journey with
                    us
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {nextSteps.map((step) => (
                    <div key={step.step} className="text-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                          step.urgent
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                            step.urgent
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {step.step}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        {step.title}
                        {step.urgent && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-600 mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      {step.step === 1 && (
                        <Button
                          onClick={() => setShowBookingForm(true)}
                          size="lg"
                          className="w-full"
                        >
                          {step.action}
                        </Button>
                      )}
                      {step.step === 2 && (
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="w-full"
                        >
                          <Link href="/resources/visit-preparation">
                            {step.action}
                          </Link>
                        </Button>
                      )}
                      {step.step === 3 && (
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="w-full"
                        >
                          <Link href="/contact#directions">{step.action}</Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-100 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
                    <span className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                      Need Help?
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Our team is here to help with any questions or concerns
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="h-6 w-6 text-blue-600"
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
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Phone Support
                    </h3>
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      <a href="tel:2498060128" className="text-blue-600 hover:underline">
                        249 806 0128
                      </a>
                    </p>
                    <p className="text-sm text-slate-500">
                      Monday - Friday, 9:00 AM - 5:00 PM
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="h-6 w-6 text-purple-600"
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
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Email Support
                    </h3>
                    <p className="text-lg font-medium text-purple-600 mb-2">
                      <a
                        href="mailto:admin@zenithmedical.ca"
                        className="hover:text-purple-700 transition-colors"
                      >
                        admin@zenithmedical.ca
                      </a>
                    </p>
                    <p className="text-sm text-slate-500">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              No Submission Found
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              We couldn&apos;t find your intake submission. You&apos;ll be redirected to
              the intake form in a moment.
            </p>
            <Button onClick={() => router.push("/intake")} size="lg">
              Return to Intake Form
            </Button>
          </div>
        )}
      </div>

      {renderBookingForm()}
    </Layout>
  );
}
