"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PoetAvatarProps {
  poetName: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRing?: boolean;
  onClick?: () => void;
  isSindhi?: boolean;
}

export function PoetAvatar({ 
  poetName, 
  imageUrl, 
  size = 'md', 
  className,
  showRing = true,
  onClick,
  isSindhi = false
}: PoetAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };

  const ringClasses = showRing ? 'ring-1 ring-border/30 hover:ring-border/50' : '';

  // Generate initials from poet name
  const getInitials = (name: string, isSindhi: boolean) => {
    if (isSindhi) {
      // For Sindhi, get the first character
      return name.charAt(0);
    } else {
      // For English, get first two initials
      return name
        .split(' ')
        .map((n: string) => n.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
  };

  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        'rounded-full transition-all duration-300 ease-out hover:scale-105 hover:shadow-md',
        ringClasses,
        className
      )}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <AvatarImage 
        src={imageUrl || undefined} 
        alt={poetName}
        className="object-cover transition-transform duration-300 hover:scale-110"
      />
      <AvatarFallback 
        className={cn(
          'text-foreground font-medium bg-background border border-border/20 shadow-sm hover:shadow-md hover:border-border/40 transition-all duration-300',
          isSindhi ? 'auto-sindhi-font' : ''
        )}
      >
        {getInitials(poetName, isSindhi)}
      </AvatarFallback>
    </Avatar>
  );
}
