// Test script for categories API
// Run this to verify the /sd/categories/[slug] endpoints are working

const BASE_URL = 'http://localhost:3000'; // Update this to your actual URL

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API...\n');

  try {
    // Test 1: Get all categories
    console.log('1️⃣ Testing GET /api/categories');
    const categoriesResponse = await fetch(`${BASE_URL}/api/categories?lang=sd`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesResponse.ok) {
      console.log('✅ Categories API working');
      console.log(`   Found ${categoriesData.items?.length || 0} categories`);
      console.log(`   Total: ${categoriesData.total || 0}`);
      
      if (categoriesData.items?.length > 0) {
        console.log('   Sample categories:');
        categoriesData.items.slice(0, 3).forEach(cat => {
          console.log(`   - ${cat.slug}: ${cat.sindhiName || cat.englishName}`);
        });
      }
    } else {
      console.log('❌ Categories API failed:', categoriesData.error);
    }
    console.log('');

    // Test 2: Get specific category (nazm)
    console.log('2️⃣ Testing GET /api/categories/nazm');
    const nazmResponse = await fetch(`${BASE_URL}/api/categories/nazm`);
    const nazmData = await nazmResponse.json();
    
    if (nazmResponse.ok) {
      console.log('✅ Nazm category API working');
      console.log(`   Category: ${nazmData.category?.sindhiName || nazmData.category?.englishName}`);
      console.log(`   Style: ${nazmData.category?.contentStyle}`);
      console.log(`   Languages: ${nazmData.category?.languages?.join(', ')}`);
    } else {
      console.log('❌ Nazm category API failed:', nazmData.error);
    }
    console.log('');

    // Test 3: Get poetry for nazm category
    console.log('3️⃣ Testing GET /api/categories/nazm/poetry');
    const nazmPoetryResponse = await fetch(`${BASE_URL}/api/categories/nazm/poetry?limit=5`);
    const nazmPoetryData = await nazmPoetryResponse.json();
    
    if (nazmPoetryResponse.ok) {
      console.log('✅ Nazm poetry API working');
      console.log(`   Found ${nazmPoetryData.items?.length || 0} poems`);
      console.log(`   Total: ${nazmPoetryData.total || 0}`);
      
      if (nazmPoetryData.items?.length > 0) {
        console.log('   Sample poems:');
        nazmPoetryData.items.slice(0, 3).forEach(poem => {
          console.log(`   - ${poem.title || poem.slug} by ${poem.poet}`);
          console.log(`     Tags: ${poem.tags?.join(', ')}`);
        });
      }
    } else {
      console.log('❌ Nazm poetry API failed:', nazmPoetryData.error);
    }
    console.log('');

    // Test 4: Test other categories
    const testCategories = ['ghazal', 'tairru', 'chhasitta'];
    for (const catSlug of testCategories) {
      console.log(`4️⃣ Testing GET /api/categories/${catSlug}/poetry`);
      const poetryResponse = await fetch(`${BASE_URL}/api/categories/${catSlug}/poetry?limit=3`);
      const poetryData = await poetryResponse.json();
      
      if (poetryResponse.ok) {
        console.log(`✅ ${catSlug} poetry API working`);
        console.log(`   Found ${poetryData.items?.length || 0} poems`);
        console.log(`   Total: ${poetryData.total || 0}`);
      } else {
        console.log(`❌ ${catSlug} poetry API failed:`, poetryData.error);
      }
      console.log('');
    }

    console.log('🎉 Categories API testing completed!');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the test
testCategoriesAPI();
