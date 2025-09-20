"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  BookOpen, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Globe
} from "lucide-react";

interface TimelinePeriod {
  id: string;
  period_slug: string;
  start_year: number;
  end_year?: number;
  is_ongoing: boolean;
  name: string;
  description?: string;
  characteristics: string[];
  color_code: string;
  icon_name?: string;
  is_featured: boolean;
  sort_order: number;
}

interface TimelineEvent {
  id: string;
  event_slug: string;
  event_date: string;
  event_year: number;
  is_approximate: boolean;
  title: string;
  description?: string;
  location?: string;
  event_type: string;
  importance_level: number;
  tags: string[];
  color_code?: string;
  icon_name?: string;
  is_featured: boolean;
  period?: {
    id: string;
    slug: string;
    name: string;
    color_code: string;
  };
  poet?: {
    id: string;
    slug: string;
    name: string;
    photo?: string;
  };
}

interface TimelineVisualizationProps {
  lang?: 'en' | 'sd';
  showEvents?: boolean;
  maxPeriods?: number;
  className?: string;
}

export default function TimelineVisualization({ 
  lang = 'en', 
  showEvents = true, 
  maxPeriods = 10,
  className = ""
}: TimelineVisualizationProps) {
  const [periods, setPeriods] = useState<TimelinePeriod[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchTimelineData();
  }, [lang]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      
      // Fetch periods
      const periodsResponse = await fetch(`/api/timeline/periods?lang=${lang}&featured=true&limit=${maxPeriods}`);
      const periodsData = await periodsResponse.json();
      
      if (periodsData.success) {
        setPeriods(periodsData.periods);
      }

      // Fetch events if needed
      if (showEvents) {
        const eventsResponse = await fetch(`/api/timeline/events?lang=${lang}&featured=true&limit=20`);
        const eventsData = await eventsResponse.json();
        
        if (eventsData.success) {
          setEvents(eventsData.events);
        }
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type: string) => {
    const icons = {
      historical: Globe,
      literary: BookOpen,
      cultural: Users,
      political: Globe,
      birth: Users,
      death: Clock,
      publication: BookOpen,
      award: Star
    };
    return icons[type as keyof typeof icons] || Globe;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      historical: "bg-blue-50 text-blue-700 border-blue-200",
      literary: "bg-purple-50 text-purple-700 border-purple-200",
      cultural: "bg-green-50 text-green-700 border-green-200",
      political: "bg-red-50 text-red-700 border-red-200",
      birth: "bg-pink-50 text-pink-700 border-pink-200",
      death: "bg-gray-50 text-gray-700 border-gray-200",
      publication: "bg-yellow-50 text-yellow-700 border-yellow-200",
      award: "bg-orange-50 text-orange-700 border-orange-200"
    };
    return colors[type as keyof typeof colors] || colors.historical;
  };

  const getImportanceColor = (level: number) => {
    const colors = {
      1: "bg-gray-100 text-gray-600",
      2: "bg-blue-100 text-blue-600",
      3: "bg-green-100 text-green-600",
      4: "bg-yellow-100 text-yellow-600",
      5: "bg-red-100 text-red-600"
    };
    return colors[level as keyof typeof colors] || colors[1];
  };

  const filteredEvents = selectedPeriod 
    ? events.filter(event => event.period?.id === selectedPeriod)
    : events;

  const paginatedPeriods = periods.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(periods.length / itemsPerPage);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">
            {lang === 'sd' ? 'تاریخ لوڊ ٿي رهي آهي...' : 'Loading timeline...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {lang === 'sd' ? 'سنڌي شاعري جي تاريخ' : 'Sindhi Poetry Timeline'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'sd' 
            ? 'سنڌي ادب جي عظيم رويت ۽ تاريخي دور' 
            : 'Explore the rich history and periods of Sindhi literature'
          }
        </p>
      </div>

      {/* Periods Navigation */}
      {periods.length > itemsPerPage && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground flex items-center">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Timeline Periods */}
      <div className="space-y-6">
        {paginatedPeriods.map((period, index) => (
          <motion.div
            key={period.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedPeriod === period.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPeriod(selectedPeriod === period.id ? null : period.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-6 h-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: period.color_code }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    {index < paginatedPeriods.length - 1 && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-100 mt-2"></div>
                    )}
                  </div>

                  {/* Period content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold">{period.name}</h3>
                      {period.is_featured && (
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {period.start_year} - {period.is_ongoing ? (lang === 'sd' ? 'هاڻوڪو' : 'Present') : period.end_year}
                        </span>
                      </div>
                    </div>

                    {period.description && (
                      <p className="text-muted-foreground mb-4">{period.description}</p>
                    )}

                    {period.characteristics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {period.characteristics.map((char, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Period events */}
                    {showEvents && selectedPeriod === period.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        <h4 className="font-medium text-sm text-muted-foreground">
                          {lang === 'sd' ? 'مهم واقعا' : 'Key Events'}
                        </h4>
                        {filteredEvents
                          .filter(event => event.period?.id === period.id)
                          .slice(0, 5)
                          .map((event) => {
                            const EventIcon = getEventTypeIcon(event.event_type);
                            return (
                              <div key={event.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    event.color_code ? '' : 'bg-primary/10'
                                  }`}
                                  style={{ backgroundColor: event.color_code || period.color_code + '20' }}
                                  >
                                    <EventIcon className="w-4 h-4" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-medium text-sm">{event.title}</h5>
                                    <Badge className={`text-xs ${getEventTypeColor(event.event_type)}`}>
                                      {event.event_type}
                                    </Badge>
                                    <Badge className={`text-xs ${getImportanceColor(event.importance_level)}`}>
                                      Level {event.importance_level}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {event.event_year} {event.is_approximate && (lang === 'sd' ? '(تقريبي)' : '(Approximate)')}
                                    {event.location && ` • ${event.location}`}
                                  </p>
                                  {event.description && (
                                    <p className="text-xs text-muted-foreground">{event.description}</p>
                                  )}
                                  {event.poet && (
                                    <div className="flex items-center space-x-1 mt-2">
                                      <Users className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{event.poet.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        {filteredEvents.filter(event => event.period?.id === period.id).length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            {lang === 'sd' ? 'ڪو به واقعو ناهي' : 'No events found for this period'}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button variant="outline" asChild>
          <a href="/admin/timeline">
            {lang === 'sd' ? 'سڀ تاريخ ڏسو' : 'View Full Timeline'}
          </a>
        </Button>
      </div>
    </div>
  );
}
