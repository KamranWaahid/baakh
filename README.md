# Baakh

**Baakh** is a non-profit, volunteer-powered platform that preserves and explores the rich heritage of Sindhi poetry and literature. It provides a modern, scholarly, and welcoming interface to discover, research, and contribute to centuries of Sindhi literary tradition.

## 📚 Overview

Baakh offers:
- A curated archive of Sindhi couplets, nazams, vaayis, and more
- Smart search and filtering by themes, forms, and centuries
- Tools for transliteration, translation, and scholarly annotation
- APIs and utilities for Sindhi text correction and Romanization
- AI-powered image processing for poet portraits
- A responsive, accessible, multilingual web application

## ✨ Features

- **Sindhi Poetry Archive:** 50+ poets, 300+ years of poetry, and themed collections
- **Navigation System:** Sticky header, submenu support, ARIA accessibility, dark mode, mobile optimizations
- **Search:** Context-aware rewriting, theme/form/year extraction, Sindhi/English support
- **Hesudhar & Romanizer:** Fast, Unicode-aware text correction and Sindhi-to-Roman transliteration
- **Image Processing:** AI-powered segmentation and optimization for poet images
- **Donation:** One-time or monthly support (UI only; payment integration pending)
- **Privacy:** Only essential data stored; see `/privacy` for details

## 🏗️ Architecture

- **Frontend:** TypeScript, React, Tailwind CSS
- **Backend:** Supabase (database, authentication), RESTful APIs
- **Utilities:** Scripts for syncing poetry corrections, security testing, timeline setup
- **File Structure:**  
  ```
  baakh-nextjs/
  ├── src/
  │   └── app/              # Main application pages (poets, couplets, timeline)
  │   └── lib/              # Supabase client, utilities, security
  ├── scripts/              # Automation for syncing, testing, setup
  ├── hesudhar.txt          # Sindhi correction mappings
  ├── romanizer.txt         # Sindhi-to-Roman mappings
  ```
- **Specialized Systems:**  
  - **Hesudhar:** Corrects Sindhi text with 9,000+ rules  
  - **Romanizer:** Transliterates Sindhi to Roman script with 18,000+ mappings  
  - **Timeline:** Database-powered periods and event history  
  - **Security:** CSRF protection, authentication checks  

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account & keys (for full features)

### Installation

```bash
git clone https://github.com/KamranWaahid/Baakh.git
cd Baakh/baakh-nextjs
npm install
```

### Development

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## 🖥️ Available Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
- `npm run type-check` – Run TypeScript checks

## 🔗 Key Components

- **MainNavigation:** Responsive navbar, search, language/theme toggle, mobile menus
- **Supabase Integration:** User profiles, authentication, poetry database
- **Hesudhar & Romanizer APIs:** `/api/admin/hesudhar/`, `/api/admin/romanizer/`
- **Poetry Pages:** Poets, couplets, themes, timeline, collections
- **Donation Page:** `/donate` (UI only)
- **Privacy Policy:** `/privacy`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License

---

Baakh is an open invitation to explore, curate, and evolve Sindhi literary heritage. For questions or contributions, please create an issue or submit a pull request!

---
# baakh
