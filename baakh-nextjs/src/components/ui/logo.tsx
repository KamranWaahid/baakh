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
        <img 
          src="/Baakh.svg" 
          alt="Baakh Logo"
          className={cn("w-full h-full object-contain")}
        />
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