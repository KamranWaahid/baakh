'use client';

import { SmartText, SmartHeading, NumberText } from './SmartText';

export function SmartFontDemo() {
  return (
    <div className="p-lg bg-white rounded-lg shadow border">
      <h3 className="text-h3 font-semibold mb-lg">Smart Font Detection Demo</h3>
      
      <div className="space-y-lg">
        {/* Pure Sindhi Text */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Pure Sindhi Text (uses font-sindhi):</div>
          <SmartText className="text-body">سنڌي شاعري</SmartText>
        </div>
        
        {/* Pure English Text */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Pure English Text (uses font-inter):</div>
          <SmartText className="text-body">English Poetry</SmartText>
        </div>
        
        {/* Numbers */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Numbers (uses font-inter):</div>
          <SmartText className="text-body">123, 456.78, 90%</SmartText>
        </div>
        
        {/* Mixed Content */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Mixed Content (smart detection):</div>
          <SmartText className="text-body" processMixed>
            سنڌي شاعري 123 ۽ English text
          </SmartText>
        </div>
        
        {/* Headings with Smart Detection */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Smart Headings:</div>
          <SmartHeading level={1}>سنڌي شاعري</SmartHeading>
          <SmartHeading level={2}>English Poetry</SmartHeading>
          <SmartHeading level={3}>Mixed Content 123</SmartHeading>
        </div>
        
        {/* Number Text Component */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Number Text Component:</div>
          <div className="text-body">
            <SmartText>سنڌي </SmartText>
            <NumberText>123</NumberText>
            <SmartText> متن</SmartText>
          </div>
        </div>
        
        {/* Test Cases */}
        <div>
          <div className="text-caption text-gray-600 mb-sm">Test Cases:</div>
          <div className="space-y-sm">
            <div><SmartText>سنڌي</SmartText> - Should use Sindhi font</div>
            <div><SmartText>English</SmartText> - Should use Inter font</div>
            <div><SmartText>123</SmartText> - Should use Inter font</div>
            <div><SmartText>سنڌي 123</SmartText> - Should use Inter font (mixed content)</div>
            <div><SmartText>English 123</SmartText> - Should use Inter font</div>
            <div><SmartText>سنڌي English</SmartText> - Should use Inter font (mixed content)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartFontDemo;
