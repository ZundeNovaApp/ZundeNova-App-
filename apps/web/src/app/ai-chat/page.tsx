import AIChat from '@/components/AIChat';

export default function AIChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤖 AI Agricultural Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Get instant answers to your farming questions with our multilingual AI assistant
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AIChat />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🌍 Multilingual Support
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• English</li>
                <li>• Swahili</li>
                <li>• French</li>
                <li>• Spanish</li>
                <li>• And more...</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🌱 Topics I Can Help With
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Crop disease identification</li>
                <li>• Livestock health advice</li>
                <li>• Soil management tips</li>
                <li>• Weather planning</li>
                <li>• Pest control strategies</li>
                <li>• Farming best practices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
