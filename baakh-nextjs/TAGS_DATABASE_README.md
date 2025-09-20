# Tags Database System

This system provides a comprehensive tag translation system for the Baakh poetry platform, allowing tags to be stored in the database with proper translations for both English and Sindhi languages.

## 🗄️ Database Structure

### `tags` Table
- `id`: Primary key (BIGSERIAL)
- `slug`: Unique identifier (e.g., "women-poet", "progressive-poets")
- `label`: Default label (usually in Sindhi)
- `tag_type`: Category (Poet, Poetry, Topic, Form, Theme, Category, Emotion)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### `tags_translations` Table
- `tag_id`: Foreign key to tags table (BIGINT)
- `lang_code`: Language code ('en' or 'sd') (VARCHAR(20))
- `title`: Translated title (VARCHAR(255))
- `detail`: Translated description (TEXT)
- Primary key: (tag_id, lang_code)
- Foreign key: tag_id references tags(id) with CASCADE

## 🚀 Setup

### 1. Database Setup
```bash
# Set your database connection
export DATABASE_URL="postgresql://username:password@host:port/database"

# Run the setup script
cd baakh-nextjs
./setup_tags.sh
```

### 2. Manual Setup (Alternative)
```bash
# Connect to your database
psql "your-database-connection-string"

# Run the SQL script
\i setup_tags_with_translations.sql
```

## 🎯 Features

### Pre-configured Tags
The system comes with these common poet tags pre-configured:

| English | Sindhi | Slug |
|---------|--------|------|
| Women Poet | عورت شاعر | women-poet |
| Young Poets | نوجوان شاعر | young-poets |
| Classical Poet | ڪلاسيڪل شاعر | classical-poet |
| Sufi Poet | صوفي شاعر | sufi-poet |
| Modern Poet | جديد شاعر | modern-poet |
| Contemporary Poet | عصري شاعر | contemporary-poet |
| Post-Partition Poets | تقسيم کانپوءِ جا شاعر | post-partition-poets |
| Progressive Poets | ترقي پسند شاعر | progressive-poets |
| Revolutionary Poet | انقلابي شاعر | revolutionary-poet |
| Nationalist Poet | قومي شاعر | nationalist-poet |
| Freedom Fighter Poet | آزادي جي جنگجو شاعر | freedom-fighter-poet |
| Featured | چونڊ | featured |

## 🔌 API Endpoints

### GET `/api/tags`
Fetch tags with translations for a specific language and type.

**Parameters:**
- `lang`: Language code ('en' or 'sd') - default: 'en'
- `type`: Tag type ('Poet', 'Poetry', etc.) - default: 'Poet'

**Example:**
```bash
# Get Sindhi poet tags
curl "http://localhost:3001/api/tags?lang=sd&type=Poet"

# Get English poet tags
curl "http://localhost:3001/api/tags?lang=en&type=Poet"
```

**Response:**
```json
{
  "tags": [
    {
      "id": 1,
      "slug": "women-poet",
      "label": "عورت شاعر",
      "tag_type": "Poet",
      "title": "عورت شاعر",
      "detail": "سنڌي تفصيل: عورت شاعر",
      "lang_code": "sd"
    }
  ],
  "total": 12,
  "language": "sd",
  "type": "Poet"
}
```

### POST `/api/tags`
Create a new tag with translations.

**Request Body:**
```json
{
  "slug": "new-tag",
  "label": "نئو ٽيگ",
  "tag_type": "Poet",
  "translations": {
    "sd": {
      "title": "نئو ٽيگ",
      "detail": "سنڌي تفصيل"
    },
    "en": {
      "title": "New Tag",
      "detail": "English description"
    }
  }
}
```

## 🔄 How It Works

### 1. Tag Translation Priority
The system uses this priority order for tag translations:

1. **API translated_tags**: From the poet's API response
2. **Database tags**: From the tags_translations table
3. **Hardcoded fallback**: Built-in common translations
4. **Original tag**: If no translation found

### 2. Tag Matching
The system tries multiple variations to match tags:
- Exact match
- Lowercase match
- Space normalization
- Hyphen/space conversion
- Singular/plural variations

### 3. Language Detection
- Automatically detects language from URL path (`/sd/` vs `/en/`)
- Fetches appropriate translations for the current language
- Falls back gracefully if translations are missing

## 🛠️ Usage in Components

The poets page automatically:
- Fetches database tags on mount
- Uses database translations when available
- Falls back to hardcoded translations
- Handles tag deduplication
- Displays tags in the correct language

## 📝 Adding New Tags

### Via API
```bash
curl -X POST "http://localhost:3001/api/tags" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "mystical-poet",
    "label": "صوفي شاعر",
    "tag_type": "Poet",
    "translations": {
      "sd": {
        "title": "صوفي شاعر",
        "detail": "صوفي شاعري ڪندڙ"
      },
      "en": {
        "title": "Mystical Poet",
        "detail": "A poet who writes mystical poetry"
      }
    }
  }'
```

### Via Database
```sql
-- Insert new tag
INSERT INTO public.tags (slug, label, tag_type) 
VALUES ('mystical-poet', 'صوفي شاعر', 'Poet');

-- Insert translations
INSERT INTO public.tags_translations (tag_id, lang_code, title, detail) 
VALUES 
  (LASTVAL(), 'sd', 'صوفي شاعر', 'صوفي شاعري ڪندڙ'),
  (LASTVAL(), 'en', 'Mystical Poet', 'A poet who writes mystical poetry');
```

## 🔍 Troubleshooting

### Tags Not Translating
1. Check if the tag exists in the database:
   ```sql
   SELECT * FROM tags WHERE slug = 'your-tag-slug';
   ```

2. Check if translations exist:
   ```sql
   SELECT * FROM tags_translations WHERE tag_id = (SELECT id FROM tags WHERE slug = 'your-tag-slug');
   ```

3. Check the API response:
   ```bash
   curl "http://localhost:3001/api/tags?lang=sd&type=Poet"
   ```

### Performance Issues
- The system caches database tags in component state
- Tags are fetched once per language change
- Database queries are optimized with proper indexes

## 🎨 Customization

You can easily customize the tag system by:
- Adding new tag types in the `tag_type` field
- Modifying the translation logic in `getTranslatedTag()`
- Adding new language codes (beyond 'en' and 'sd')
- Extending the API endpoints for more functionality
