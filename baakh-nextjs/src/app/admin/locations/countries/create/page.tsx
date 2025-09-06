"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  Flag, 
  ArrowLeft,
  Save,
  Globe,
  Hash,
  Building2
} from "lucide-react";

interface CountryFormData {
  countryname: string;
  abbreviation: string;
  countrydesc: string;
  continent: string;
  capital_city: number | null;
  lang: string;
}

interface City {
  id: number;
  city_name: string;
  lang: string;
}

export default function CreateCountryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState<CountryFormData>({
    countryname: "",
    abbreviation: "",
    countrydesc: "",
    continent: "",
    capital_city: null,
    lang: "en"
  });

  const continents = [
    "Asia", "Europe", "Africa", "North America", "South America", "Australia", "Antarctica"
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "sd", name: "سنڌي" }
  ];

  // Fetch cities for capital city selection
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`/api/admin/locations/cities/list?lang=${formData.lang}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCities(data.cities);
          }
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    if (formData.lang) {
      fetchCities();
    }
  }, [formData.lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/locations/countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create country');
      }

      // Redirect to countries list
      router.push("/admin/locations/countries");
    } catch (error) {
      console.error("Error creating country:", error);
      alert(error instanceof Error ? error.message : 'Failed to create country');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CountryFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
                <Link href="/admin/locations/countries">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Countries
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Flag className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Country</h1>
                <p className="text-muted-foreground">
                  Create a new country with multi-lingual support
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Country Information
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
                    Select the language for this country entry
                  </p>
                </div>

                {/* Country Name */}
                <div className="space-y-2">
                  <Label htmlFor="countryname">Country Name *</Label>
                  <Input
                    id="countryname"
                    value={formData.countryname}
                    onChange={(e) => handleInputChange("countryname", e.target.value)}
                    placeholder={formData.lang === "en" ? "e.g., Pakistan" : "مثال: پاڪستان"}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the country name in {formData.lang === "en" ? "English" : "Sindhi"}
                  </p>
                </div>

                {/* Abbreviation */}
                <div className="space-y-2">
                  <Label htmlFor="abbreviation">Country Code</Label>
                  <Input
                    id="abbreviation"
                    value={formData.abbreviation}
                    onChange={(e) => handleInputChange("abbreviation", e.target.value.toUpperCase())}
                    placeholder="e.g., PK"
                    maxLength={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    ISO country code (e.g., PK for Pakistan)
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="countrydesc">Description</Label>
                  <Textarea
                    id="countrydesc"
                    value={formData.countrydesc}
                    onChange={(e) => handleInputChange("countrydesc", e.target.value)}
                    placeholder={formData.lang === "en" ? "e.g., Islamic Republic of Pakistan" : "مثال: اسلامي جمهوريه پاڪستان"}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Brief description of the country
                  </p>
                </div>

                {/* Continent */}
                <div className="space-y-2">
                  <Label htmlFor="continent">Continent</Label>
                  <Select value={formData.continent} onValueChange={(value) => handleInputChange("continent", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a continent" />
                    </SelectTrigger>
                    <SelectContent>
                      {continents.map((continent) => (
                        <SelectItem key={continent} value={continent}>
                          {continent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the continent where this country is located
                  </p>
                </div>

                {/* Capital City */}
                <div className="space-y-2">
                  <Label htmlFor="capital_city">Capital City (Optional)</Label>
                  <Select 
                    value={formData.capital_city?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("capital_city", value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a capital city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No capital city</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.city_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the capital city from existing cities in the same language
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading || !formData.countryname}
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
                        Create Country
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href="/admin/locations/countries">
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
              <CardTitle className="text-lg">Tips for Adding Countries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Multi-lingual Support</p>
                  <p className="text-sm text-muted-foreground">
                    You can add the same country in multiple languages. Each language entry will be a separate row in the database.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Flag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Country Codes</p>
                  <p className="text-sm text-muted-foreground">
                    Use standard ISO country codes (e.g., PK for Pakistan, IN for India) for consistency.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Capital City</p>
                  <p className="text-sm text-muted-foreground">
                    You can select a capital city from existing cities. Make sure the city is in the same language as the country.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Required Fields</p>
                  <p className="text-sm text-muted-foreground">
                    Only country name and language are required. Other fields can be filled in later.
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
