"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Plus,
  Flag,
  Mountain,
  Building2,
  ArrowUpRight
} from "lucide-react";

export default function LocationsAdminPage() {
  const [stats, setStats] = useState({
    countries: 0,
    provinces: 0,
    cities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/locations');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching location stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const locationTypes = [
    {
      title: "Countries",
      description: "Manage countries and their details",
      icon: Flag,
      href: "/admin/locations/countries",
      count: stats.countries,
      color: "bg-blue-500"
    },
    {
      title: "Provinces/States",
      description: "Manage provinces and states within countries",
      icon: Mountain,
      href: "/admin/locations/provinces",
      count: stats.provinces,
      color: "bg-green-500"
    },
    {
      title: "Cities",
      description: "Manage cities and their locations",
      icon: Building2,
      href: "/admin/locations/cities",
      count: stats.cities,
      color: "bg-purple-500"
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">
                  Locations Management
                </h1>
                <p className="text-[#6B6B6B] text-lg">
                  Manage countries, provinces, and cities for poet locations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-sm bg-[#F1F1F1] text-[#2B2B2B] border-[#E7E7E7]">
                  Total: {stats.countries + stats.provinces + stats.cities}
                </Badge>
                <Badge variant="outline" className="text-sm border-[#E5E5E5] text-[#6B6B6B]">
                  Multi-lingual
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="bg-white border-[#E5E5E5] hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 bg-[#F1F1F1] rounded w-20 mb-2 animate-pulse"></div>
                        <div className="h-8 bg-[#F1F1F1] rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F1F1F1] animate-pulse">
                        <div className="w-6 h-6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              Object.entries(stats).map(([key, value]) => (
                <Card key={key} className="bg-white border-[#E5E5E5] hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#6B6B6B] capitalize">
                          {key}
                        </p>
                        <p className="text-2xl font-bold text-[#1F1F1F]">{value}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F1F1F1]">
                        {key === 'countries' && <Flag className="w-6 h-6 text-[#2B2B2B]" />}
                        {key === 'provinces' && <Mountain className="w-6 h-6 text-[#2B2B2B]" />}
                        {key === 'cities' && <Building2 className="w-6 h-6 text-[#2B2B2B]" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Location Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locationTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white border-[#E5E5E5] hover:shadow-lg transition-all duration-200 group hover:border-[#D0D0D0]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${type.color} bg-opacity-10`}>
                        <type.icon className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`} />
                      </div>
                      <Badge variant="secondary" className="bg-[#F1F1F1] text-[#2B2B2B] border-[#E7E7E7]">{type.count}</Badge>
                    </div>
                    <CardTitle className="text-xl text-[#1F1F1F]">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-[#6B6B6B] mb-6">
                      {type.description}
                    </p>
                    <Button asChild className="w-full bg-[#1F1F1F] hover:bg-[#2B2B2B] text-white border-0 group-hover:shadow-md">
                      <Link href={type.href}>
                        <Plus className="w-4 h-4 mr-2" />
                        Manage {type.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <Card className="bg-white border-[#E5E5E5]">
              <CardHeader>
                <CardTitle className="text-[#1F1F1F]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" asChild className="border-[#E5E5E5] text-[#2B2B2B] hover:bg-[#F9F9F9] hover:border-[#D0D0D0]">
                    <Link href="/admin/locations/countries/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Country
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border-[#E5E5E5] text-[#2B2B2B] hover:bg-[#F9F9F9] hover:border-[#D0D0D0]">
                    <Link href="/admin/locations/provinces/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Province
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border-[#E5E5E5] text-[#2B2B2B] hover:bg-[#F9F9F9] hover:border-[#D0D0D0]">
                    <Link href="/admin/locations/cities/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New City
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
