# Baakh Tags System Setup Guide

This guide will help you set up and use the comprehensive tags system for the Baakh poetry platform.

## 🚀 Quick Start

### 1. Database Setup

First, you need to set up the database tables. Run the setup script:

```bash
# Make sure you're in the baakh-nextjs directory
cd baakh-nextjs

# Set your database connection details
export DATABASE_URL="postgresql://username:password@host:port/database"

# Or if using Supabase, set your project URL
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"

# Run the setup script
./setup_database.sh
```

### 2. Manual Database Setup (Alternative)

If you prefer to run the SQL manually:

```bash
# Connect to your database
psql "your-database-connection-string"

# Run the setup script
\i setup_tags_database.sql
```

## 🗄️ Database Structure

The system uses two main tables:

### `tags` Table
- `id`: Primary key (auto-increment)
- `slug`: Unique identifier (e.g., "love", "nature")
- `label`: Default label (usually in Sindhi)
- `tag_type`: Category (Poetry, Poet, Topic, Form, Theme, Category, Emotion)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### `tags_translations` Table
- `id`: Primary key (auto-increment)
- `tag_id`: Foreign key to tags table
- `lang_code`: Language code ('en' or 'sd')
- `title`: Translated title
- `detail`: Translated description
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## 🎯 Features

### Tag Types
- **Poetry**: Poetry-specific tags
- **Poet**: Poet-related tags
- **Topic**: Subject matter tags
- **Form**: Poetic form tags (Ghazal, Rubai, etc.)
- **Theme**: Thematic tags
- **Category**: Categorical tags
- **Emotion**: Emotional content tags

### Languages
- **Sindhi (sd)**: Right-to-left text support
- **English (en)**: Left-to-right text support

## 🛠️ API Endpoints

### GET `/api/admin/tags`
Fetch all tags with translations

### POST `/api/admin/tags`
Create or update a tag

**Request Body:**
```json
{
  "slug": "love",
  "type": "Emotion",
  "sindhi": {
    "title": "محبت",
    "details": "محبت جي شاعري"
  },
  "english": {
    "title": "Love",
    "details": "Poetry about love"
  }
}
```

### DELETE `/api/admin/tags?id={tag_id}`
Delete a tag and all its translations

## 🎨 Frontend Features

### Admin Interface (`/admin/tags`)
- **Create**: Add new tags with bilingual support
- **Read**: View all tags with search and filtering
- **Update**: Edit existing tags and translations
- **Delete**: Remove tags with confirmation
- **Search**: Find tags by slug, title, or content
- **Filter**: Filter by tag type
- **Pagination**: Handle large numbers of tags

### UI Components
- Responsive design with Tailwind CSS
- Framer Motion animations
- Modal dialogs for CRUD operations
- Form validation
- Toast notifications
- Loading states and skeletons

## 🔧 Configuration

### Environment Variables
```bash
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database connection (alternative)
DATABASE_URL=postgresql://username:password@host:port/database
```

### Permissions
The system requires the following database permissions:
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `tags` table
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `tags_translations` table
- Sequence access for auto-incrementing IDs

## 🚨 Troubleshooting

### Common Issues

#### 1. Foreign Key Constraint Error
```
insert or update on table "tags_translations" violates foreign key constraint "tags_translations_tag_id_fkey"
```

**Solution**: Ensure the `tags` table exists and has the correct structure. Run the setup script.

#### 2. Table Not Found
```
relation "tags" does not exist
```

**Solution**: Run the database setup script to create the required tables.

#### 3. Permission Denied
```
permission denied for table tags
```

**Solution**: Check that your database user has the required permissions on both tables.

#### 4. Next.js 15 Compatibility
```
Route "/api/categories/[slug]" used `params.slug`. `params` should be awaited before using its properties.
```

**Solution**: This has been fixed in the updated API routes. The `params` object is now properly awaited.

### Debug Mode

Enable detailed logging by checking the browser console and server logs for error messages.

## 📚 Usage Examples

### Creating a New Tag
1. Navigate to `/admin/tags`
2. Click "New Tag" button
3. Fill in the form:
   - Slug: `nature`
   - Type: `Theme`
   - Sindhi Title: `طبيعت`
   - Sindhi Details: `طبيعت جي شاعري`
   - English Title: `Nature`
   - English Details: `Poetry about nature`
4. Click "Create Tag"

### Editing a Tag
1. Find the tag in the list
2. Click the edit (pencil) icon
3. Modify the fields as needed
4. Click "Update Tag"

### Deleting a Tag
1. Find the tag in the list
2. Click the delete (trash) icon
3. Confirm deletion in the modal
4. Click "Delete Tag"

## 🔄 Data Flow

1. **Create**: Tag created in `tags` table → Translations added to `tags_translations`
2. **Read**: Tags fetched from `tags` → Translations joined from `tags_translations`
3. **Update**: Tag updated in `tags` → Translations upserted in `tags_translations`
4. **Delete**: Translations deleted first → Tag deleted from `tags` (CASCADE)

## 🎉 Success!

Once everything is set up, you'll have a fully functional tags system that:
- Supports bilingual content (Sindhi/English)
- Provides full CRUD operations
- Includes search and filtering
- Has a beautiful, responsive admin interface
- Integrates seamlessly with your poetry platform

Visit `/admin/tags` to start managing your tags!
