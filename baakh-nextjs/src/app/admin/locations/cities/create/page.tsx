"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  Building2, 
  ArrowLeft,
  Save,
  Mountain,
  Flag,
  Navigation
} from "lucide-react";

interface CityFormData {
  city_name: string;
  province_id: number | null;
  geo_lat: string;
  geo_long: string;
  lang: string;
}

interface Country {
  id: number;
  countryname: string;
  abbreviation?: string;
  lang: string;
}

interface Province {
  id: number;
  province_name: string;
  country_id: number;
  lang: string;
}

export default function CreateCityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CityFormData>({
    city_name: "",
    province_id: null,
    geo_lat: "",
    geo_long: "",
    lang: "en"
  });

  const languages = [
    { code: "en", name: "English" },
    { code: "sd", name: "سنڌي" }
  ];

  // Fetch countries for dropdown
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`/api/admin/locations/countries/list?lang=${formData.lang}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCountries(data.countries);
          }
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    if (formData.lang) {
      fetchCountries();
    }
  }, [formData.lang]);

  // Fetch provinces when country changes
  useEffect(() => {
    const fetchProvinces = async () => {
      if (!selectedCountryId) {
        setProvinces([]);
        return;
      }

      try {
        const response = await fetch(`/api/admin/locations/provinces/list?lang=${formData.lang}&country_id=${selectedCountryId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProvinces(data.provinces);
          }
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, [selectedCountryId, formData.lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.city_name || !formData.province_id) {
      alert('City name and province are required');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/admin/locations/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create city');
      }

      // Redirect to cities list
      router.push("/admin/locations/cities");
    } catch (error) {
      console.error("Error creating city:", error);
      alert(error instanceof Error ? error.message : 'Failed to create city');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CityFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryChange = (countryId: number | null) => {
    setSelectedCountryId(countryId);
    setFormData(prev => ({
      ...prev,
      province_id: null
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-6 pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/locations/cities">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cities
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New City</h1>
                <p className="text-muted-foreground">
                  Create a new city within a province
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                City Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Language Selection */}
                <div className="space-y-2">
                  <Label htmlFor="lang">Language *</Label>
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <Button
                        key={lang.code}
                        type="button"
                        variant={formData.lang === lang.code ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange("lang", lang.code)}
                        className="flex-1"
                      >
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select the language for this city entry
                  </p>
                </div>

                {/* Country Selection */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select 
                    value={selectedCountryId?.toString() || ""} 
                    onValueChange={(value) => handleCountryChange(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country first" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.countryname} {country.abbreviation && `(${country.abbreviation})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the country first to filter available provinces
                  </p>
                </div>

                {/* Province Selection */}
                <div className="space-y-2">
                  <Label htmlFor="province_id">Province/State *</Label>
                  <Select 
                    value={formData.province_id?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("province_id", value ? parseInt(value) : null)}
                    disabled={!selectedCountryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCountryId ? "Select a province" : "Select a country first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id.toString()}>
                          {province.province_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the province where this city is located
                  </p>
                </div>

                {/* City Name */}
                <div className="space-y-2">
                  <Label htmlFor="city_name">City Name *</Label>
                  <Input
                    id="city_name"
                    value={formData.city_name}
                    onChange={(e) => handleInputChange("city_name", e.target.value)}
                    placeholder={formData.lang === "en" ? "e.g., Karachi" : "مثال: ڪراچي"}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the city name in {formData.lang === "en" ? "English" : "Sindhi"}
                  </p>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="geo_lat">Latitude (Optional)</Label>
                    <Input
                      id="geo_lat"
                      value={formData.geo_lat}
                      onChange={(e) => handleInputChange("geo_lat", e.target.value)}
                      placeholder="e.g., 24.8607"
                    />
                    <p className="text-sm text-muted-foreground">
                      Decimal degrees (e.g., 24.8607)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="geo_long">Longitude (Optional)</Label>
                    <Input
                      id="geo_long"
                      value={formData.geo_long}
                      onChange={(e) => handleInputChange("geo_long", e.target.value)}
                      placeholder="e.g., 67.0011"
                    />
                    <p className="text-sm text-muted-foreground">
                      Decimal degrees (e.g., 67.0011)
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading || !formData.city_name || !formData.province_id}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create City
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href="/admin/locations/cities">
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tips for Adding Cities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Flag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Country First</p>
                  <p className="text-sm text-muted-foreground">
                    Select the country first, then the province. This ensures proper hierarchical organization.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mountain className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Province Selection</p>
                  <p className="text-sm text-muted-foreground">
                    The province dropdown will only show provinces from the selected country.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">City Names</p>
                  <p className="text-sm text-muted-foreground">
                    Use the official name of the city as it appears in official documents.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Coordinates</p>
                  <p className="text-sm text-muted-foreground">
                    Geographic coordinates are optional but useful for mapping applications. Use decimal degrees format.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
