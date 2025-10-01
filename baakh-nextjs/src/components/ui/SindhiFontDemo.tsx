'use client';

export function SindhiFontDemo() {
  return (
    <div className="p-lg bg-white rounded-lg shadow border">
      <h3 className="text-h3 font-semibold mb-lg">Modern Font System Demo</h3>
      
      <div className="space-y-lg">
        {/* Modern Typography Scale */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Display Text:</div>
          <div className="text-display font-sindhi">سنڌي شاعري</div>
        </div>
        
        <div>
          <div className="text-caption text-gray-600 mb-sm">Heading 1:</div>
          <div className="text-h1 font-sindhi">سنڌي شاعري</div>
        </div>
        
        <div>
          <div className="text-caption text-gray-600 mb-sm">Heading 2:</div>
          <div className="text-h2 font-sindhi">سنڌي شاعري</div>
        </div>
        
        <div>
          <div className="text-caption text-gray-600 mb-sm">Body Text:</div>
          <div className="text-body font-sindhi">سنڌي متن - This uses ssread font from sindhsalamat.com</div>
        </div>
        
        <div>
          <div className="text-caption text-gray-600 mb-sm">English Text:</div>
          <div className="text-body font-inter">English text - This uses Inter font</div>
        </div>
        
        <div>
          <div className="text-caption text-gray-600 mb-sm">Numbers:</div>
          <div className="text-body">
            <span className="font-sindhi">سنڌي </span>
            <span className="number">123</span>
            <span className="font-sindhi"> متن</span>
          </div>
        </div>
        
        {/* RTL Support */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">RTL Support:</div>
          <div className="font-sindhi text-body" dir="rtl">سنڌي متن RTL سان - This has RTL support</div>
        </div>
      </div>
    </div>
  );
}

export default SindhiFontDemo;
