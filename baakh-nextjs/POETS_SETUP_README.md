# Poets CRUD Setup Guide

This guide explains how to set up and use the complete CRUD (Create, Read, Update, Delete) functionality for poets in your Baakh NextJS application.

## 🚀 Quick Start

1. **Run the setup script:**
   ```bash
   ./setup_poets_database.sh
   ```

2. **Or manually set up the database:**
   - Copy the SQL from `setup_poets_table.sql`
   - Run it in your Supabase SQL Editor

3. **Test the functionality:**
   - Visit `/admin/poets/create` to add a new poet
   - Visit `/admin/poets` to view and manage poets

## 📋 Prerequisites

- Supabase project set up
- Environment variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 🗄️ Database Schema

The `poets` table includes:

### Core Fields
- `id` - UUID primary key
- `poet_slug` - Unique URL-friendly identifier
- `created_at` / `updated_at` - Timestamps

### Basic Information
- `birth_date` / `death_date` - Text fields for dates
- `birth_place` / `death_place` - Location information
- `tags` - Array of tags for categorization
- `file_url` - Optional image file URL
- `is_featured` / `is_hidden` - Boolean flags

### Bilingual Content
- **Sindhi fields:**
  - `sindhi_name` - Required name in Sindhi
  - `sindhi_laqab` - Honorific title
  - `sindhi_takhalus` - Pen name
  - `sindhi_tagline` - Short description
  - `sindhi_details` - Required detailed biography

- **English fields:**
  - `english_name` - Required name in English
  - `english_laqab` - Honorific title
  - `english_takhalus` - Pen name
  - `english_tagline` - Short description
  - `english_details` - Required detailed biography

## 🔌 API Endpoints

### List All Poets
```
GET /api/admin/poets
```
Returns all poets ordered by creation date.

### Create New Poet
```
POST /api/admin/poets
```
Creates a new poet. Requires:
- `poet_slug` (unique)
- `sindhi.name`
- `english.name`
- `sindhi.details`
- `english.details`

### Get Single Poet
```
GET /api/admin/poets/[id]
```
Returns a specific poet by ID.

### Update Poet
```
PUT /api/admin/poets/[id]
```
Updates an existing poet. Same validation as create.

### Delete Poet
```
DELETE /api/admin/poets/[id]
```
Deletes a poet permanently.

## 🎨 Frontend Components

### PoetForm Component
- **Location:** `src/components/forms/PoetForm.tsx`
- **Features:**
  - Bilingual form (Sindhi/English)
  - File upload for poet images
  - Tag management
  - Auto-save functionality
  - Form validation
  - Slug generation

### Poets List Page
- **Location:** `src/app/admin/poets/page.tsx`
- **Features:**
  - Grid view of all poets
  - Search and filtering
  - Toggle featured/hidden status
  - Edit and delete actions
  - Statistics dashboard

## 🔧 Configuration

### Environment Variables
```bash
# Required for API routes
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional for client-side
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Storage
The system uses a `poet-images` bucket for storing poet profile images. Ensure this bucket exists and has proper permissions.

## 📱 Usage Examples

### Creating a New Poet
1. Navigate to `/admin/poets/create`
2. Fill in the bilingual form
3. Upload an optional profile image
4. Add relevant tags
5. Submit the form

### Editing a Poet
1. Navigate to `/admin/poets`
2. Click the edit button on any poet card
3. Modify the information
4. Save changes

### Managing Poet Status
- **Featured:** Toggle the star icon to feature poets
- **Hidden:** Toggle the eye icon to hide poets from public view

## 🚨 Error Handling

The system includes comprehensive error handling:
- **Validation errors** are displayed in the form
- **API errors** are logged and user-friendly messages shown
- **Fallback mechanisms** ensure the UI remains functional
- **Graceful degradation** when Supabase is unavailable

## 🔄 Data Flow

1. **Form Submission** → API validation → Database insertion
2. **Auto-save** → Periodic updates during editing
3. **List Updates** → Real-time UI updates after operations
4. **Image Upload** → Supabase Storage → Public URL generation

## 🧪 Testing

### Test the API
```bash
# List poets
curl http://localhost:3000/api/admin/poets

# Create a test poet
curl -X POST http://localhost:3000/api/admin/poets \
  -H "Content-Type: application/json" \
  -d '{
    "poet_slug": "test-poet",
    "sindhi": {
      "name": "تست شاعر",
      "details": "هي هڪ ٽيسٽ شاعر آهي"
    },
    "english": {
      "name": "Test Poet",
      "details": "This is a test poet"
    }
  }'
```

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot access before initialization" error:**
   - ✅ Fixed: Function order issue resolved

2. **API endpoints not working:**
   - Check environment variables
   - Verify Supabase permissions
   - Check browser console for errors

3. **Image upload failures:**
   - Verify `poet-images` bucket exists
   - Check storage permissions
   - Ensure file size limits

4. **Database connection issues:**
   - Run the setup script
   - Check Supabase dashboard
   - Verify service role key permissions

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hook Form](https://react-hook-form.com/)

## 🤝 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Test the API endpoints directly
4. Check Supabase dashboard for database issues

---

**Happy coding! 🎉**
