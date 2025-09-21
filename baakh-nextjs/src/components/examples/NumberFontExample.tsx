'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  NumberFont, 
  MixedContentWithNumbers, 
  SmartNumber, 
  NumberText 
} from '@/components/ui/NumberFont';
import { MixedContent } from '@/components/ui/SindhiText';

export default function NumberFontExample() {
  const sampleTexts = [
    "سنڌي شاعري 2024 ۾ 1500 شعر",
    "English poetry with 2024 numbers",
    "Mixed content: سنڌي text with 123 numbers",
    "Pure numbers: 123456789",
    "Dates: 2024-01-15",
    "Statistics: 1,234,567 views"
  ];

  const numberExamples = [
    { value: "123", label: "Basic Number" },
    { value: "2024", label: "Year" },
    { value: "1,234,567", label: "Large Number" },
    { value: "99.99", label: "Decimal" },
    { value: "1st", label: "Ordinal" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Number Font System Demo</h1>
        <p className="text-gray-600">
          Demonstrates consistent number fonts across /sd and /en versions
        </p>
      </div>

      {/* Basic Number Font Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Number Font Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {numberExamples.map((example, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500 mb-2">{example.label}</div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">NumberFont: </span>
                    <NumberFont weight="medium" size="lg">
                      {example.value}
                    </NumberFont>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">SmartNumber: </span>
                    <SmartNumber weight="semibold">
                      {example.value}
                    </SmartNumber>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">NumberText: </span>
                    <NumberText config="basic">
                      {example.value}
                    </NumberText>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mixed Content Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Mixed Content with Numbers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sindhi + Numbers</h3>
            {sampleTexts.slice(0, 3).map((text, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Text: &quot;{text}&quot;</div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">MixedContentWithNumbers: </span>
                    <MixedContentWithNumbers text={text} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">MixedContent (legacy): </span>
                    <MixedContent text={text} useUniversalNumberFont={true} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">English + Numbers</h3>
            {sampleTexts.slice(3, 6).map((text, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Text: &quot;{text}&quot;</div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">MixedContentWithNumbers: </span>
                    <MixedContentWithNumbers text={text} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">MixedContent (legacy): </span>
                    <MixedContent text={text} useUniversalNumberFont={true} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Weight and Size Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Font Weight and Size Variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Font Weights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'].map((weight) => (
                <div key={weight} className="text-center p-2 border rounded">
                  <div className="text-xs text-gray-500 mb-1">{weight}</div>
                  <NumberFont weight={weight as any} size="lg">
                    2024
                  </NumberFont>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Font Sizes</h3>
            <div className="space-y-2">
              {['xs', 'sm', 'base', 'lg', 'xl', '2xl'].map((size) => (
                <div key={size} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-8">{size}:</span>
                  <NumberFont size={size as any} weight="medium">
                    123456789
                  </NumberFont>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predefined Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Predefined Number Font Configurations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { config: 'basic', label: 'Basic Numbers', example: '123' },
              { config: 'heading', label: 'Heading Numbers', example: '2024' },
              { config: 'small', label: 'Small Numbers', example: 'Page 5' },
              { config: 'large', label: 'Large Numbers', example: '1,234,567' },
              { config: 'tabular', label: 'Tabular Numbers', example: '99.99' }
            ].map((item) => (
              <div key={item.config} className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500 mb-2">{item.label}</div>
                <NumberText config={item.config as any}>
                  {item.example}
                </NumberText>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locale Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Consistent Fonts Across Locales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg" dir="rtl" lang="sd">
              <h3 className="text-lg font-semibold mb-4">Sindhi Version (/sd)</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">سنڌي متن 2024 ۾: </span>
                  <MixedContentWithNumbers text="سنڌي متن 2024 ۾ 1500 شعر" />
                </div>
                <div>
                  <span className="text-sm text-gray-600">صرف نمبر: </span>
                  <NumberFont weight="bold" size="lg">123456</NumberFont>
                </div>
                <div>
                  <span className="text-sm text-gray-600">مختلط مواد: </span>
                  <MixedContentWithNumbers text="سنڌي 123 English 456" />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg" dir="ltr" lang="en">
              <h3 className="text-lg font-semibold mb-4">English Version (/en)</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">English text 2024: </span>
                  <MixedContentWithNumbers text="English text 2024 with 1500 poems" />
                </div>
                <div>
                  <span className="text-sm text-gray-600">Numbers only: </span>
                  <NumberFont weight="bold" size="lg">123456</NumberFont>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Mixed content: </span>
                  <MixedContentWithNumbers text="English 123 سنڌي 456" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose max-w-none">
            <h3>Basic Usage</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// For pure numbers
<NumberFont weight="medium" size="lg">2024</NumberFont>

// For mixed content
<MixedContentWithNumbers text="سنڌي text with 123 numbers" />

// Smart detection
<SmartNumber>123</SmartNumber>

// Predefined configurations
<NumberText config="heading">2024</NumberText>`}
            </pre>

            <h3>CSS Classes</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Direct CSS classes
<span className="number-font">123</span>
<span className="number-font-bold number-text-lg">2024</span>

// For mixed content
<span className="universal-mixed">
  <span className="sindhi-text">سنڌي</span>
  <span className="number-font" data-number="true">123</span>
</span>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
