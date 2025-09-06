'use client';

import { useEffect, useState } from 'react';

interface ReadingProgressProps {
  className?: string;
}

export function ReadingProgress({ className = '' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className={`reading-progress ${className}`}>
      <div 
        className="reading-progress-bar" 
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
