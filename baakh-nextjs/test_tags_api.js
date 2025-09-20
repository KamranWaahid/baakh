#!/usr/bin/env node

// Test script to verify the tags API is working correctly
// Run with: node test_tags_api.js

const BASE_URL = 'http://localhost:3001';

async function testTagsAPI() {
  console.log('🧪 Testing Tags API...\n');

  try {
    // Test English tags
    console.log('📝 Testing English tags...');
    const enResponse = await fetch(`${BASE_URL}/api/tags?lang=en&type=Poet`);
    const enData = await enResponse.json();
    
    if (enResponse.ok) {
      console.log('✅ English tags fetched successfully');
      console.log(`📊 Found ${enData.total} English tags`);
      console.log('📋 Sample English tags:');
      enData.tags.slice(0, 3).forEach(tag => {
        console.log(`   - ${tag.slug}: "${tag.title}"`);
      });
    } else {
      console.log('❌ Failed to fetch English tags:', enData.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test Sindhi tags
    console.log('📝 Testing Sindhi tags...');
    const sdResponse = await fetch(`${BASE_URL}/api/tags?lang=sd&type=Poet`);
    const sdData = await sdResponse.json();
    
    if (sdResponse.ok) {
      console.log('✅ Sindhi tags fetched successfully');
      console.log(`📊 Found ${sdData.total} Sindhi tags`);
      console.log('📋 Sample Sindhi tags:');
      sdData.tags.slice(0, 3).forEach(tag => {
        console.log(`   - ${tag.slug}: "${tag.title}"`);
      });
    } else {
      console.log('❌ Failed to fetch Sindhi tags:', sdData.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test specific tag mappings
    console.log('🔍 Testing specific tag mappings...');
    const testMappings = [
      { slug: 'women-poet', expectedEn: 'Women Poet', expectedSd: 'عورت شاعر' },
      { slug: 'progressive-poets', expectedEn: 'Progressive Poets', expectedSd: 'ترقي پسند شاعر' },
      { slug: 'post-partition-poets', expectedEn: 'Post-Partition Poets', expectedSd: 'تقسيم کانپوءِ جا شاعر' }
    ];

    for (const test of testMappings) {
      const enTag = enData.tags?.find(t => t.slug === test.slug);
      const sdTag = sdData.tags?.find(t => t.slug === test.slug);
      
      console.log(`\n🏷️  Testing ${test.slug}:`);
      console.log(`   English: ${enTag ? `"${enTag.title}"` : '❌ Not found'} ${enTag?.title === test.expectedEn ? '✅' : '❌'}`);
      console.log(`   Sindhi:  ${sdTag ? `"${sdTag.title}"` : '❌ Not found'} ${sdTag?.title === test.expectedSd ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Tags API test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the development server is running on port 3001');
    console.log('   Run: npm run dev');
  }
}

// Run the test
testTagsAPI();
