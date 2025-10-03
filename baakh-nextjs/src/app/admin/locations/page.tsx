"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
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
        const response = await fetch('/api/admin/locations/');
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
        <AdminPageHeader
          title="Locations Management"
          subtitle="Locations Management"
          subtitleIcon={<Globe className="w-4 h-4" />}
          description="Manage countries, provinces, and cities for poet locations. Organize content with structured classification system."
          action={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Badge variant="secondary" className="text-sm bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                Total: {stats.countries + stats.provinces + stats.cities}
              </Badge>
              <Badge variant="outline" className="text-sm border border-[#E5E5E5] text-[#6B6B6B]">
                Multi-lingual
              </Badge>
            </div>
          }
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 bg-gray-100 rounded w-20 mb-2 animate-pulse"></div>
                        <div className="h-8 bg-gray-100 rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100 animate-pulse">
                        <div className="w-6 h-6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              Object.entries(stats).map(([key, value]) => (
                <Card key={key} className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">
                          {key}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100">
                        {key === 'countries' && <Flag className="w-6 h-6 text-gray-700" />}
                        {key === 'provinces' && <Mountain className="w-6 h-6 text-gray-700" />}
                        {key === 'cities' && <Building2 className="w-6 h-6 text-gray-700" />}
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
                <Card className="h-full bg-white border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${type.color} bg-opacity-10`}>
                        <type.icon className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`} />
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200">{type.count}</Badge>
                    </div>
                    <CardTitle className="text-xl text-gray-900">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-6">
                      {type.description}
                    </p>
                    <Button asChild className="w-full bg-gray-900 text-white border-0">
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
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" asChild className="border border-gray-200 text-gray-700">
                    <Link href="/admin/locations/countries/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Country
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border border-gray-200 text-gray-700">
                    <Link href="/admin/locations/provinces/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Province
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border border-gray-200 text-gray-700">
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
