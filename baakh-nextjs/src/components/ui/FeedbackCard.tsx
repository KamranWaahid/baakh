"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackCardProps {
  className?: string;
}

const feedbackTranslations = {
  en: {
    title: "Share Your Feedback",
    subtitle: "Help us improve your experience",
    ratingLabel: "How would you rate your experience?",
    commentLabel: "Tell us more (optional)",
    commentPlaceholder: "Share your thoughts, suggestions, or report issues...",
    submitButton: "Send Feedback",
    thankYou: "Thank you for your feedback!",
    bad: "Poor",
    excellent: "Excellent"
  },
  sd: {
    title: "توھان پنھنجو رايو ڏيو",
    subtitle: "اوھان جو رايي جي مطابق اسان سسٽم کي بھتر کان بھتر ڪري سگھنداسين",
    ratingLabel: "توھان جو تجربو ڪيئن رھيو آھي؟",
    commentLabel: "وڌيڪ ٻڌايو",
    commentPlaceholder: "توھان پنھنجا خيال، صلاحون يا مسئلا بيان ڪريو",
    submitButton: "رايو موڪليو",
    thankYou: "توهان جي رايي لاءِ شڪريو!",
    bad: "خراب",
    excellent: "بھترين"
  }
};

export default function FeedbackCard({ className }: FeedbackCardProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);

  const pathname = usePathname();
  const isRTL = pathname?.startsWith('/sd');
  const locale = isRTL ? 'sd' : 'en';
  const t = feedbackTranslations[locale];

  // Check if user has already submitted feedback
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      // First check localStorage for quick response
      const feedbackSubmitted = localStorage.getItem('feedback-submitted');
      if (feedbackSubmitted === 'true') {
        setHasSubmittedBefore(true);
        return;
      }

      // Then check with server for accuracy
      try {
        const response = await fetch('/api/feedback/?check_submitted=true');
        if (response.ok) {
          const result = await response.json();
          if (result.hasSubmitted) {
            setHasSubmittedBefore(true);
            // Also update localStorage for future visits
            localStorage.setItem('feedback-submitted', 'true');
          }
        }
      } catch (error) {
        console.warn('Could not check feedback status:', error);
        // Fallback to localStorage only
      }
    };

    checkFeedbackStatus();
  }, []);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!rating) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          locale
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (result.error === 'Feedback table not found') {
          console.warn('Feedback table not found - database setup needed');
          // Still show success state but log the issue
          setIsSubmitted(true);
          setTimeout(() => {
            setIsSubmitted(false);
            setRating(null);
            setComment("");
          }, 2000);
          return;
        }
        throw new Error(result.error || 'Failed to submit feedback');
      }

      console.log('Feedback submitted successfully:', result);
      
      // Mark feedback as submitted in localStorage
      localStorage.setItem('feedback-submitted', 'true');
      setHasSubmittedBefore(true);
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(null);
        setComment("");
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still show success state even if API fails
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(null);
        setComment("");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if user has already submitted feedback
  if (hasSubmittedBefore) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "fixed bottom-8 left-8 z-40 w-72 max-w-[calc(100vw-4rem)]",
        isRTL && "left-auto right-8",
        className
      )}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        delay: 1.2
      }}
    >
      <Card className="bg-white/98 backdrop-blur-2xl border border-gray-100/60 shadow-2xl shadow-gray-900/5 dark:bg-neutral-900/98 dark:border-neutral-700/40 dark:shadow-2xl dark:shadow-black/20">
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-0.5">
              <CardTitle className={cn(
                "text-sm font-semibold text-gray-900 dark:text-white leading-tight",
                isRTL && "auto-sindhi-font"
              )}>
                {t.title}
              </CardTitle>
              <p className={cn(
                "text-xs text-gray-500 dark:text-gray-400 leading-relaxed",
                isRTL && "auto-sindhi-font"
              )}>
                {t.subtitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 w-6 rounded-md hover:bg-gray-100/80 dark:hover:bg-neutral-800/80 transition-colors duration-200 -mt-0.5 -mr-0.5"
            >
              <X className={cn(
                "h-3 w-3 transition-transform duration-300 text-gray-400",
                isCollapsed && "rotate-45"
              )} />
            </Button>
          </div>
        </CardHeader>

        <motion.div
          initial={false}
          animate={{ 
            height: isCollapsed ? 0 : "auto",
            opacity: isCollapsed ? 0 : 1
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <CardContent className="space-y-4 px-4 pb-4">
            {!isSubmitted ? (
              <>
                {/* Rating Section */}
                <div className="space-y-2.5">
                  <label className={cn(
                    "text-xs font-medium text-gray-700 dark:text-gray-300 block",
                    isRTL && "auto-sindhi-font"
                  )}>
                    {t.ratingLabel}
                  </label>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs text-gray-400 dark:text-gray-500 font-medium",
                      isRTL && "auto-sindhi-font"
                    )}>
                      {t.bad}
                    </span>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <motion.button
                          key={value}
                          onClick={() => handleRatingClick(value)}
                          className={cn(
                            "h-7 w-7 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-gray-700/50 font-medium text-sm",
                            rating && rating >= value
                              ? "bg-gray-900 border-gray-900 text-white shadow-md dark:bg-white dark:border-white dark:text-gray-900"
                              : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:bg-neutral-700/50"
                          )}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {value}
                        </motion.button>
                      ))}
                    </div>
                    <span className={cn(
                      "text-xs text-gray-400 dark:text-gray-500 font-medium",
                      isRTL && "auto-sindhi-font"
                    )}>
                      {t.excellent}
                    </span>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="space-y-2.5">
                  <label className={cn(
                    "text-xs font-medium text-gray-700 dark:text-gray-300 block",
                    isRTL && "auto-sindhi-font"
                  )}>
                    {t.commentLabel}
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.commentPlaceholder}
                    className={cn(
                      "min-h-[60px] resize-none text-xs border-gray-200 focus:border-gray-300 dark:border-neutral-600 dark:focus:border-neutral-500 rounded-lg",
                      isRTL && "text-right"
                    )}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!rating || isSubmitting}
                  className="w-full h-8 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 transition-all duration-300 text-xs font-medium rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <motion.div
                      className="flex items-center space-x-2 rtl:space-x-reverse"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className={isRTL ? "auto-sindhi-font" : ""}>
                        {t.submitButton}
                      </span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Send className="h-3.5 w-3.5" />
                      <span className={isRTL ? "auto-sindhi-font" : ""}>
                        {t.submitButton}
                      </span>
                    </div>
                  )}
                </Button>
              </>
            ) : (
              /* Success State */
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    delay: 0.3 
                  }}
                  className="mx-auto w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-3"
                >
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className={cn(
                  "text-sm font-semibold text-gray-900 dark:text-white mb-1.5",
                  isRTL && "auto-sindhi-font"
                )}>
                  {t.thankYou}
                </h3>
                <p className={cn(
                  "text-xs text-gray-500 dark:text-gray-400 leading-relaxed",
                  isRTL && "auto-sindhi-font"
                )}>
                  {isRTL 
                    ? "توهان جو رايو اسان جي لاءِ اهم آهي" 
                    : "Your feedback helps us improve"
                  }
                </p>
              </motion.div>
            )}
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}
