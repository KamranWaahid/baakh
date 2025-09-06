'use client';

import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface PoetryContentProps {
  title: string;
  dek?: string;
  content: string;
  poet: {
    name: string;
    english_name: string;
    avatar?: string;
    bio?: string;
  };
  form: string;
  created_at: string;
  tags?: string[];
  readingTime?: number;
  className?: string;
}

export function PoetryContent({
  title,
  dek,
  content,
  poet,
  form,
  created_at,
  tags = [],
  readingTime = 5,
  className = ''
}: PoetryContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className={`space-y-reading ${className}`}>
      {/* Header */}
      <header className="space-y-reading-sm">
        {/* Title */}
        <h1 className="text-heading-1 text-center">
          {title}
        </h1>
        
        {/* Dek/Subtitle */}
        {dek && (
          <p className="text-dek text-center mx-auto">
            {dek}
          </p>
        )}
        
        {/* Byline */}
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={poet.avatar} alt={poet.english_name} />
            <AvatarFallback className="text-lg">
              {poet.english_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-heading-4">{poet.english_name}</h2>
            <p className="text-body text-muted-foreground">{poet.name}</p>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center justify-center gap-4 text-small text-muted-foreground">
          <span className="capitalize">{form}</span>
          <span>•</span>
          <span>{formatDate(created_at)}</span>
          <span>•</span>
          <span>{readingTime} min read</span>
        </div>
      </header>

      {/* Content */}
      <div className="content-column">
        <div className="text-body-large leading-relaxed space-y-6">
          {/* Split content into paragraphs for better readability */}
          {content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-center">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="space-y-reading-sm pt-8 border-t border-border/20">
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-small px-3 py-1"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Poet Bio */}
        {poet.bio && (
          <div className="reading-card max-w-2xl mx-auto">
            <h3 className="text-heading-4 mb-3">About {poet.english_name}</h3>
            <p className="text-body text-muted-foreground">
              {poet.bio}
            </p>
          </div>
        )}
        
        {/* More from Poet */}
        <div className="text-center">
          <p className="text-small text-muted-foreground">
            Part of the Sindhi Poetry Archive
          </p>
        </div>
      </footer>
    </article>
  );
}
