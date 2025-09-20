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
  Mountain, 
  ArrowLeft,
  Save,
  Flag
} from "lucide-react";

interface ProvinceFormData {
  province_name: string;
  country_id: number | null;
  lang: string;
}

interface Country {
  id: number;
  countryname: string;
  abbreviation?: string;
  lang: string;
}

export default function CreateProvincePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState<ProvinceFormData>({
    province_name: "",
    country_id: null,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.province_name || !formData.country_id) {
      alert('Province name and country are required');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/admin/locations/provinces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create province');
      }

      // Redirect to provinces list
      router.push("/admin/locations/provinces");
    } catch (error) {
      console.error("Error creating province:", error);
      alert(error instanceof Error ? error.message : 'Failed to create province');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProvinceFormData, value: string | number | null) => {
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
                <Link href="/admin/locations/provinces">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Provinces
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Mountain className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Province/State</h1>
                <p className="text-muted-foreground">
                  Create a new province within a country
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Mountain className="w-5 h-5" />
                Province Information
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
                    Select the language for this province entry
                  </p>
                </div>

                {/* Country Selection */}
                <div className="space-y-2">
                  <Label htmlFor="country_id">Country *</Label>
                  <Select 
                    value={formData.country_id?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("country_id", value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
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
                    Select the country where this province is located
                  </p>
                </div>

                {/* Province Name */}
                <div className="space-y-2">
                  <Label htmlFor="province_name">Province/State Name *</Label>
                  <Input
                    id="province_name"
                    value={formData.province_name}
                    onChange={(e) => handleInputChange("province_name", e.target.value)}
                    placeholder={formData.lang === "en" ? "e.g., Sindh" : "مثال: سنڌ"}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the province name in {formData.lang === "en" ? "English" : "Sindhi"}
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={loading || !formData.province_name || !formData.country_id}
                    className="flex-1 bg-gray-900 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Province
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" asChild className="border border-gray-200 text-gray-700">
                    <Link href="/admin/locations/provinces">
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6 bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Tips for Adding Provinces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Flag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Country First</p>
                  <p className="text-sm text-muted-foreground">
                    Select the country first to ensure proper hierarchical organization.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mountain className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Province Names</p>
                  <p className="text-sm text-muted-foreground">
                    Use the official name of the province as it appears in official documents.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Flag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Multi-lingual Support</p>
                  <p className="text-sm text-muted-foreground">
                    You can add the same province in multiple languages. Each language entry will be a separate row in the database.
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