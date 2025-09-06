# Storage Bucket Setup Guide

This guide will help you resolve the **"StorageApiError: Bucket not found"** error that occurs when trying to upload poet images.

## 🚨 **The Problem**

When you try to create or update poetry data with images, you get this error:
```
StorageApiError: Bucket not found
```

This happens because the Supabase storage bucket `poet-images` doesn't exist in your project.

## 🛠️ **Quick Fix: Set Up Storage Bucket**

### **Option 1: Run the Setup Script (Recommended)**

1. **Make the script executable:**
   ```bash
   chmod +x setup_storage.sh
   ```

2. **Run the setup script:**
   ```bash
   ./setup_storage.sh
   ```

3. **Follow the interactive instructions** to set up your storage bucket.

### **Option 2: Manual Setup via Supabase Dashboard**

1. **Go to your Supabase Dashboard:**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to Storage:**
   - Click on **Storage** in the left sidebar
   - Click **Create a new bucket**

3. **Configure the bucket:**
   - **Bucket name:** `poet-images`
   - **Public bucket:** ✅ Check this (allows public read access)
   - **File size limit:** `5MB`
   - **Allowed MIME types:** Add these one by one:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/gif`

4. **Click Create bucket**

### **Option 3: SQL Setup (Advanced Users)**

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste** the contents of `setup_storage_bucket.sql`
3. **Click Run** to execute the script

### **Option 4: Fix RLS Policies (If you get "violates row-level security policy")**

If you're getting RLS policy errors after creating the bucket:
1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste** the contents of `fix_storage_rls.sql`
3. **Click Run** to execute the script

This will fix Row-Level Security policy issues that prevent authenticated users from uploading files.

## 🔧 **What the Setup Creates**

✅ **Storage bucket** named `poet-images`
✅ **Public read access** to all images
✅ **Authenticated user upload** permissions
✅ **File size limits** (5MB max)
✅ **MIME type restrictions** (images only)
✅ **Automatic cleanup** of orphaned images
✅ **Security policies** for proper access control

## 🧪 **Test the Setup**

1. **Go to Storage** in your Supabase dashboard
2. **Click on the `poet-images` bucket**
3. **Try uploading a test image** to verify permissions work
4. **Check that the image is publicly accessible**

## 🚀 **After Setup**

Once the storage bucket is created:

- ✅ **Poetry forms** will work without errors
- ✅ **Image uploads** will succeed
- ✅ **Public access** to poet images will work
- ✅ **Automatic cleanup** will prevent orphaned files

## 🐛 **Troubleshooting**

### **Still Getting "Bucket not found" Error?**

1. **Verify bucket exists:**
   - Go to Storage in Supabase dashboard
   - Check if `poet-images` bucket is visible

2. **Check bucket permissions:**
   - Ensure the bucket is public
   - Verify file size and MIME type settings

3. **Check environment variables:**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid

4. **Check Supabase project:**

### **Getting "violates row-level security policy" Error?**

This means the bucket exists but the security policies aren't working correctly:

1. **Run the RLS fix script:**
   - Use `fix_storage_rls.sql` in the SQL Editor
   - This creates permissive policies that will definitely work

2. **Check authentication:**
   - Ensure you're logged in to the admin panel
   - Verify your user has proper permissions

3. **Test with the HTML test page:**
   - Open `test_storage.html` in your browser
   - Enter your Supabase credentials and test the setup
   - Ensure you're in the correct project
   - Verify you have admin access

### **Permission Denied Errors?**

1. **Check RLS policies:**
   - The setup script creates proper policies
   - Ensure you're authenticated when uploading

2. **Verify user role:**
   - Check if your user has proper permissions
   - Ensure you're logged in to the admin panel

### **File Upload Fails?**

1. **Check file size:** Must be under 5MB
2. **Check file type:** Must be JPEG, PNG, WebP, or GIF
3. **Check network:** Ensure stable internet connection
4. **Check browser console:** Look for detailed error messages

## 📚 **Additional Resources**

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/policies)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)

## 🆘 **Need Help?**

If you're still experiencing issues:

1. **Check the browser console** for detailed error messages
2. **Verify your Supabase project settings**
3. **Ensure all environment variables are correct**
4. **Check that you have admin access to your project**

## 🎯 **Quick Commands**

```bash
# Make setup script executable
chmod +x setup_storage.sh

# Run the setup guide
./setup_storage.sh

# Check if you're in the right directory
ls -la setup_storage_bucket.sql
```

---

**After completing this setup, your poetry forms should work perfectly with image uploads! 🎉**
