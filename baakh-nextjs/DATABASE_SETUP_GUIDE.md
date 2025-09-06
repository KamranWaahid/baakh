# Database Setup Guide for Baakh NextJS

## Current Issue
The `/admin/poetry` endpoint is failing because the required database tables don't exist yet. The error message indicates missing foreign key relationships between `poetry_main` and `poets` tables.

## Solution: Set Up Database Tables

### Option 1: Use Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in with your account

2. **Select Your Project**
   - Project ID: `uhbqcaxwfossrjwusclc`
   - Project URL: `https://uhbqcaxwfossrjwusclc.supabase.co`

3. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

4. **Run Setup Scripts in Order**

   **Step 1: Create Poets Table**
   ```sql
   -- Copy and paste the contents of setup_poets_table.sql
   -- This creates the poets table with all necessary columns
   ```

   **Step 2: Create Categories Table**
   ```sql
   -- Copy and paste the contents of setup_categories_table.sql
   -- This creates the categories table with translations
   ```

   **Step 3: Create Poetry Main Table**
   ```sql
   -- Copy and paste the contents of setup_poetry_main_table.sql
   -- This creates the poetry_main table with foreign key relationships
   ```

   **Step 4: Create Additional Tables**
   ```sql
   -- Create poetry_translations table
   CREATE TABLE IF NOT EXISTS public.poetry_translations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poetry_id UUID REFERENCES public.poetry_main(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     info TEXT,
     source TEXT,
     lang TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create poetry_couplets table
   CREATE TABLE IF NOT EXISTS public.poetry_couplets (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poetry_id UUID REFERENCES public.poetry_main(id) ON DELETE CASCADE,
     poet_id UUID REFERENCES public.poets(id) ON DELETE SET NULL,
     couplet_slug TEXT NOT NULL,
     couplet_text TEXT NOT NULL,
     couplet_tags TEXT[] DEFAULT '{}',
     lang TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Verify Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see: `poets`, `categories`, `poetry_main`, `poetry_translations`, `poetry_couplets`

### Option 2: Use the Setup Scripts Directly

If you have direct database access (psql), you can run:

```bash
# Set environment variables
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.uhbqcaxwfossrjwusclc.supabase.co:5432/postgres"

# Run the complete setup
./setup_complete_database.sh
```

### Option 3: Manual Table Creation

If you prefer to create tables manually, here's the minimal setup:

```sql
-- 1. Create poets table
CREATE TABLE IF NOT EXISTS public.poets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poet_slug TEXT UNIQUE NOT NULL,
  sindhi_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  -- ... other columns as needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  sindhi_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  -- ... other columns as needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create poetry_main table with foreign keys
CREATE TABLE IF NOT EXISTS public.poetry_main (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poet_id UUID REFERENCES public.poets(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  poetry_slug TEXT UNIQUE NOT NULL,
  -- ... other columns as needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## After Setup

Once the tables are created:

1. **Restart your Next.js server** (if running)
2. **Visit `/admin/poetry`** - it should now work without errors
3. **Add sample data** through the admin interface

## Verification

To verify the setup worked:

1. **Check API endpoint**: `/api/admin/poetry` should return data instead of errors
2. **Check admin page**: `/admin/poetry` should load without database errors
3. **Check table relationships**: Foreign keys should be properly established

## Troubleshooting

- **Foreign key errors**: Ensure tables are created in the correct order (poets → categories → poetry_main)
- **Permission errors**: Check that the service role has proper permissions
- **Connection errors**: Verify your environment variables are correct

## Next Steps

After database setup:
1. Add sample poets and categories
2. Create some poetry entries
3. Test the full CRUD operations
4. Set up any additional tables as needed

---

**Note**: The setup scripts are located in the project root directory and contain the complete table definitions with proper constraints and indexes.
