# Standalone Couplets Solution

## Problem
The couplet creation was failing with a foreign key constraint error:
```
insert or update on table "poetry_couplets" violates foreign key constraint "poetry_couplets_poetry_id_fkey"
```

This happened because:
1. The `poetry_couplets` table has a foreign key constraint to `poetry_main(id)`
2. We were trying to set `poetry_id = 0` or `poetry_id = null`
3. The constraint requires `poetry_id` to reference an existing record in `poetry_main`

## Solution
We implemented a **System Poetry Record** approach:

### 1. Create System Poetry Record
Create a special poetry record with ID 0 that represents "standalone couplets":

```sql
INSERT INTO public.poetry_main (
    id,
    poetry_slug,
    poetry_tags,
    visibility,
    is_featured,
    category_id,
    created_at,
    updated_at
) VALUES (
    0, -- System ID for standalone couplets
    'system-standalone-couplets',
    'system,standalone,couplets',
    false, -- Not visible to users
    false, -- Not featured
    NULL, -- No category
    NOW(),
    NOW()
);
```

### 2. Use poetry_id = 0
When creating standalone couplets, use `poetry_id = 0` instead of `null`:

```typescript
const coupletData = {
  poetry_id: 0, // System poetry record for standalone couplets
  poet_id: parseInt(coupletDetails.poetId),
  couplet_slug: coupletDetails.coupletSlug.trim(),
  couplet_tags: coupletDetails.tags.join(', '),
  couplet_text: coupletDetails.coupletSindhi.trim(),
  lang: 'sd'
};
```

## Implementation Files

### Frontend Changes
- **File**: `src/app/admin/poetry/couplets/create/page.tsx`
- **Changes**: Updated to use `poetry_id: 0` for standalone couplets

### API Changes
- **File**: `src/app/api/admin/poetry/couplets/route.ts`
- **Changes**: Updated validation to allow `poetry_id = 0`

### Test Endpoint
- **File**: `src/app/api/admin/poetry/couplets/test/route.ts`
- **Purpose**: Test API connectivity and couplet creation

## Setup Instructions

### Option 1: Run Setup Script (Recommended)
```bash
# Make script executable
chmod +x setup_system_poetry.sh

# Run setup (update environment variables as needed)
DB_HOST=your_host DB_PORT=5432 DB_NAME=your_db DB_USER=your_user ./setup_system_poetry.sh
```

### Option 2: Manual SQL Execution
Connect to your database and run:
```sql
INSERT INTO public.poetry_main (
    id, poetry_slug, poetry_tags, visibility, is_featured, category_id, created_at, updated_at
) VALUES (
    0, 'system-standalone-couplets', 'system,standalone,couplets', false, false, NULL, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
```

## Benefits of This Approach

1. **Maintains Data Integrity**: Foreign key constraints remain valid
2. **Clear Separation**: System couplets are clearly identified
3. **No Schema Changes**: Works with existing database structure
4. **Easy Querying**: Can easily filter standalone vs. poetry couplets
5. **Backward Compatible**: Existing couplets continue to work

## Querying Standalone Couplets

```sql
-- Get all standalone couplets
SELECT * FROM poetry_couplets WHERE poetry_id = 0;

-- Get couplets with poetry (excluding standalone)
SELECT * FROM poetry_couplets WHERE poetry_id > 0;

-- Get all couplets with poetry info
SELECT 
    pc.*,
    CASE 
        WHEN pc.poetry_id = 0 THEN 'Standalone Couplet'
        ELSE pm.poetry_slug
    END as poetry_reference
FROM poetry_couplets pc
LEFT JOIN poetry_main pm ON pc.poetry_id = pm.id
WHERE pc.deleted_at IS NULL;
```

## Alternative Solutions

If you prefer different approaches, we also created:

1. **Constraint Modification**: `fix_couplets_constraint.sql` - Modifies foreign key to allow NULL
2. **Database Function**: `alternative_couplets_solution.sql` - Creates helper functions
3. **Database Views**: Alternative approach using views

## Testing

After setup, test the couplet creation:

1. **Navigate to**: `/admin/poetry/couplets/create`
2. **Click "Test API"** button to verify connectivity
3. **Create a couplet** - should now work with `poetry_id = 0`

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your database user has INSERT permissions
2. **Constraint Still Fails**: Verify the system poetry record was created with ID 0
3. **API Errors**: Check console logs for detailed error messages

### Debug Steps

1. **Check Database**: Verify system poetry record exists
2. **Test API**: Use the test endpoint to isolate issues
3. **Check Logs**: Review API and frontend console logs
4. **Verify Data**: Ensure all required fields are properly set

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify the system poetry record exists in your database
3. Test the API endpoint directly
4. Review the database constraints and permissions
