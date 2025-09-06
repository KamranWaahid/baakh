export default function FontTestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Font Test Page - Debugging Sindhi Fonts</h1>
      
      {/* Basic Font Tests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Font Tests</h2>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Default Font (Inter)</h3>
          <p>This is the default font: Hello World</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Amiri Font Test</h3>
          <p className="font-amiri text-xl">This should be Amiri: Hello World</p>
          <p className="font-amiri text-xl">سنڌي شاعري: من جي حياتيءَ ۾ تون آهين</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">MB Lateefi 2.0 Font Test</h3>
          <p className="font-sindhi text-xl">This should be MB Lateefi 2.0: Hello World</p>
          <p className="font-lateef text-xl">سنڌي متن: سنڌي ادب ۽ ثقافت</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Poetry Font Test</h3>
          <p className="font-poetry">This should be poetry font: Hello World</p>
          <p className="font-poetry">سنڌي شاعري: شاه عبداللطيف ڀٽائي</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Couplet Font Test</h3>
          <p className="font-couplet">This should be couplet font: Hello World</p>
          <p className="font-couplet">سنڌي شعر: تون جي حياتيءَ ۾ آءٌ آهيان</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Sindhi Font Test</h3>
          <p className="font-sindhi">This should be sindhi font: Hello World</p>
          <p className="font-sindhi">سنڌي فونٽ: سنڌي ثقافت جو خزانو</p>
        </div>
      </div>
      
      {/* CSS Variables Debug */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">CSS Variables Debug</h2>
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-2">CSS Variables</h3>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>--font-amiri:</strong> <span className="font-amiri">Amiri Test</span></p>
            <p><strong>--font-sindhi:</strong> <span className="font-sindhi">MB Lateefi 2.0 Test</span></p>
            <p><strong>--font-inter:</strong> <span className="font-inter">Inter Test</span></p>
            <p><strong>--font-source-serif:</strong> <span className="font-source-serif">Source Serif Test</span></p>
          </div>
        </div>
      </div>
      
      {/* Tailwind Classes Debug */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Tailwind Classes Debug</h2>
        
        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="text-lg font-medium mb-2">Tailwind Font Classes</h3>
          <div className="space-y-2">
            <p className="font-sans">font-sans: Hello World</p>
            <p className="font-serif">font-serif: Hello World</p>
            <p className="font-amiri">font-amiri: Hello World</p>
            <p className="font-lateef">font-lateef: Hello World</p>
            <p className="font-poetry">font-poetry: Hello World</p>
            <p className="font-couplet">font-couplet: Hello World</p>
            <p className="font-sindhi">font-sindhi: Hello World</p>
          </div>
        </div>
      </div>
      
      {/* RTL Test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">RTL Test</h2>
        
        <div className="p-4 border rounded-lg bg-green-50" dir="rtl">
          <h3 className="text-lg font-medium mb-2">RTL Text Direction</h3>
          <p className="font-amiri text-xl">سنڌي شاعريءَ جو وڏو خزانو</p>
          <p className="font-lateef text-lg">سنڌي ادب ۽ ثقافت</p>
        </div>
      </div>
    </div>
  );
}
