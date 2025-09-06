import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface Country {
  id: number;
  countryname: string;
  abbreviation: string | null;
  countrydesc: string | null;
  continent: string | null;
  capital_city: number | null;
  lang: string;
  created_at: string;
  updated_at: string;
}

interface CountryGroup {
  variants: Country[];
  primary: Country;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Countries API called');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const search = searchParams.get('search') || '';
    const lang = searchParams.get('lang') || 'all';
    const sortBy = searchParams.get('sortBy') || 'countryname';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    console.log('Query params:', { page, perPage, search, lang, sortBy, sortOrder });
    
    const offset = (page - 1) * perPage;
    
    const supabase = createAdminClient();
    console.log('Admin client created');
    
    // Build base query for count - get unique countries by name (not by lang)
    let countQuery = supabase
      .from('location_countries')
      .select('countryname', { count: 'exact', head: true })
      .is('deleted_at', null);
    
    // Apply search filter to count
    if (search) {
      countQuery = countQuery.or(`countryname.ilike.%${search}%,abbreviation.ilike.%${search}%,countrydesc.ilike.%${search}%`);
    }
    
    // Get distinct country names for count
    const { data: distinctCountries, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Count error:', countError);
      throw new Error(`Failed to get count: ${countError.message}`);
    }
    
    // Count unique countries (grouped by name, not by lang)
    const uniqueCountryNames = [...new Set(distinctCountries?.map((c: any) => c.countryname) || [])];
    const total = uniqueCountryNames.length;
    
    console.log('Count obtained:', total);
    
    // Build query for data - get all language variants
    let query = supabase
      .from('location_countries')
      .select(`
        id,
        countryname,
        abbreviation,
        countrydesc,
        continent,
        capital_city,
        lang,
        created_at,
        updated_at
      `)
      .is('deleted_at', null);
    
    // Apply search filter
    if (search) {
      query = query.or(`countryname.ilike.%${search}%,abbreviation.ilike.%${search}%,countrydesc.ilike.%${search}%`);
    }
    
    // Apply sorting and pagination to the main query
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    console.log('Getting countries data...');
    const { data: allCountries, error } = await query;
    
    if (error) {
      console.error('Error fetching countries:', error);
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }
    
    console.log('All countries fetched:', allCountries?.length || 0);
    
    // Group countries by name and apply pagination to grouped results
    const groupedCountries = new Map<string, CountryGroup>();
    
    allCountries?.forEach((country: Country) => {
      const key = country.countryname.toLowerCase();
      if (!groupedCountries.has(key)) {
        groupedCountries.set(key, {
          variants: [],
          primary: null as any
        });
      }
      
      const group = groupedCountries.get(key)!;
      group.variants.push(country);
      
      // Set primary variant (prefer current lang filter, then 'en', then first available)
      if (!group.primary) {
        group.primary = country;
      } else if (lang !== 'all' && country.lang === lang) {
        group.primary = country;
      } else if (group.primary.lang !== lang && country.lang === 'en') {
        group.primary = country;
      }
    });
    
    // Convert to array and sort by primary variant
    let sortedGroups = Array.from(groupedCountries.values());
    
