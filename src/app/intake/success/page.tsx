"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout/Layout";
import Button from "../../../components/UI/Button";
import Link from "next/link";
import { useCachedPrimaryPhone } from '@/lib/hooks/useCachedAddress';

export default function IntakeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const { primaryPhone, loading: phoneLoading } = useCachedPrimaryPhone();

  useEffect(() => {
    const id = searchParams.get("id");
    setSubmissionId(id);

    // If no submission ID, redirect back to intake form after a short delay
    if (!id) {
      setTimeout(() => {
        router.push("/intake");
      }, 5000);
    }
  }, [searchParams, router]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg
                className="h-8 w-8 text-green-600"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Your Submission!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your patient intake form has been successfully submitted. Our team will review your information and contact you soon.
            </p>
          </div>

          {/* Submission Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Submission Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Submission ID</p>
                <p className="text-lg text-gray-900 font-mono">
                  {submissionId || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg text-gray-900">Submitted for Review</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              What Happens Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-blue-900">
                    Review Process
                  </h3>
                  <p className="text-blue-700">
                    Our medical team will review your intake information within 24-48 hours.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-blue-900">
                    Contact You
                  </h3>
                  <p className="text-blue-700">
                    We&apos;ll contact you via phone or email to discuss next steps and schedule your appointment.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-blue-900">
                    Schedule Appointment
                  </h3>
                  <p className="text-blue-700">
                    Once reviewed, we&apos;ll work with you to schedule your appointment at a convenient time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Need to Contact Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Phone Support
                </h3>
                <p className="text-gray-600 mb-2">
                  Call us directly for immediate assistance:
                </p>
                <a
                  href={`tel:${primaryPhone || '249 806 0128'}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {primaryPhone || '249 806 0128'}
                </a>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Office Hours
                </h3>
                <p className="text-gray-600">
                  Monday - Friday: 9:00 AM - 5:00 PM<br />
                  Saturday: 9:00 AM - 1:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" className="w-full sm:w-auto">
                Return to Homepage
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" className="w-full sm:w-auto">
                Contact Support
              </Button>
            </Link>
          </div>

          {/* Important Notice */}
          <div className="mt-12 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">
                Important Notice
              </h3>
              <p className="text-yellow-800">
                If you experience any medical emergencies, please call 911 immediately or visit your nearest emergency room. 
                This form is for non-emergency medical appointments only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
