#!/bin/bash

# Baakh Poetry Archive - Content Export Script
# This script exports specific content types for migration or analysis

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Baakh Poetry Archive - Content Export${NC}"
echo "=============================================="

# Check if .env.local exists
if [ ! -f "../.env.local" ]; then
    echo -e "${RED}Error: .env.local file not found${NC}"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
source ../.env.local

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}Error: Missing required environment variables${NC}"
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Create export directory
EXPORT_DIR="../exports/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"
echo -e "${GREEN}Export directory:${NC} $EXPORT_DIR"

# Function to export content
export_content() {
    local content_type="$1"
    local endpoint="$2"
    local filename="$EXPORT_DIR/${content_type}_export.json"
    
    echo -e "${GREEN}Exporting $content_type...${NC}"
    
    curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${endpoint}?select=*" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -o "$filename"
    
    if [ -f "$filename" ]; then
        local size=$(du -h "$filename" | cut -f1)
        local count=$(jq length "$filename" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ $content_type exported:${NC} $filename (Size: $size, Records: $count)"
    else
        echo -e "${RED}❌ Failed to export $content_type${NC}"
    fi
}

# Export different content types
export_content "poets" "poets"
export_content "poetry" "poetry_main"
export_content "categories" "categories"
export_content "tags" "tags"

# Create export summary
cat > "$EXPORT_DIR/export_summary.txt" << SUMMARY
Baakh Poetry Archive - Content Export Summary
=============================================
Date: $(date)
Export Directory: $EXPORT_DIR

Exported Content:
- Poets: $(ls -la "$EXPORT_DIR"/poets_export.json 2>/dev/null | awk '{print $5}' || echo "failed")
- Poetry: $(ls -la "$EXPORT_DIR"/poetry_export.json 2>/dev/null | awk '{print $5}' || echo "failed")
- Categories: $(ls -la "$EXPORT_DIR"/categories_export.json 2>/dev/null | awk '{print $5}' || echo "failed")
- Tags: $(ls -la "$EXPORT_DIR"/tags_export.json 2>/dev/null | awk '{print $5}' || echo "failed")

Notes:
- JSON files contain all data for each content type
- Use for migration, analysis, or backup purposes
- Import using your application's data import functions
SUMMARY

echo ""
echo -e "${GREEN}✅ Content export completed!${NC}"
echo -e "${GREEN}Export directory:${NC} $EXPORT_DIR"
echo ""
echo "Next steps:"
echo "1. Review exported files"
echo "2. Store securely for backup"
echo "3. Use for data analysis or migration"
