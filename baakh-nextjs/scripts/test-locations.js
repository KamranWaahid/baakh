/*
  Quick DB test for location tables. Usage:
  node scripts/test-locations.js "Larkana" "Sindh"
*/

// Load env from .env.local or .env if present
try {
  require('dotenv').config({ path: '.env.local' });
  require('dotenv').config();
} catch (_) {}

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const [cityArg = 'Larkana', provinceArg = 'Sindh'] = process.argv.slice(2);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log('[test] Searching location_cities for:', cityArg);
  const { data: cities, error: cityErr } = await supabase
    .from('location_cities')
    .select(
      'id, city_name, lang, province_id, location_provinces:province_id ( id, province_name, lang )'
    )
    .ilike('city_name', `%${cityArg}%`)
    .order('lang', { ascending: true });
  if (cityErr) console.error('[test] cityErr:', cityErr);
  console.log('[test] cities count:', cities ? cities.length : 0);
  if (cities) {
    for (const c of cities) {
      console.log('[city]', { id: c.id, city_name: c.city_name, lang: c.lang, province_id: c.province_id, province: c.location_provinces?.province_name, province_lang: c.location_provinces?.lang });
    }
  }

  console.log('[test] Searching location_provinces for:', provinceArg);
  const { data: provinces, error: provErr } = await supabase
    .from('location_provinces')
    .select('id, province_name, lang, country_id')
    .ilike('province_name', `%${provinceArg}%`)
    .order('lang', { ascending: true });
  if (provErr) console.error('[test] provErr:', provErr);
  console.log('[test] provinces count:', provinces ? provinces.length : 0);
  if (provinces) {
    for (const p of provinces) {
      console.log('[prov]', { id: p.id, province_name: p.province_name, lang: p.lang, country_id: p.country_id });
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


