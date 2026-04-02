import Layout from "../../components/Layout/Layout";
import {
  generateMetadata as generateSEOMetadata,
  PAGE_METADATA,
} from "../../lib/utils/seo";
import {
  getAppointmentBookingUrl,
  getPatientIntakeUrl,
} from "../../lib/utils/server-settings";

export const metadata = generateSEOMetadata({
  ...PAGE_METADATA.services,
  canonical: "/services",
});

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon?: string;
  orderIndex: number;
  published: boolean;
}

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

interface UninsuredCategory {
  key: string;
  name: string;
  items: UninsuredService[];
}

async function getServices(): Promise<Service[]> {
  return [
    {
      id: "1",
      title: "General Consultation",
      description:
        "Comprehensive health assessment and consultation with our experienced physicians.",
      features: [
        "Physical examination",
        "Health history review",
        "Personalized advice",
      ],
      orderIndex: 1,
      published: true,
    },
    {
      id: "2",
      title: "Vaccinations",
      description:
        "Routine and travel vaccinations to keep you and your family protected.",
      features: ["Flu shots", "Travel vaccines", "Childhood immunizations"],
      orderIndex: 2,
      published: true,
    },
    {
      id: "3",
      title: "Minor Procedures",
      description:
        "Quick and efficient minor surgical procedures performed in our clinic.",
      features: ["Sutures", "Wart removal", "Biopsies"],
      orderIndex: 3,
      published: true,
    },
  ];
}

async function getUninsuredServices(): Promise<UninsuredCategory[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/uninsured-services`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch {
    return [];
  }
}

export default async function Services() {
  const services = await getServices();
  const appointmentBookingUrl = await getAppointmentBookingUrl();
  const patientIntakeUrl = await getPatientIntakeUrl();
  const uninsuredCategories = await getUninsuredServices();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Comprehensive Healthcare Services
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Our Medical Services
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Comprehensive healthcare services in our efficient medical
                facility, designed to keep you and your family healthy
                throughout every stage of life.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Primary Services */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                  Primary Care
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                Primary Care Services
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Our core medical services provide the foundation for your
                ongoing health and wellness journey with comprehensive care for
                every age.
              </p>
            </div>

            {services.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                No services available at this time.
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-12">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border-b border-slate-200 pb-12 last:border-0"
                  >
                    <h3 className="text-2xl font-semibold text-slate-800 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed text-lg">
                      {service.description}
                    </p>
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 ml-1">
                        {service.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-slate-600"
                          >
                            <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Patient's Guide to Uninsured Services */}
        {uninsuredCategories.length > 0 && (
          <section className="mb-20">
            <div className="max-w-6xl mx-auto">
              {/* Section Badge */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-6">
                  <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
                    Fee Schedule
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                  Patient&apos;s Guide to Uninsured Services
                </h2>
                <div className="max-w-3xl mx-auto text-left">
                  <p className="text-lg text-slate-600 leading-relaxed mb-4">
                    Some services are not covered by OHIP. We use the Ontario
                    Medical Association&apos;s (OMA) suggested fees and common
                    practice as a guideline for our 2024 fee list.
                  </p>
                </div>
              </div>

              {/* Fee Categories */}
              <div className="space-y-10">
                {uninsuredCategories.map((category) => (
                  <div
                    key={category.key}
                    className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="text-xl font-bold text-slate-800">
                        {category.name}
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className={`px-6 py-4 flex justify-between items-start gap-4 ${
                            item.isInsured ? "bg-green-50" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-sm text-slate-500 mt-1">
                                {item.description}
                              </div>
                            )}
                            {item.isInsured && (
                              <div className="inline-flex items-center mt-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                <svg
                                  className="w-3 h-3 mr-1"
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
                                This is considered an insured service
                              </div>
                            )}
                          </div>
                          <div className="font-semibold text-blue-600 whitespace-nowrap">
                            {item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* Insured Services Note */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="font-semibold text-green-800 mb-3">
                Services Considered Insured by OHIP:
              </h4>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
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
                  Ministry of Health Forms
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-slate-50 rounded-xl p-8 mb-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Healthcare Access
              </span>
            </div>

            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight text-center">
                Ready to Experience Our Comprehensive Care?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed text-center">
                Schedule an appointment today and discover how our efficient
                medical facility and experienced team can serve your healthcare
                needs.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
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
                    Secure digital records with patient portal access.
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
                    Get real-time notifications about appointments and health
                    updates.
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={appointmentBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold rounded-lg transition-colors shadow-lg text-lg whitespace-nowrap"
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
                  Request Appointment
                </a>
                <a
                  href={patientIntakeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Registration Form
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
