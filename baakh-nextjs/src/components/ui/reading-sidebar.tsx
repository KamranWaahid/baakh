'use client';

import { useState } from 'react';
import { Heart, Share2, BookOpen, MessageCircle } from 'lucide-react';
import { Button } from './button';

interface ReadingSidebarProps {
  className?: string;
  onLike?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  readingTime?: number;
}

export function ReadingSidebar({
  className = '',
  onLike,
  onShare,
  onComment,
  isLiked = false,
  likeCount = 0,
  commentCount = 0,
  readingTime = 5
}: ReadingSidebarProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);
  const [showShareFeedback, setShowShareFeedback] = useState(false);

  const handleLike = () => {
    if (onLike) {
      onLike();
    } else {
      setLiked(!liked);
      setLikes(prev => liked ? prev - 1 : prev + 1);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
    } else {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch {
        // Fallback to copy link
        await navigator.clipboard.writeText(window.location.href);
        setShowShareFeedback(true);
        setTimeout(() => setShowShareFeedback(false), 2000);
      }
    }
  };

  return (
    <div className={`reading-sidebar space-y-6 ${className}`}>
      {/* Like/Clap Button */}
      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className={`h-12 w-12 rounded-full transition-all duration-200 ${
            liked 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400' 
              : 'hover:bg-muted'
          }`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart 
            className={`h-6 w-6 transition-all duration-200 ${
              liked ? 'fill-current scale-110' : ''
            }`} 
          />
        </Button>
        {likes > 0 && (
          <span className="text-small text-muted-foreground">
            {likes}
          </span>
        )}
      </div>

      {/* Share Button */}
      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="h-12 w-12 rounded-full hover:bg-muted"
          aria-label="Share"
        >
          <Share2 className="h-6 w-6" />
        </Button>
        {showShareFeedback && (
          <span className="text-small text-green-600 dark:text-green-400">
            Link copied!
          </span>
        )}
      </div>

      {/* Comment Button */}
      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onComment}
          className="h-12 w-12 rounded-full hover:bg-muted"
          aria-label="Comment"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {commentCount > 0 && (
          <span className="text-small text-muted-foreground">
            {commentCount}
          </span>
        )}
      </div>

      {/* Reading Time */}
      <div className="flex flex-col items-center space-y-2 pt-4 border-t border-border/20">
        <BookOpen className="h-5 w-5 text-muted-foreground" />
        <span className="text-small text-muted-foreground text-center">
          {readingTime} min read
        </span>
      </div>
    </div>
  );
}
