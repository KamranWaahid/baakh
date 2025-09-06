# Database Foreign Key Fix Guide

## 🚨 Problem

Your application is experiencing foreign key constraint errors:

```
Error fetching poetry: {
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'poetry_main' and 'poets' using the hint 'poetry_main_poet_id_fkey' in the schema 'public', but no matches were found.",
  hint: "Perhaps you meant 'poetry_couplets' instead of 'poets'.",
  message: "Could not find a relationship between 'poetry_main' and 'poets' in the schema cache"
}
```

## 🔍 Root Cause

The `poetry_main` table is missing the required foreign key constraints:
- `poetry_main_poet_id_fkey` - links to the `poets` table
- `poetry_main_category_id_fkey` - links to the `categories` table

## 🛠️ Solution

### Option 1: Run the Complete Setup Script (Recommended)

```bash
# Navigate to the baakh-nextjs directory
cd baakh-nextjs

# Set your database connection details
export DATABASE_URL="postgresql://username:password@host:port/database"
# OR
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"

# Run the complete setup script
./setup_complete_database.sh
```

### Option 2: Run Individual Setup Scripts

If you prefer to run scripts individually:

```bash
# 1. Setup categories table first
./setup_categories_database.sh

# 2. Setup poetry_main table with foreign keys
./setup_poetry_main_database.sh
```

### Option 3: Manual SQL Execution

If you prefer to run SQL manually:

1. **Setup categories table:**
   ```bash
   psql "your-database-connection" -f setup_categories_table.sql
   ```

2. **Setup poetry_main table:**
   ```bash
   psql "your-database-connection" -f setup_poetry_main_table.sql
   ```

## 📋 Prerequisites

Before running the setup scripts, ensure you have:

- ✅ PostgreSQL client tools installed (`psql` command available)
- ✅ Database connection details configured
- ✅ Sufficient database permissions (service_role access)
- ✅ Existing `poets` table (if you want to link poetry to poets)

## 🗄️ What Gets Created

### Categories Table
- `categories` - Main categories table
- `category_details` - Translations for categories (Sindhi/English)
- Sample categories: Ghazal, Nazm, Rubai, etc.

### Poetry Main Table
- `poetry_main` - Main poetry entries table
- Proper foreign key constraints to `poets` and `categories`
- Indexes for performance
- Triggers for automatic timestamp updates

## 🔗 Foreign Key Relationships

After setup, your tables will have these relationships:

```
poetry_main.poet_id → poets.id
poetry_main.category_id → categories.id
poetry_main.user_id → auth.users.id
```

## 🧪 Testing the Fix

After running the setup scripts:

1. **Restart your application** to clear any cached schema information
2. **Visit the admin poetry page** - should load without foreign key errors
3. **Check the database** - verify foreign key constraints exist

## 🚀 Quick Verification

To verify the fix worked, run this SQL query:

```sql
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'poetry_main';
```

You should see:
- `poetry_main_poet_id_fkey`
- `poetry_main_category_id_fkey`

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure your database user has `service_role` permissions
   - Check that you can create tables and constraints

2. **Table Already Exists**
   - The scripts use `CREATE TABLE IF NOT EXISTS` - safe to run multiple times
   - If you need to recreate, uncomment the `DROP TABLE` lines in the SQL files

3. **Connection Issues**
   - Verify your database connection string
   - Check that PostgreSQL is running and accessible

### Getting Help

If you continue to have issues:

1. Check the error messages from the setup scripts
2. Verify your database connection manually with `psql`
3. Check that all required tables exist in your database

## 📚 Related Documentation

- [Poets Setup Guide](./POETS_SETUP_README.md)
- [Tags Setup Guide](./TAGS_SETUP_README.md)
- [Authentication Setup](./AUTHENTICATION_SETUP.md)

## 🎯 Next Steps

After fixing the foreign key issue:

1. **Test your poetry management** - create, edit, and delete poetry entries
2. **Verify poet and category relationships** - ensure poetry links properly
3. **Check the frontend** - poetry pages should load without errors
4. **Monitor performance** - the new indexes should improve query speed
