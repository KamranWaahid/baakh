"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface City {
  id: number;
  city_name: string;
  province?: {
    province_name: string;
  };
}

interface CitySearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function CitySearchDropdown({
  value,
  onChange,
  placeholder = "Search cities...",
  label,
  className = ""
}: CitySearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching cities from API...');
        
        const response = await fetch('/api/locations/cities/?lang=en');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch cities');
        }
        
        console.log('Cities fetched successfully:', result.cities.length);
        setCities(result.cities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Filter cities based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCities([]);
      return;
    }

    const filtered = cities.filter(city =>
      city.city_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.province?.province_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCities(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchQuery, cities]);

  // Handle city selection
  const handleCitySelect = (city: City) => {
    const displayName = `${city.city_name}${city.province ? `, ${city.province.province_name}` : ''}`;
    setSelectedCity(city);
    setSearchQuery(displayName); // Set the search query to show the selected city
    onChange(displayName);
    setIsOpen(false);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    // Always update the form value for manual input
    onChange(newValue);
    
    // If user is typing and it doesn't match selected city, clear selection
    if (selectedCity) {
      const selectedDisplayName = `${selectedCity.city_name}${selectedCity.province ? `, ${selectedCity.province.province_name}` : ''}`;
      if (!selectedDisplayName.toLowerCase().includes(newValue.toLowerCase())) {
        setSelectedCity(null);
      }
    }
    
    // Always allow manual input even if no cities in database
    setIsOpen(true);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedCity(null);
    setSearchQuery("");
    onChange("");
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize selected city from value prop
  useEffect(() => {
    if (value && !selectedCity) {
      setSearchQuery(value);
    }
  }, [value, selectedCity]);

  // Get the display value for the input
  const getDisplayValue = () => {
    if (selectedCity) {
      return `${selectedCity.city_name}${selectedCity.province ? `, ${selectedCity.province.province_name}` : ''}`;
    }
    return searchQuery;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
        <Input
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors"
        />
        {getDisplayValue() && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-[#F1F1F1]"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-sm text-[#6B6B6B]">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1F1F1F] mx-auto mb-2"></div>
                Loading cities...
              </div>
            ) : filteredCities.length > 0 ? (
              <div className="py-2">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-[#F4F4F5] transition-colors border-b border-[#F1F1F1] last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#6B6B6B] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#1F1F1F] truncate">
                          {city.city_name}
                        </div>
                        <div className="text-sm text-[#6B6B6B] truncate">
                          {city.province?.province_name || ''}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center text-sm text-[#6B6B6B]">
                No cities found matching &quot;{searchQuery}&quot;
              </div>
            ) : cities.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#6B6B6B]">
                <p className="mb-3">No cities available from database.</p>
                <p className="text-xs text-[#6B6B6B] mb-3">
                  You can type city names directly in the input field above.
                </p>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-[#6B6B6B]">
                Start typing to search cities
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
