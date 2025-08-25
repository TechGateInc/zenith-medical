/**
 * Admin Settings Page
 * System configuration and administrative settings
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Settings,
  Globe,
  Database,
  Shield,
  Save,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Phone,
} from "lucide-react";
import { SettingsSkeleton } from "@/components/UI/SkeletonLoader";
import ImageUpload from "@/components/Admin/ImageUpload";



interface ContactSettings {
  primaryPhone: string;
  emergencyPhone?: string;
  faxNumber?: string;
  adminEmail: string;
  address: string;
  businessHours: string;
  homepageImageUrl?: string;
  appointmentBookingUrl?: string;
  patientIntakeUrl?: string;
  whyChooseUsImageUrl?: string;
  aboutMissionImageUrl?: string;
  servicesPaymentImageUrl?: string;
}

interface SystemSettings {
  timezone: string;
  dateFormat: string;
}



interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiry: number;

  ipWhitelist: string;
}

export default function SettingsPage() {
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    primaryPhone: "",
    emergencyPhone: "",
    faxNumber: "",
    adminEmail: "",
    address: "",
    businessHours: "",
    homepageImageUrl: "",
    appointmentBookingUrl: "",
    patientIntakeUrl: "",
    whyChooseUsImageUrl: "",
    aboutMissionImageUrl: "",
    servicesPaymentImageUrl: "",
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    timezone: "America/Toronto",
    dateFormat: "MM/DD/YYYY",
  });



  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,

    ipWhitelist: "",
  });

  const [activeTab, setActiveTab] = useState<
    "contact" | "system" | "security" | "database"
  >("contact");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetchSettings();

    // Check URL for tab parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (
      tabParam &&
      ["contact", "system", "security", "database"].includes(
        tabParam
      )
    ) {
      setActiveTab(
        tabParam as
          | "contact"
          | "system"
          | "security"
          | "database"
      );
    }
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setContactSettings({
            primaryPhone: data.settings.contact.primaryPhone || "",
            emergencyPhone: data.settings.contact.emergencyPhone || "",
            faxNumber: data.settings.contact.faxNumber || "",
            adminEmail: data.settings.contact.adminEmail || "",
            address: data.settings.contact.address || "",
            businessHours: data.settings.contact.businessHours || "",
            homepageImageUrl: data.settings.contact.homepageImageUrl || "",
            appointmentBookingUrl: data.settings.contact.appointmentBookingUrl || "",
            patientIntakeUrl: data.settings.contact.patientIntakeUrl || "",
            whyChooseUsImageUrl: data.settings.contact.whyChooseUsImageUrl || "",
            aboutMissionImageUrl: data.settings.contact.aboutMissionImageUrl || "",
            servicesPaymentImageUrl: data.settings.contact.servicesPaymentImageUrl || "",
          });
          setSystemSettings({
            timezone: data.settings.system.timezone || "America/Toronto",
            dateFormat: data.settings.system.dateFormat || "MM/DD/YYYY",
          });
          
          setSecuritySettings({
            sessionTimeout: data.settings.security.sessionTimeout || 30,
            maxLoginAttempts: data.settings.security.maxLoginAttempts || 5,
            passwordExpiry: data.settings.security.passwordExpiry || 90,
            ipWhitelist: data.settings.security.ipWhitelist || "",
          });
        }
      } else {
        console.error("Failed to fetch settings:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const settingsData = {
        contact: contactSettings,
        system: systemSettings,

        security: securitySettings,
      };

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage({
            type: "success",
            text: data.message || "Settings saved successfully!",
          });
          
          // Clear appointment URLs cache to force refresh
          if (typeof window !== 'undefined') {
            // Dispatch a custom event to notify other components to refresh their cache
            window.dispatchEvent(new CustomEvent('settingsUpdated'));
          }
          // Update local state with returned settings
          if (data.settings) {
            setContactSettings({
              primaryPhone: data.settings.contact.primaryPhone || "",
              emergencyPhone: data.settings.contact.emergencyPhone || "",
              faxNumber: data.settings.contact.faxNumber || "",
              adminEmail: data.settings.contact.adminEmail || "",
              address: data.settings.contact.address || "",
              businessHours: data.settings.contact.businessHours || "",
              homepageImageUrl: data.settings.contact.homepageImageUrl || "",
                              appointmentBookingUrl: data.settings.contact.appointmentBookingUrl || "",
                patientIntakeUrl: data.settings.contact.patientIntakeUrl || "",
                whyChooseUsImageUrl: data.settings.contact.whyChooseUsImageUrl || "",
                aboutMissionImageUrl: data.settings.contact.aboutMissionImageUrl || "",
                servicesPaymentImageUrl: data.settings.contact.servicesPaymentImageUrl || "",
              });
            setSystemSettings({
              timezone: data.settings.system.timezone || "America/Toronto",
              dateFormat: data.settings.system.dateFormat || "MM/DD/YYYY",
            });

            setSecuritySettings({
              sessionTimeout: data.settings.security.sessionTimeout || 30,
              maxLoginAttempts: data.settings.security.maxLoginAttempts || 5,
              passwordExpiry: data.settings.security.passwordExpiry || 90,
              ipWhitelist: data.settings.security.ipWhitelist || "",
            });
          }
        } else {
          throw new Error(data.error || "Failed to save settings");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Settings save error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/database/test");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage({
            type: "success",
            text: `Database connection successful! Response time: ${data.responseTime || "N/A"}`,
          });
        } else {
          throw new Error(data.error || "Database connection test failed");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Database connection failed");
      }
    } catch (error) {
      console.error("Database test error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Database connection test failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setBackupLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/backup/database");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage({
            type: "success",
            text: `Database backup created successfully! File: ${data.filename}`,
          });
        } else {
          throw new Error(data.error || "Backup creation failed");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backup creation failed");
      }
    } catch (error) {
      console.error("Backup error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Backup creation failed",
      });
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Settings className="h-4 w-4 mr-2" />
            System Configuration
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                System Settings
              </h1>
              <p className="text-gray-600">
                Configure system settings and contact information
              </p>
            </div>

            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={fetchSettings}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("contact")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "contact"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Phone className="h-4 w-4 inline mr-2" />
              Contact Information
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "system"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Globe className="h-4 w-4 inline mr-2" />
              System
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("database")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "database"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Database className="h-4 w-4 inline mr-2" />
              Database
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone Number *
                  </label>
                  <input
                    type="text"
                    value={contactSettings.primaryPhone}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        primaryPhone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="249 806 0128"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Main contact number displayed throughout the site
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactSettings.emergencyPhone || ""}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        emergencyPhone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="911"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Emergency contact number (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fax Number
                  </label>
                  <input
                    type="text"
                    value={contactSettings.faxNumber || ""}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        faxNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="249 806 0129"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Fax number (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={contactSettings.adminEmail}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        adminEmail: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@zenithmedical.ca"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Primary administrative contact email
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    value={contactSettings.address}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Business address displayed on contact page and emails
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours *
                  </label>
                  <input
                    type="text"
                    value={contactSettings.businessHours}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        businessHours: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mon-Fri 8AM-6PM, Sat 9AM-2PM"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Business hours displayed to patients
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Homepage Hero Image
                  </label>
                  <div className="space-y-4">
                    {contactSettings.homepageImageUrl && (
                      <div className="relative">
                        <Image
                          src={contactSettings.homepageImageUrl}
                          alt="Current homepage image"
                          width={400}
                          height={192}
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    <ImageUpload
                      uploadType="general"
                      imageType="hero"
                      category="homepage"
                      currentImageUrl={contactSettings.homepageImageUrl}
                      onUploadSuccess={(result: { secure_url: string }) => {
                        setContactSettings((prev) => ({
                          ...prev,
                          homepageImageUrl: result.secure_url,
                        }));
                      }}
                      onUploadError={(error: string) => {
                        setMessage({
                          type: "error",
                          text: `Image upload failed: ${error}`,
                        });
                      }}
                      maxFileSize={5}
                      allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                      className="w-full"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Hero image displayed on the homepage. Recommended size: 1200x600px or larger.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Booking URL
                  </label>
                  <input
                    type="url"
                    value={contactSettings.appointmentBookingUrl || ""}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        appointmentBookingUrl: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://zenithmedical.cortico.ca/"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    URL for the appointment booking system
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Intake URL
                  </label>
                  <input
                    type="url"
                    value={contactSettings.patientIntakeUrl || ""}
                    onChange={(e) =>
                      setContactSettings((prev) => ({
                        ...prev,
                        patientIntakeUrl: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ocean.cognisantmd.com/eRequest/fc7408b9-fa27-4d25-87ea-c403cd903227"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    URL for the patient intake form
                  </p>
                </div>

                {/* Why Choose Us Section Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why Choose Us Section Image
                  </label>
                  {contactSettings.whyChooseUsImageUrl && (
                    <div className="mb-4">
                      <img
                        src={contactSettings.whyChooseUsImageUrl}
                        alt="Why Choose Us Section"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <ImageUpload
                    uploadType="general"
                    imageType="section"
                    category="why-choose-us"
                    currentImageUrl={contactSettings.whyChooseUsImageUrl}
                    onUploadSuccess={(result: { secure_url: string }) => {
                      setContactSettings((prev) => ({
                        ...prev,
                        whyChooseUsImageUrl: result.secure_url,
                      }));
                    }}
                    onUploadError={(error: string) => {
                      setMessage({
                        type: "error",
                        text: `Image upload failed: ${error}`,
                      });
                    }}
                    maxFileSize={5}
                    allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                    className="w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Image for the "Why Choose Us" section on the homepage. Recommended size: 600x400px or larger.
                  </p>
                </div>

                {/* About Mission Section Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Mission Section Image
                  </label>
                  {contactSettings.aboutMissionImageUrl && (
                    <div className="mb-4">
                      <img
                        src={contactSettings.aboutMissionImageUrl}
                        alt="About Mission Section"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <ImageUpload
                    uploadType="general"
                    imageType="section"
                    category="about-mission"
                    currentImageUrl={contactSettings.aboutMissionImageUrl}
                    onUploadSuccess={(result: { secure_url: string }) => {
                      setContactSettings((prev) => ({
                        ...prev,
                        aboutMissionImageUrl: result.secure_url,
                      }));
                    }}
                    onUploadError={(error: string) => {
                      setMessage({
                        type: "error",
                        text: `Image upload failed: ${error}`,
                      });
                    }}
                    maxFileSize={5}
                    allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                    className="w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Image for the "Our Mission" section on the about page. Recommended size: 600x400px or larger.
                  </p>
                </div>

                {/* Services Payment Section Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Payment Section Image
                  </label>
                  {contactSettings.servicesPaymentImageUrl && (
                    <div className="mb-4">
                      <img
                        src={contactSettings.servicesPaymentImageUrl}
                        alt="Services Payment Section"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <ImageUpload
                    uploadType="general"
                    imageType="section"
                    category="services-payment"
                    currentImageUrl={contactSettings.servicesPaymentImageUrl}
                    onUploadSuccess={(result: { secure_url: string }) => {
                      setContactSettings((prev) => ({
                        ...prev,
                        servicesPaymentImageUrl: result.secure_url,
                      }));
                    }}
                    onUploadError={(error: string) => {
                      setMessage({
                        type: "error",
                        text: `Image upload failed: ${error}`,
                      });
                    }}
                    maxFileSize={5}
                    allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                    className="w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Image for the payment options section on the services page. Recommended size: 600x400px or larger.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                System Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={systemSettings.timezone}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/Toronto">
                      Eastern Time (America/Toronto)
                    </option>
                    <option value="America/Vancouver">
                      Pacific Time (America/Vancouver)
                    </option>
                    <option value="America/Edmonton">
                      Mountain Time (America/Edmonton)
                    </option>
                    <option value="America/Winnipeg">
                      Central Time (America/Winnipeg)
                    </option>
                    <option value="America/Halifax">
                      Atlantic Time (America/Halifax)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={systemSettings.dateFormat}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        dateFormat: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}



          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Security Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value) || 30,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="5"
                    max="480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        maxLoginAttempts: parseInt(e.target.value) || 5,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="3"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        passwordExpiry: parseInt(e.target.value) || 90,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="30"
                    max="365"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Whitelist
                  </label>
                  <input
                    type="text"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        ipWhitelist: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="192.168.1.1, 10.0.0.1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Comma-separated IP addresses (optional)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === "database" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Database Management
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Database Connection Test
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Test the connection to the database
                  </p>
                  <button
                    onClick={testDatabaseConnection}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Test Connection
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Database Backup
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create a backup of the database
                  </p>
                  <button
                    onClick={createBackup}
                    disabled={backupLoading}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {backupLoading ? "Creating Backup..." : "Create Backup"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
