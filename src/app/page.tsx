export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Zenith Medical Centre
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Professional healthcare services with modern patient care in a trusted, 
            clinical environment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg">
              Book Appointment
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
              Learn More
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 max-w-4xl mx-auto mb-8">
          <div className="bg-slate-50 rounded-t-lg -m-6 mb-6 p-6 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800">
              Welcome to Our Practice
            </h2>
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We provide comprehensive family medicine services in a modern, 
            professional environment. Our experienced team is dedicated to 
            delivering personalized healthcare solutions that meet your unique needs.
          </p>
          
          {/* Color Palette Demo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3"></div>
              <h3 className="font-semibold text-blue-800">Professional Blue</h3>
              <p className="text-sm text-blue-600">Trust & Reliability</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="w-16 h-16 bg-slate-600 rounded-full mx-auto mb-3"></div>
              <h3 className="font-semibold text-slate-800">Clinical Gray</h3>
              <p className="text-sm text-slate-600">Modern & Clean</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-3"></div>
              <h3 className="font-semibold text-gray-800">Sophisticated Silver</h3>
              <p className="text-sm text-gray-600">Professional Care</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="medical-gradient text-white py-8 px-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Book Your Appointment?</h3>
            <p className="mb-6 opacity-90">
              Start your healthcare journey with our professional medical team
            </p>
            <button className="bg-white text-blue-600 hover:bg-slate-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 