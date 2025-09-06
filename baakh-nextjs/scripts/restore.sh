#!/bin/bash

# Baakh Poetry Archive - Database Restore Script
# This script restores database from backup files

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Baakh Poetry Archive - Database Restore${NC}"
echo "================================================"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file.sql>"
    echo ""
    echo "Available backups:"
    if [ -d "../backups" ]; then
        find ../backups -name "*.sql" -type f | head -10
    else
        echo "No backups directory found"
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}Backup file:${NC} $BACKUP_FILE"

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

# Extract project ID
PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
echo -e "${GREEN}Project ID:${NC} $PROJECT_ID"

# Safety confirmation
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will overwrite your current database! ⚠️${NC}"
echo ""
echo "Target database: $PROJECT_ID.supabase.co"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql not found${NC}"
    echo "Please install PostgreSQL client:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Perform restore
echo ""
echo -e "${GREEN}Starting database restore...${NC}"
echo "This may take several minutes depending on backup size..."

PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
    --host="$PROJECT_ID.supabase.co" \
    --port=5432 \
    --username=postgres \
    --dbname=postgres \
    --file="$BACKUP_FILE" \
    --echo-all \
    --verbose

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Database restore completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify data integrity"
    echo "2. Test application functionality"
    echo "3. Update any necessary configurations"
else
    echo ""
    echo -e "${RED}❌ Database restore failed${NC}"
    echo "Please check the error messages above"
    exit 1
fi
