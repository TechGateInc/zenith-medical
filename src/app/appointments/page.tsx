'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '../../components/Layout/Layout'
import Link from 'next/link'

interface BookingProvider {
  name: string
  type: string
  active: boolean
  isDefault: boolean
  isActiveProvider: boolean
  config: {
    hasApiKey: boolean
    redirectUrl?: string
    embedUrl?: string
  }
}

interface AppointmentData {
  appointmentType: string
  patientName: string
  patientEmail: string
  patientPhone: string
  appointmentDate: string
  appointmentTime: string
  notes: string
  preferredProvider?: string
  patientIntakeId?: string
}

const APPOINTMENT_TYPES = [
  {
    id: 'new-patient',
    name: 'New Patient Consultation',
    duration: '60 minutes',
    description: 'Comprehensive initial examination and health assessment',
    icon: '👤',
    requiresIntake: true
  },
  {
    id: 'follow-up',
    name: 'Follow-up Appointment',
    duration: '30 minutes',
    description: 'Check-up for existing patients',
    icon: '🔄',
    requiresIntake: false
  },
  {
    id: 'annual-physical',
    name: 'Annual Physical Exam',
    duration: '45 minutes',
    description: 'Comprehensive yearly health examination',
    icon: '🏥',
    requiresIntake: false
  },
  {
    id: 'preventive-care',
    name: 'Preventive Care Visit',
    duration: '30 minutes',
    description: 'Vaccinations, screenings, and preventive services',
    icon: '💉',
    requiresIntake: false
  },
  {
    id: 'chronic-care',
    name: 'Chronic Care Management',
    duration: '45 minutes',
    description: 'Diabetes, hypertension, and chronic condition management',
    icon: '📊',
    requiresIntake: false
  },
  {
    id: 'urgent-care',
    name: 'Urgent Care',
    duration: '30 minutes',
    description: 'Non-emergency urgent medical concerns',
    icon: '⚡',
    requiresIntake: false
  }
];

