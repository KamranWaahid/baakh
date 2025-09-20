"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Award, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSmartFontClass } from "@/lib/font-detection-utils";

interface PoetDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  poet: {
    name: string;
    sindhiName: string;
    englishName: string;
    sindhi_laqab?: string;
    english_laqab?: string;
    sindhi_takhalus?: string;
    english_takhalus?: string;
    longDescription?: string;
    sindhi_details?: string;
    english_details?: string;
    period: string;
    location: string;
    locationSd?: string;
    locationEn?: string;
  };
  isSindhi: boolean;
  content: {
    fullDescription: string;
    originalName: string;
    laqab: string;
    takhalus: string;
  };
}

export default function PoetDescriptionModal({ 
  isOpen, 
  onClose, 
  poet, 
  isSindhi, 
  content 
}: PoetDescriptionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className={`text-xl font-bold text-gray-900 ${getSmartFontClass(poet.name)}`}>
                  {poet.name}
                </h2>
                <p className={`text-sm text-gray-500 ${getSmartFontClass(poet.period + ' • ' + (isSindhi ? (poet as any).birth_place_sd || (poet as any).birth_place : (poet as any).birth_place_en || (poet as any).birth_place))}`}>
                  {poet.period} • {isSindhi ? (poet as any).birth_place_sd || (poet as any).birth_place : (poet as any).birth_place_en || (poet as any).birth_place}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Name Information */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className={`text-lg font-semibold mb-4 text-gray-900 ${getSmartFontClass(content.originalName)}`}>
                {isSindhi ? "شاعر جي تفصيلات" : "Poet Details"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Original Name */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {isSindhi ? "اصل نالو" : "Original Name"}
                    </p>
                    <p className={`font-medium text-gray-900 ${getSmartFontClass(poet.sindhiName || poet.englishName)}`}>
                      {isSindhi ? poet.sindhiName : poet.englishName}
                    </p>
                  </div>
                </div>

                {/* Laqab */}
                {(poet.sindhi_laqab || poet.english_laqab) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Award className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {isSindhi ? "لقب" : "Laqab (Honorific Title)"}
                      </p>
                      <p className={`font-medium text-gray-900 ${getSmartFontClass(poet.sindhi_laqab || poet.english_laqab || '')}`}>
                        {isSindhi ? poet.sindhi_laqab : poet.english_laqab}
                      </p>
                    </div>
                  </div>
                )}

                {/* Takhalus */}
                {(poet.sindhi_takhalus || poet.english_takhalus) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <PenTool className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {isSindhi ? "تخلص" : "Takhalus (Pen Name)"}
                      </p>
                      <p className={`font-medium text-gray-900 ${getSmartFontClass((poet.sindhi_takhalus || poet.english_takhalus || ''))}`}>
                        {isSindhi ? poet.sindhi_takhalus : poet.english_takhalus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Description */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 text-gray-900 ${getSmartFontClass(content.fullDescription)}`}>
                {isSindhi ? "مڪمل تفصيل" : "Full Biography"}
              </h3>
              <div className={`text-gray-700 leading-relaxed space-y-4 ${getSmartFontClass(isSindhi ? (poet.sindhi_details || poet.longDescription || '') : (poet.english_details || poet.longDescription || ''))}`}>
                {(isSindhi ? (poet.sindhi_details || poet.longDescription || '') : (poet.english_details || poet.longDescription || ''))
                  .split('\n')
                  .map((paragraph, index) => (
                    <p key={index} className="text-justify">
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end">
              <Button onClick={onClose} className="px-6">
                {isSindhi ? "بند ڪريو" : "Close"}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
