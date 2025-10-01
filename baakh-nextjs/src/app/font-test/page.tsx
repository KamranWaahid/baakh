'use client';

export default function FontTestPage() {
  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Sindhi Font Test Page</h1>
        
        <div className="space-y-6">
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Default Sindhi Text</h2>
            <p className="text-lg" lang="sd">
              سنڌي شاعري ۽ ادب جي تاريخ وڏي پراڻي آهي. سنڌ جي شاعرن ۽ اديبن سنڌي ٻولي ۾ ڪيترائي شاندار ڪم ڪيا آهن.
            </p>
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">With Font Classes</h2>
            <p className="text-lg font-sindhi">
              سنڌي شاعري ۽ ادب جي تاريخ وڏي پراڻي آهي. سنڌ جي شاعرن ۽ اديبن سنڌي ٻولي ۾ ڪيترائي شاندار ڪم ڪيا آهن.
            </p>
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Auto Sindhi Font</h2>
            <p className="text-lg auto-sindhi-font">
              سنڌي شاعري ۽ ادب جي تاريخ وڏي پراڻي آهي. سنڌ جي شاعرن ۽ اديبن سنڌي ٻولي ۾ ڪيترائي شاندار ڪم ڪيا آهن.
            </p>
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">RTL Direction</h2>
            <p className="text-lg" dir="rtl">
              سنڌي شاعري ۽ ادب جي تاريخ وڏي پراڻي آهي. سنڌ جي شاعرن ۽ اديبن سنڌي ٻولي ۾ ڪيترائي شاندار ڪم ڪيا آهن.
            </p>
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Font Loading Status</h2>
            <div className="text-sm text-gray-600">
              <p>Check browser developer tools to see which fonts are loaded:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>MB Lateefi SK 2.0 (primary)</li>
                <li>ssread (fallback)</li>
                <li>Lateef (Google Fonts)</li>
                <li>Noto Naskh Arabic (Google Fonts)</li>
                <li>Noto Sans Arabic (Google Fonts)</li>
                <li>Amiri (Google Fonts)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
