"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { 
  Flag, 
  ArrowLeft,
  Save,
  Globe,
  Hash,
  Loader2
} from "lucide-react";

interface CountryFormData {
  countryname: string;
  abbreviation: string;
  countrydesc: string;
  continent: string;
  lang: string;
}

export default function EditCountryPage() {
  const router = useRouter();
  const params = useParams();
  const countryId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<CountryFormData>({
    countryname: "",
    abbreviation: "",
    countrydesc: "",
    continent: "",
    lang: "en"
  });

  const continents = [
    "Asia", "Europe", "Africa", "North America", "South America", "Australia", "Antarctica"
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "sd", name: "سنڌي" },
    { code: "ur", name: "اردو" }
  ];

  // Load country data
  useEffect(() => {
    const loadCountry = async () => {
      try {
        const response = await fetch(`/api/admin/locations/countries/${countryId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const country = data.country;
            setFormData({
              countryname: country.countryname,
              abbreviation: country.abbreviation || "",
              countrydesc: country.countrydesc || "",
              continent: country.continent || "",
              lang: country.lang
            });
          }
        }
      } catch (error) {
        console.error("Error loading country:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (countryId) {
      loadCountry();
    }
  }, [countryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/locations/countries/${countryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update country');
      }
      
      // Redirect to countries list
      router.push("/admin/locations/countries");
    } catch (error) {
      console.error("Error updating country:", error);
      alert(error instanceof Error ? error.message : 'Failed to update country');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CountryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading country...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold">Edit Country</h1>
                <p className="text-muted-foreground">
                  Update country information
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
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
                    Enter the country name in {formData.lang === "en" ? "English" : formData.lang === "sd" ? "Sindhi" : "Urdu"}
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
                  <select
                    id="continent"
                    value={formData.continent}
                    onChange={(e) => handleInputChange("continent", e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a continent</option>
                    {continents.map((continent) => (
                      <option key={continent} value={continent}>
                        {continent}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Select the continent where this country is located
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={loading || !formData.countryname}
                    className="flex-1 bg-gray-900 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Country
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" asChild className="border border-gray-200 text-gray-700">
                    <Link href="/admin/locations/countries">
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
              <CardTitle className="text-lg text-gray-900">Editing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Language Changes</p>
                  <p className="text-sm text-muted-foreground">
                    Changing the language will create a new entry in that language. The original entry will remain unchanged.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Flag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Country Code</p>
                  <p className="text-sm text-muted-foreground">
                    Country codes should remain consistent across different language versions of the same country.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Required Fields</p>
                  <p className="text-sm text-muted-foreground">
                    Country name and language are required. Other fields can be left empty if not applicable.
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
