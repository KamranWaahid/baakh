# Sindhi Poetry Platform

A Next.js application for managing and displaying Sindhi poetry with a comprehensive admin panel.

## Features

- **Admin Panel**: Complete CRUD operations for poets and poetry
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Form Validation**: Using React Hook Form with Zod validation
- **Database Ready**: Configured with Supabase for data persistence
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Database**: Supabase
- **Animations**: Framer Motion
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd baakh-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   └── poets/
│   │       ├── page.tsx          # Poets list
│   │       ├── create/
│   │       │   └── page.tsx      # Create poet form
│   │       └── [id]/
│   │           └── page.tsx      # Edit poet form
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── layouts/
│   │   └── AdminLayout.tsx       # Admin layout wrapper
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── Navbar.tsx
│       └── Sidebar.tsx
└── lib/
    ├── supabase.ts              # Supabase client
    └── utils.ts                 # Utility functions
```

## Admin Panel Features

### Dashboard (`/admin`)
- Overview of the platform
- Quick access to main features

### Poets Management (`/admin/poets`)
- **List View**: Display all poets with actions
- **Create**: Add new poets with form validation
- **Edit**: Update existing poet information
- **Delete**: Remove poets from the system

### Form Fields
- **Name**: Required field for poet's name
- **Biography**: Optional detailed biography
- **Birth Year**: Optional birth year
- **Death Year**: Optional death year

## Database Schema (Supabase)

### Poets Table
```sql
CREATE TABLE poets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
