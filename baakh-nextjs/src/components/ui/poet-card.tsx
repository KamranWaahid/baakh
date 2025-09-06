import { motion } from "framer-motion";
import { Edit, Trash2, Eye, EyeOff, Star, StarOff, Calendar, MapPin, Tag, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PoetAvatar } from "@/components/ui/poet-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Poet {
  id: string;
  poet_slug: string;
  english_name: string;
  english_laqab?: string;
  english_tagline?: string;
  english_details?: string;
  sindhi_name?: string;
  sindhi_laqab?: string;
  sindhi_tagline?: string;
  birth_date?: string;
  death_date?: string;
  birth_place?: string;
  death_place?: string;
  tags?: string[];
  file_url?: string | null;
  is_featured?: boolean;
  is_hidden?: boolean;
  created_at: string;
  updated_at: string;
}

interface PoetCardProps {
  poet: Poet;
  index: number;
  isSindhi?: boolean;
  onToggleFeatured: (poetId: string) => void;
  onToggleHidden: (poetId: string) => void;
  onDelete: (poetId: string) => void;
}

export function PoetCard({ 
  poet, 
  index, 
  isSindhi = false,
  onToggleFeatured, 
  onToggleHidden, 
  onDelete 
}: PoetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full flex flex-col ${
        poet.is_hidden ? 'opacity-75' : ''
      }`}>
        {/* Featured Badge - Top Right */}
        {poet.is_featured && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 shadow-lg px-3 py-1.5 text-xs font-medium">
              <Star className="w-3 h-3 mr-1.5 fill-current" />
              Featured
            </Badge>
          </div>
        )}

        <CardContent className="p-0 flex flex-col h-full">
          {/* Header with Avatar and Basic Info */}
          <div className="p-6 pb-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <PoetAvatar
                poetName={isSindhi ? (poet.sindhi_name || poet.english_name) : poet.english_name}
                imageUrl={poet.file_url}
                size="lg"
                showRing={false}
                className="shadow-sm"
                isSindhi={isSindhi}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground text-xl leading-tight mb-1">
                  {poet.english_name}
                </h3>
                {poet.sindhi_name && (
                  <p className="text-sm text-muted-foreground font-medium leading-tight sindhi-text" dir="rtl">
                    {poet.sindhi_name}
                  </p>
                )}
                {poet.english_laqab && (
                  <p className="text-sm text-muted-foreground/80 italic leading-tight">
                    {poet.english_laqab}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content - Flexible */}
          <div className="px-6 pb-4 flex-1">
            {poet.english_tagline && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                {poet.english_tagline}
              </p>
            )}
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
              {(poet.birth_date || poet.death_date) && (
                <span className="inline-flex items-center gap-1.5 bg-muted/40 px-2.5 py-1.5 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                  {poet.birth_date || '?'}–{poet.death_date || '?'}
                </span>
              )}
              {poet.birth_place && (
                <span className="inline-flex items-center gap-1.5 bg-muted/40 px-2.5 py-1.5 rounded-md">
                  <MapPin className="w-3.5 h-3.5" />
                  {poet.birth_place}
                </span>
              )}
            </div>

            {/* Tags */}
            {poet.tags && poet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {poet.tags.slice(0, 3).map((tag, tagIndex) => (
                  <Badge 
                    key={`${poet.id}-tag-${tagIndex}-${tag}`} 
                    variant="outline" 
                    className="text-xs bg-muted/30 border-muted-foreground/20 px-2 py-1"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {poet.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground/70 border-muted-foreground/20 px-2 py-1">
                    +{poet.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions Bar - Clean and Minimal */}
          <div className="border-t border-border/40 bg-muted/10 px-6 py-4 mt-auto flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                {poet.is_hidden && (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30 px-2.5 py-1.5">
                    <EyeOff className="w-3 h-3 mr-1.5" />
                    Hidden
                  </Badge>
                )}
              </div>
              
              {/* Actions Menu */}
              <div className="flex items-center gap-2">
                {/* Quick Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFeatured(poet.id)}
                  className={`h-8 px-3 rounded-md transition-all duration-200 ${
                    poet.is_featured 
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                      : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-50'
                  }`}
                  title={poet.is_featured ? 'Remove from featured' : 'Mark as featured'}
                >
                  {poet.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                </Button>
                
                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/poets/${poet.id}`} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Poet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onToggleHidden(poet.id)}
                      className="cursor-pointer"
                    >
                      {poet.is_hidden ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                      {poet.is_hidden ? 'Show Poet' : 'Hide Poet'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(poet.id)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Poet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