    // Sort by primary variant's sort field
    sortedGroups.sort((a, b) => {
      const aValue = a.primary[sortBy as keyof Country] || '';
      const bValue = b.primary[sortBy as keyof Country] || '';
      
      if (sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    // Apply pagination to grouped results
    const paginatedGroups = sortedGroups.slice(offset, offset + perPage);
    
    // Get country IDs for related data
    const countryIds = paginatedGroups.flatMap(group => 
      group.variants.map((v: Country) => v.id)
    );
    
    let provincesCount: Record<number, number> = {};
    let citiesCount: Record<number, number> = {};
    
    if (countryIds.length > 0) {
      console.log('Getting province counts...');
      // Get province counts
      const { data: provinces, error: provincesError } = await supabase
        .from('location_provinces')
        .select('id, country_id')
        .in('country_id', countryIds)
        .is('deleted_at', null);
      
      if (provincesError) {
        console.error('Error getting provinces:', provincesError);
      } else {
        provinces?.forEach((p: any) => {
          provincesCount[p.country_id] = (provincesCount[p.country_id] || 0) + 1;
        });
      }
      
      console.log('Getting city counts...');
      // Get city counts (via provinces)
      const provinceIds = provinces?.map((p: any) => p.id) || [];
      if (provinceIds.length > 0) {
        const { data: cities, error: citiesError } = await supabase
          .from('location_cities')
          .select('province_id')
          .in('province_id', provinceIds)
          .is('deleted_at', null);
        
        if (citiesError) {
          console.error('Error getting cities:', citiesError);
        } else {
          cities?.forEach((c: any) => {
            const province = provinces?.find((p: any) => p.id === c.province_id);
            if (province) {
              citiesCount[province.country_id] = (citiesCount[province.country_id] || 0) + 1;
            }
          });
        }
      }
    }
    
    // Get capital city names
    const capitalCityIds = paginatedGroups.flatMap(group => 
      group.variants.filter((v: Country) => v.capital_city).map((v: Country) => v.capital_city!)
    );
    let capitalCityNames: Record<number, string> = {};
    
    if (capitalCityIds.length > 0) {
      console.log('Getting capital city names...');
      const { data: capitalCities, error: capitalCitiesError } = await supabase
        .from('location_cities')
        .select('id, city_name, lang')
        .in('id', capitalCityIds)
        .is('deleted_at', null);
      
      if (capitalCitiesError) {
        console.error('Error getting capital cities:', capitalCitiesError);
      } else {
        capitalCities?.forEach((city: any) => {
          capitalCityNames[city.id] = city.city_name;
        });
      }
    }
    
    // Build final response with grouped countries
    const enhancedCountries = paginatedGroups.map(group => {
      const primary = group.primary;
      const availableLanguages = group.variants.map((v: Country) => v.lang);
      
      // Apply language filter if specified
      if (lang !== 'all' && !availableLanguages.includes(lang)) {
        return null; // Skip this group if it doesn't have the requested language
      }
      
      // Get counts from all variants
      const totalProvinces = group.variants.reduce((sum: number, variant: Country) => 
        sum + (provincesCount[variant.id] || 0), 0
      );
      const totalCities = group.variants.reduce((sum: number, variant: Country) => 
        sum + (citiesCount[variant.id] || 0), 0
      );
      
      return {
        id: primary.id,
        countryname: primary.countryname,
        abbreviation: primary.abbreviation,
        countrydesc: primary.countrydesc,
        continent: primary.continent,
        capital_city: primary.capital_city,
        lang: primary.lang,
        created_at: primary.created_at,
        updated_at: primary.updated_at,
        provinces_count: totalProvinces,
        cities_count: totalCities,
        capital_city_name: primary.capital_city ? capitalCityNames[primary.capital_city] : null,
        available_languages: availableLanguages,
        language_count: availableLanguages.length
      };
    }).filter(Boolean); // Remove null entries
    
    console.log('Enhanced countries:', enhancedCountries.length);
    
    return NextResponse.json({
      success: true,
      countries: enhancedCountries,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    console.error('Error in countries API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch countries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryname, abbreviation, countrydesc, continent, capital_city, lang } = body;
    
    if (!countryname || !lang) {
      return NextResponse.json(
        { success: false, error: 'Country name and language are required' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // Check for duplicate country name in the same language
    const { data: existing } = await supabase
      .from('location_countries')
      .select('id')
      .eq('countryname', countryname.trim())
      .eq('lang', lang)
      .is('deleted_at', null)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A country with this name already exists in this language' },
        { status: 409 }
      );
    }
    
    const { data: country, error } = await supabase
      .from('location_countries')
      .insert({
        countryname: countryname.trim(),
        abbreviation: abbreviation?.toUpperCase().trim() || null,
        countrydesc: countrydesc?.trim() || null,
        continent: continent?.trim() || null,
        capital_city: capital_city || null,
        lang
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating country:', error);
      throw new Error('Failed to create country');
    }
    
    return NextResponse.json({
      success: true,
      country
    });
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create country' },
      { status: 500 }
    );
  }
}
