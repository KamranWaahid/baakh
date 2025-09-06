"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AnniversaryBadgeProps {
  poetName: { en: string; sd: string };
  avatarUrl?: string;
  anniversaryType: 'birth' | 'death';
  date: string;
  isSindhi?: boolean;
  poetSlug?: string;
}

export default function AnniversaryBadge({ 
  poetName, 
  avatarUrl, 
  anniversaryType, 
  date,
  isSindhi = false,
  poetSlug
}: AnniversaryBadgeProps) {
  const isBirth = anniversaryType === 'birth';
  const emoji = isBirth ? '🎉' : '🕯️';
  const text = isBirth ? 'Birth Anniversary' : 'Death Anniversary';
  const sindhiText = isBirth ? 'سالگرھہ' : 'ورسي';
  
  // Add some dynamic styling based on anniversary type
  const badgeClasses = isBirth 
    ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800"
    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800";
  
  const textColorClasses = isBirth 
    ? "text-amber-600"
    : "text-blue-600";
  
  const starColorClasses = isBirth 
    ? "text-amber-500"
    : "text-blue-500";

  // Get the appropriate name based on language
  const displayName = isSindhi ? poetName.sd : poetName.en;
  
  const BadgeContent = () => (
    <>
      {/* Avatar */}
      <Avatar className="w-8 h-8 border border-border/20 bg-background shadow-sm">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className={cn(
          "text-sm font-medium text-foreground",
          isSindhi ? 'auto-sindhi-font' : ''
        )}>
          {displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      {/* Content */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <div className="flex flex-col items-start">
          <span className={`text-sm font-semibold ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {displayName}
          </span>
          <span className={`text-xs ${isSindhi ? 'auto-sindhi-font' : ''} ${textColorClasses}`}>
            {isSindhi ? sindhiText : text}
          </span>
        </div>
      </div>
      
      {/* Date */}
      <div className={`flex items-center gap-1 text-xs ${textColorClasses}`}>
        <Calendar className="w-3 h-3" />
        <span>{date}</span>
      </div>
      
      {/* Sparkle effect */}
      <Star className={`w-4 h-4 animate-pulse ${starColorClasses}`} />
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex justify-center mb-6"
    >
      {poetSlug ? (
        <Link href={`/${isSindhi ? 'sd' : 'en'}/poets/${poetSlug}`}>
          <Badge 
            variant="secondary" 
            className={`inline-flex items-center gap-3 px-4 py-3 border rounded-full transition-all duration-200 group cursor-pointer hover:scale-105 ${badgeClasses}`}
          >
            <BadgeContent />
          </Badge>
        </Link>
      ) : (
        <Badge 
          variant="secondary" 
          className={`inline-flex items-center gap-3 px-4 py-3 border rounded-full transition-all duration-200 group ${badgeClasses}`}
        >
          <BadgeContent />
        </Badge>
      )}
    </motion.div>
  );
}
