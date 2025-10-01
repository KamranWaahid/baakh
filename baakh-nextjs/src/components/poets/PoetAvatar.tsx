"use client";

import React, { useState } from 'react';

interface PoetAvatarProps {
  src: string | null;
  alt: string;
  size?: number; // pixels
  fallbackInitial?: string;
  isSindhi?: boolean;
}

export default function PoetAvatar({ src, alt, size = 112, fallbackInitial = "?", isSindhi = false }: PoetAvatarProps) {
  const [failed, setFailed] = useState(false);
  const dim = `${size}px`;

  if (!src || failed) {
    return (
      <div className="flex items-center justify-center" style={{ width: dim, height: dim }}>
        <span className={`text-2xl font-semibold text-gray-700 ${isSindhi ? 'auto-sindhi-font' : ''}`}>{String(fallbackInitial || '—').charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-cover"
      style={{ width: dim, height: dim }}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}


