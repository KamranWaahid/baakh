import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className, showText = false }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
    "3xl": "w-20 h-20"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center justify-center", sizeClasses[size])}>
        <svg 
          viewBox="0 0 530 530" 
          className={cn("w-full h-full")}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x=".73" y=".5" width="529.27" height="529.32" rx="83.98" ry="83.98" fill="currentColor"/>
          <g>
            <path fill="currentColor" d="M155.43,170.13c-46.73,13.9-79.77,30-99.07,48.43v42.05c82.35-46.11,156.97-69.22,223.93-69.22v-42.51c-37.67,0-79.31,7.1-124.86,21.25ZM255.89,245.69c-22.95-18.37-57.18-27.28-102.73-26.66v42.05c30.78.31,53.68,4.53,68.76,12.66,9.98,5.15,14.93,10.24,14.93,15.39,0,6.33-13.69,13.43-41.12,21.25-31.7,9.37-66.08,14.05-103.19,14.05-31.75,0-62.32-3.5-91.81-10.55v43.59c29.03,6.02,59.65,9.01,91.81,9.01,44.98,0,85.07-5.56,120.38-16.73,44.93-14.2,67.37-34.38,67.37-60.63,0-15.7-8.13-30.16-24.39-43.44Z"/>
            <path fill="currentColor" d="M365.57,345.67h-22.17c-11.76,0-21.64-4.22-29.63-12.67-8-8.44-11.99-18.24-11.99-29.4v-155.17h42.07v133c0,6.64,2.18,11.92,6.56,15.83,4.37,3.93,9.42,5.88,15.16,5.88v42.52Z"/>
            <path fill="currentColor" d="M466.45,271.03c3.31,7.54,4.98,15.38,4.98,23.52,0,13.88-4.53,25.86-13.57,35.97-9.05,10.11-20.21,15.15-33.48,15.15h-60.62v-42.52h48.4c11.15,0,16.74-3.01,16.74-9.05,0-4.22-1.97-10.1-5.88-17.64l-18.1-36.19h47.95l13.57,30.76ZM413.15,390.01c0,6.93-2.49,12.89-7.46,17.87-4.98,4.98-10.79,7.46-17.42,7.46-7.24,0-13.27-2.49-18.1-7.46-4.83-4.97-7.24-10.94-7.24-17.87s2.41-12.89,7.24-17.87c4.82-4.98,10.86-7.47,18.1-7.47s12.81,2.49,17.64,7.47c4.82,4.97,7.24,10.93,7.24,17.87Z"/>
          </g>
        </svg>
      </div>
      {showText && (
        <span className={cn(
          "font-bold text-foreground tracking-tight",
          textSizes[size]
        )}>
          Baakh
        </span>
      )}
    </div>
  );
} 