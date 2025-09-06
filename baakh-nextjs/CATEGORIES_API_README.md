# Categories API Setup Guide

This guide explains how to set up and use the categories API to fetch poetry data from the database for `/sd/categories/[slug]` pages.

## 🗄️ Database Structure

The categories system uses the following tables:

### `categories` Table
- `id`: Primary key (BIGINT)
- `slug`: Unique identifier (e.g., 'nazm', 'ghazal', 'tairru')
- `content_style`: Layout style ('justified', 'centered', 'left-aligned', 'right-aligned')
- `gender`: Grammatical gender ('masculine', 'feminine')
- `is_featured`: Boolean flag for featured categories
- `user_uuid`: Foreign key to profiles table

### `category_details` Table
- `cat_id`: Foreign key to categories
- `cat_name`: Category name in specific language
- `cat_name_plural`: Plural form of category name
- `cat_detail`: Detailed description
- `lang`: Language code ('en' or 'sd')

### `poetry_main` Table
- `id`: Primary key (BIGINT)
- `category_id`: Foreign key to categories
- `poetry_slug`: Unique poetry identifier
- `poetry_tags`: Character varying (comma-separated tags)
- `lang`: Language ('sd' or 'en')
- `visibility`: Boolean (true = public, false = private)
- `poet_id`: Foreign key to poets table

### `poetry_translations` Table
- `poetry_id`: Foreign key to poetry_main
- `title`: Poetry title in specific language
- `info`: Poetry content/info in specific language
- `lang`: Language code ('en' or 'sd')

### `poets` Table
- `id`: Primary key (UUID)
- `poet_id`: Secondary key (BIGINT) - used for foreign key relationships
- `poet_slug`: Unique poet identifier
- `sindhi_name`: Poet name in Sindhi
- `english_name`: Poet name in English

## 🚀 Setup Instructions

### 1. Database Setup

Run the database setup scripts in order:

```bash
# Set up the complete database
./setup_complete_database.sh

# Or run individual scripts
psql $DATABASE_URL -f setup_categories_table.sql
psql $DATABASE_URL -f setup_poetry_main_table.sql
```

### 2. Insert Sample Data

Insert sample categories and poetry data:

```bash
psql $DATABASE_URL -f insert_sample_poetry_actual_schema.sql
```

This will create:
- Categories: nazm, ghazal, tairru, chhasitta
- Sample poetry entries for each category
- Bilingual translations (Sindhi/English)

### 3. Verify Setup

Check that the tables and data are created correctly:

```sql
-- Check categories
SELECT slug, content_style FROM public.categories;

-- Check poetry
SELECT poetry_slug, category_id, poetry_tags FROM public.poetry_main LIMIT 5;

-- Check translations
SELECT pt.title, pt.lang, pm.poetry_slug 
FROM public.poetry_translations pt
JOIN public.poetry_main pm ON pt.poetry_id = pm.id
LIMIT 5;
```

## 🔌 API Endpoints

### Get All Categories
```
GET /api/categories?lang=sd&page=1&limit=12
```

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "slug": "nazm",
      "sindhiName": "نظم",
      "englishName": "Nazm",
      "contentStyle": "justified",
      "languages": ["Sindhi", "English"]
    }
  ],
  "total": 10,
  "pagination": { ... }
}
```

### Get Specific Category
```
GET /api/categories/nazm
```

**Response:**
```json
{
  "category": {
    "id": "1",
    "slug": "nazm",
    "sindhiName": "نظم",
    "englishName": "Nazm",
    "contentStyle": "justified",
    "languages": ["Sindhi", "English"]
  }
}
```

### Get Category Poetry
```
GET /api/categories/nazm/poetry?limit=12&offset=0
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid-1",
      "slug": "sample-nazm-1",
      "couplet_slug": "sample-nazm-1",
      "title": "صبح جي نظم",
      "info": "صبح جي خوبصورتي ۽ طبيعت جي تازگي کي بيان ڪندي هڪ نظم",
      "poet": "نموني شاعر",
      "tags": ["نظم", "صبح", "طبيعت"],
      "lang": "sd",
      "createdAt": "2024-01-01T00:00:00Z",
      "views": 75
    }
  ],
  "total": 2
}
```

## 🔍 How It Works

### 1. Category Lookup
The API first looks up the category by slug to get the `category_id`.

### 2. Poetry Fetching
Poetry is fetched using two methods:
- **Primary**: Direct `category_id` match in `poetry_main` table
- **Fallback**: Tag-based search using `poetry_tags` array

### 3. Data Enrichment
- **Translations**: Fetched from `poetry_translations` table
- **Poet Information**: Fetched from `poets` table
- **Tags**: Processed from `poetry_tags` array

### 4. Response Formatting
The API returns poetry data in the exact format expected by the frontend:
- `couplet_slug` for clickable titles
- `views` for display
- Proper language-specific content

## 🧪 Testing

### Run Test Script
```bash
node test_categories_api.js
```

### Manual Testing
```bash
# Test categories endpoint
curl "http://localhost:3000/api/categories?lang=sd"

# Test specific category
curl "http://localhost:3000/api/categories/nazm"

# Test poetry endpoint
curl "http://localhost:3000/api/categories/nazm/poetry?limit=5"
```

## 🐛 Troubleshooting

### Common Issues

1. **No Poetry Found**
   - Check if `poetry_main` table has data
   - Verify `category_id` relationships
   - Check `visibility` and `deleted_at` filters

2. **Foreign Key Errors**
   - Ensure tables are created in correct order
   - Check that referenced IDs exist

3. **Permission Errors**
   - Verify `service_role` has proper permissions
   - Check Supabase RLS policies

### Debug Queries

```sql
-- Check category-poetry relationships
SELECT c.slug, COUNT(pm.id) as poetry_count
FROM public.categories c
LEFT JOIN public.poetry_main pm ON c.id = pm.category_id
WHERE pm.deleted_at IS NULL AND pm.visibility = 'public'
GROUP BY c.slug;

-- Check poetry with translations
SELECT pm.poetry_slug, pt.title, pt.lang
FROM public.poetry_main pm
JOIN public.poetry_translations pt ON pm.id = pt.poetry_id
WHERE pm.category_id = (SELECT id FROM public.categories WHERE slug = 'nazm');
```

## 📱 Frontend Integration

The API is designed to work seamlessly with the existing frontend:

```typescript
// Fetch category poetry
const response = await fetch(`/api/categories/${slug}/poetry?limit=12&offset=${offset}`);
const data = await response.json();

// Use the data directly
const poems = data.items.map(poem => ({
  id: poem.id,
  title: poem.title,
  poet: poem.poet,
  tags: poem.tags,
  couplet_slug: poem.couplet_slug, // For clickable titles
  views: poem.views
}));
```

## 🎯 Next Steps

1. **Add More Categories**: Extend the categories table with more poetic forms
2. **Enhance Search**: Add full-text search capabilities
3. **Caching**: Implement Redis caching for better performance
4. **Analytics**: Track category popularity and usage

---

For more information, check the main database setup guide: `DATABASE_SETUP_GUIDE.md`
