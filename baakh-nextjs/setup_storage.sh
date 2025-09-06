#!/bin/bash

# Baakh Poetry Archive - Storage Bucket Setup Script
# This script helps you set up the Supabase storage bucket for poet images

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}Baakh Poetry Archive - Storage Bucket Setup${NC}"
echo "=================================================="
echo ""

echo -e "${BLUE}This script will help you set up the Supabase storage bucket for poet images.${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "setup_storage_bucket.sql" ]; then
    echo -e "${RED}Error: setup_storage_bucket.sql not found in current directory${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${YELLOW}Step 1: Access Your Supabase Dashboard${NC}"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Navigate to SQL Editor in the left sidebar"
echo ""

echo -e "${YELLOW}Step 2: Run the Storage Setup SQL${NC}"
echo "1. Copy the contents of setup_storage_bucket.sql"
echo "2. Paste it into the SQL Editor"
echo "3. Click 'Run' to execute the script"
echo ""

echo -e "${YELLOW}Step 3: Verify the Setup${NC}"
echo "After running the SQL, you should see:"
echo "- A confirmation message: 'Storage bucket setup complete!'"
echo "- Bucket details including 'poet-images' as the bucket name"
echo "- Storage policies for the bucket"
echo ""

echo -e "${YELLOW}Step 4: Test the Setup${NC}"
echo "1. Go to Storage in your Supabase dashboard"
echo "2. You should see a 'poet-images' bucket"
echo "3. Try uploading a test image to verify permissions"
echo ""

echo -e "${GREEN}Alternative: Manual Setup via Dashboard${NC}"
echo "If you prefer to use the UI instead of SQL:"
echo "1. Go to Storage in Supabase dashboard"
echo "2. Click 'Create a new bucket'"
echo "3. Set bucket name: 'poet-images'"
echo "4. Make it public"
echo "5. Set file size limit to 5MB"
echo "6. Add allowed MIME types: image/jpeg, image/png, image/webp, image/gif"
echo ""

echo -e "${BLUE}What This Setup Provides:${NC}"
echo "✅ Storage bucket for poet profile images"
echo "✅ Public read access to images"
echo "✅ Authenticated user upload permissions"
echo "✅ Automatic cleanup of orphaned images"
echo "✅ File size and type restrictions"
echo "✅ Proper security policies"
echo ""

echo -e "${YELLOW}After Setup:${NC}"
echo "Your poetry forms should now work without the 'Bucket not found' error."
echo "You can upload images when creating or editing poets."
echo ""

read -p "Press Enter when you've completed the storage setup..."

echo ""
echo -e "${GREEN}✅ Storage setup instructions completed!${NC}"
echo ""
echo "If you encounter any issues:"
echo "1. Check the Supabase dashboard for error messages"
echo "2. Verify your environment variables are correct"
echo "3. Ensure you have admin access to your Supabase project"
echo ""
echo "Happy coding! 🎉"

