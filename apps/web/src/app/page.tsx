
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/zundenova-logo.png" alt="ZundeNova Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-gray-900">ZundeNova</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-green-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Agricultural AI Platform for
            <span className="text-green-600"> Africa</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Mobile-first agricultural support ecosystem providing AI-powered diagnostics, 
            e-commerce marketplace, expert consultations, and comprehensive farm management tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Get Started
            </button>
            <button className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16" id="features">
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Diagnostics</h3>
            <p className="text-gray-600">
              Advanced plant and livestock health diagnostics using computer vision and machine learning.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-100">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🛒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketplace</h3>
            <p className="text-gray-600">
              Connect with agro-dealers, access quality inputs, and manage your agricultural supply chain.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Consultations</h3>
            <p className="text-gray-600">
              Video consultations with veterinarians and agricultural experts for personalized advice.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Built for African Farmers
              </h3>
              <p className="text-gray-600 mb-6">
                Our platform is designed specifically for smallholder farmers across Africa, 
                with offline-first functionality, multilingual support, and integration with 
                local payment systems like M-Pesa.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Offline-first mobile app</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  </span>
                  <span className="text-gray-700">12+ African languages supported</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Mobile money integration</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-yellow-100 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-700 font-medium">Mobile App Coming Soon</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/zundenova-logo.png" alt="ZundeNova Logo" className="w-8 h-8" />
                <span className="text-xl font-bold">ZundeNova</span>
              </div>
              <p className="text-gray-400">
                Empowering African farmers with AI-powered agricultural solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Web Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ZundeNova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
