'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PoetDescriptionModal from '@/components/ui/PoetDescriptionModal';

interface PoetDetailsClientProps {
  poet: any;
  isSindhi: boolean;
  snippet: string;
  buttonLabel: string;
}

export default function PoetDetailsClient({ poet, isSindhi, snippet, buttonLabel }: PoetDetailsClientProps) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {snippet && (
        <div className="mt-6">
          <p className={`text-gray-700 leading-7 line-clamp-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>{snippet}</p>
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpen(true)}
              className="h-9 px-4 border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-full font-medium bg-white"
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      )}
      {open && (
        <PoetDescriptionModal
          isOpen={open}
          onClose={() => setOpen(false)}
          poet={poet}
          isSindhi={isSindhi}
          content={{ fullDescription: snippet, originalName: poet.name, laqab: 'Laqab', takhalus: 'Takhalus' }}
        />
      )}
    </div>
  );
}
