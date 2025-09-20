import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // New design system colors
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        bg: "var(--bg)",
        accent: "var(--accent)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Modern Font System - Clean & Minimal
        sans: ["var(--font-inter)", "Helvetica Now Text Regular", "Helvetica Now Text Regular Placeholder", "sans-serif"],
        serif: ["var(--font-sindhi)", "serif"],
        inter: ["var(--font-inter)", "Helvetica Now Text Regular", "Helvetica Now Text Regular Placeholder", "sans-serif"],
        sindhi: ["var(--font-sindhi)", "serif"],
        // Legacy support
        lateef: ["var(--font-sindhi)", "serif"],
        "mb-lateefi": ["var(--font-sindhi)", "serif"],
      },
      fontSize: {
        // Modern Typography Scale - Clean & Responsive
        "display": ["clamp(2.5rem, 5vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "h1": ["clamp(2rem, 4vw, 2.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "h2": ["clamp(1.5rem, 3vw, 2rem)", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        "h3": ["clamp(1.25rem, 2.5vw, 1.5rem)", { lineHeight: "1.4" }],
        "h4": ["clamp(1.125rem, 2vw, 1.25rem)", { lineHeight: "1.4" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "caption": ["0.875rem", { lineHeight: "1.5" }],
        "small": ["0.75rem", { lineHeight: "1.4" }],
      },
      maxWidth: {
        "reading": "680px",
        "page": "1200px",
      },
      spacing: {
        // Modern Spacing System - Clean & Consistent
        "xs": "0.25rem",    // 4px
        "sm": "0.5rem",     // 8px
        "md": "1rem",       // 16px
        "lg": "1.5rem",     // 24px
        "xl": "2rem",       // 32px
        "2xl": "3rem",      // 48px
        "3xl": "4rem",      // 64px
        // Legacy support
        "gutter": "24px",
        "gutter-lg": "32px",
      },
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(0,0,0,.06)",
        "elevation-2": "0 4px 14px rgba(0,0,0,.08)",
      },
      transitionDuration: {
        "gentle": "200ms",
        "fast": "150ms",
      },
      transitionTimingFunction: {
        "gentle": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for content width
    function({ addUtilities }: any) {
      addUtilities({
        '.content-reading': {
          'max-width': '680px',
          'margin': '0 auto',
        },
        '.content-page': {
          'max-width': '1200px',
          'margin': '0 auto',
          'padding': '0 24px',
        },
        '@media (min-width: 768px)': {
          '.content-page': {
            'padding': '0 32px',
          },
        },
      });
    },
  ],
};

export default config; 