export default function AppointmentBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIntakeId = searchParams.get('intake');

  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    appointmentType: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    preferredProvider: '',
    patientIntakeId: patientIntakeId || undefined
  });

  const [providers, setProviders] = useState<BookingProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<BookingProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Fetch available booking providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/appointments/providers');
        const data = await response.json();
        
        if (data.success) {
          setProviders(data.providers.filter((p: BookingProvider) => p.active));
          // Auto-select default provider
          const defaultProvider = data.providers.find((p: BookingProvider) => p.isDefault && p.active);
          if (defaultProvider) {
            setSelectedProvider(defaultProvider);
            setAppointmentData(prev => ({ ...prev, preferredProvider: defaultProvider.type }));
          }
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };

    fetchProviders();
  }, []);

  const updateAppointmentData = (field: keyof AppointmentData, value: string) => {
    setAppointmentData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!appointmentData.appointmentType) {
          newErrors.appointmentType = 'Please select an appointment type';
        }
        break;
      case 2:
        if (!appointmentData.patientName.trim()) {
          newErrors.patientName = 'Name is required';
        }
        if (!appointmentData.patientEmail.trim()) {
          newErrors.patientEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(appointmentData.patientEmail)) {
          newErrors.patientEmail = 'Please enter a valid email address';
        }
        if (!appointmentData.patientPhone.trim()) {
          newErrors.patientPhone = 'Phone number is required';
        }
        break;
      case 3:
        if (!appointmentData.appointmentDate) {
          newErrors.appointmentDate = 'Please select a date';
        }
        if (!appointmentData.appointmentTime) {
          newErrors.appointmentTime = 'Please select a time';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitBooking = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();

      if (result.success) {
        setBookingSuccess(true);
        setBookingResult(result);
        setCurrentStep(4);
      } else {
        setErrors({ submit: result.error || 'Failed to book appointment' });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const selectedAppointmentType = APPOINTMENT_TYPES.find(type => type.id === appointmentData.appointmentType);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
              step === currentStep
                ? 'bg-blue-600 text-white border-blue-600'
                : step < currentStep
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-400 border-gray-300'
            }`}
          >
            {step < currentStep ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              step
            )}
          </div>
          {step < 4 && (
            <div
              className={`w-8 h-0.5 mx-2 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Appointment Type</h2>
        <p className="text-gray-600">Choose the type of appointment that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APPOINTMENT_TYPES.map((type) => (
          <div
            key={type.id}
            onClick={() => updateAppointmentData('appointmentType', type.id)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              appointmentData.appointmentType === type.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{type.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {type.duration}
                  </span>
                  {type.requiresIntake && !patientIntakeId && (
                    <span className="flex items-center text-orange-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Intake required
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {errors.appointmentType && (
        <p className="text-red-600 text-sm mt-2">{errors.appointmentType}</p>
      )}

      {selectedAppointmentType?.requiresIntake && !patientIntakeId && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-orange-800 font-medium">Patient Intake Required</h4>
              <p className="text-orange-700 text-sm mt-1">
                New patients need to complete a patient intake form before booking. This helps us provide you with the best possible care.
              </p>
              <Link
                href="/intake"
                className="inline-flex items-center mt-2 text-orange-600 hover:text-orange-800 font-medium text-sm"
              >
                Complete Patient Intake First
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>
        <p className="text-gray-600">Please provide your contact details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={appointmentData.patientName}
            onChange={(e) => updateAppointmentData('patientName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.patientName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.patientName && <p className="text-red-600 text-sm mt-1">{errors.patientName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={appointmentData.patientEmail}
            onChange={(e) => updateAppointmentData('patientEmail', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.patientEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
          {errors.patientEmail && <p className="text-red-600 text-sm mt-1">{errors.patientEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={appointmentData.patientPhone}
            onChange={(e) => updateAppointmentData('patientPhone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.patientPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
          {errors.patientPhone && <p className="text-red-600 text-sm mt-1">{errors.patientPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={appointmentData.notes}
            onChange={(e) => updateAppointmentData('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any specific concerns or questions you'd like to discuss..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Your Appointment</h2>
        <p className="text-gray-600">Select your preferred date and time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date *
          </label>
          <input
            type="date"
            value={appointmentData.appointmentDate}
            onChange={(e) => updateAppointmentData('appointmentDate', e.target.value)}
            min={getMinDate()}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.appointmentDate && <p className="text-red-600 text-sm mt-1">{errors.appointmentDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time *
          </label>
          <select
            value={appointmentData.appointmentTime}
            onChange={(e) => updateAppointmentData('appointmentTime', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.appointmentTime ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a time</option>
            {getTimeSlots().map(time => (
              <option key={time} value={time}>
                {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </option>
            ))}
          </select>
          {errors.appointmentTime && <p className="text-red-600 text-sm mt-1">{errors.appointmentTime}</p>}
        </div>
      </div>

      {selectedProvider && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-blue-800 font-medium">Booking Provider</h4>
              <p className="text-blue-700 text-sm mt-1">
                Your appointment will be scheduled through {selectedProvider.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Appointment Confirmed!</h2>
        <p className="text-gray-600 text-lg">
          Your appointment has been successfully scheduled.
        </p>
      </div>

      {bookingResult && (
        <div className="bg-gray-50 rounded-xl p-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{selectedAppointmentType?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {new Date(`2000-01-01T${appointmentData.appointmentTime}`).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Provider:</span>
              <span className="font-medium">{bookingResult.appointment?.provider}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-gray-600">
          You will receive a confirmation email with appointment details and instructions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Homepage
          </Link>
          <Link
            href="/contact"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Schedule Your Appointment
              </h1>
              <p className="text-gray-600 text-lg">
                Book your appointment in just a few simple steps
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {renderStepIndicator()}

            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentStep === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Previous
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      disabled={currentStep === 1 && selectedAppointmentType?.requiresIntake && !patientIntakeId}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        (currentStep === 1 && selectedAppointmentType?.requiresIntake && !patientIntakeId)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={submitBooking}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 