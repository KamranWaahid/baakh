export default function SindhiFontTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Sindhi Font Test Page</h1>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Test 1: Basic Font Classes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">1. Basic Font Classes</h2>
          <div className="space-y-2">
            <div className="font-sindhi-primary text-lg">
              <strong>font-sindhi-primary:</strong> سنڌي متن - This should use Lateef font
            </div>
            <div className="font-sindhi-nastaliq text-lg">
              <strong>font-sindhi-nastaliq:</strong> سنڌي متن - This should use Noto Nastaliq Arabic
            </div>
            <div className="font-sindhi-naskh text-lg">
              <strong>font-sindhi-naskh:</strong> سنڌي متن - This should use Amiri font
            </div>
          </div>
        </div>

        {/* Test 2: Utility Classes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">2. Utility Classes</h2>
          <div className="space-y-2">
            <div className="sindhi-text-lg">
              <strong>sindhi-text-lg:</strong> سنڌي متن - This should use Sindhi font
            </div>
            <div className="sindhi-text-base sindhi-font-medium">
              <strong>sindhi-text-base sindhi-font-medium:</strong> سنڌي متن - This should use medium weight
            </div>
          </div>
        </div>

        {/* Test 3: Auto-apply Classes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">3. Auto-apply Classes</h2>
          <div className="space-y-2">
            <div className="auto-sindhi-font text-lg">
              <strong>auto-sindhi-font:</strong> سنڌي متن - This should automatically use Sindhi fonts
            </div>
            <div className="auto-sindhi-font" dir="rtl">
              <strong>auto-sindhi-font + RTL:</strong> سنڌي متن RTL سان - This should automatically use Sindhi fonts
            </div>
          </div>
        </div>

        {/* Test 4: CSS Variables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">4. CSS Variables</h2>
          <div className="space-y-2">
            <div style={{ fontFamily: 'var(--font-sindhi-primary)' }} className="text-lg">
              <strong>CSS Variable --font-sindhi-primary:</strong> سنڌي متن - This should use CSS variable
            </div>
            <div style={{ fontFamily: 'var(--font-sindhi-nastaliq)' }} className="text-lg">
              <strong>CSS Variable --font-sindhi-nastaliq:</strong> سنڌي متن - This should use CSS variable
            </div>
          </div>
        </div>

        {/* Test 5: RTL Support */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">5. RTL Support</h2>
          <div className="space-y-2">
            <div className="sindhi-rtl text-lg" dir="rtl">
              <strong>sindhi-rtl:</strong> سنڌي متن RTL سان - This should use RTL styling
            </div>
          </div>
        </div>

        {/* Test 6: Font Loading Status */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">6. Font Loading Status</h2>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Check if the Sindhi text above looks different from regular text</div>
            <div>• If fonts are loaded, you should see different font styles</div>
            <div>• If fonts are not loaded, all text will look the same</div>
          </div>
        </div>

        {/* Test 7: Comparison with Regular Text */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">7. Comparison with Regular Text</h2>
          <div className="space-y-2">
            <div className="text-lg">
              <strong>Regular text:</strong> This is regular English text using system fonts
            </div>
            <div className="sindhi-text-lg">
              <strong>Sindhi text:</strong> سنڌي متن - This should look different from regular text
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
