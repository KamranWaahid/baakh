#!/bin/bash

# Baakh Poetry Archive - Simple Backup Script
# This script creates database backups using Supabase CLI or direct pg_dump

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Baakh Poetry Archive - Database Backup${NC}"
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

# Extract project ID
PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
echo -e "${GREEN}Project ID:${NC} $PROJECT_ID"

# Create backup directory
BACKUP_DIR="../backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}Backup directory:${NC} $BACKUP_DIR"

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}Using Supabase CLI for backup...${NC}"
    
    # Link project if not already linked
    if [ ! -f "../.supabase/config.toml" ]; then
        echo "Linking to Supabase project..."
        supabase link --project-ref "$PROJECT_ID"
    fi
    
    # Create backup
    supabase db dump -f "$BACKUP_DIR/poetry_backup.sql"
    echo -e "${GREEN}Backup created:${NC} $BACKUP_DIR/poetry_backup.sql"
    
else
    echo -e "${YELLOW}Supabase CLI not found, using pg_dump...${NC}"
    
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        echo -e "${RED}Error: Neither supabase CLI nor pg_dump found${NC}"
        echo "Please install one of them:"
        echo "  - Supabase CLI: npm install -g supabase"
        echo "  - PostgreSQL: brew install postgresql (macOS) or apt-get install postgresql-client (Ubuntu)"
        exit 1
    fi
    
    # Create backup with pg_dump
    echo "Creating backup with pg_dump..."
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" pg_dump \
        --host="$PROJECT_ID.supabase.co" \
        --port=5432 \
        --username=postgres \
        --dbname=postgres \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --verbose \
        --file="$BACKUP_DIR/poetry_backup.sql"
    
    echo -e "${GREEN}Backup created:${NC} $BACKUP_DIR/poetry_backup.sql"
fi

# Create backup info file
cat > "$BACKUP_DIR/backup_info.txt" << INFO
Baakh Poetry Archive Backup
============================
Date: $(date)
Project: $PROJECT_ID
Method: $(command -v supabase &> /dev/null && echo "Supabase CLI" || echo "pg_dump")
File: poetry_backup.sql

Restore Command:
psql -f poetry_backup.sql "postgresql://postgres:YOUR_PASSWORD@$PROJECT_ID.supabase.co:5432/postgres"

Notes:
- This is a logical backup of your poetry database
- Store securely with encryption at rest
- Test restore in development environment first
INFO

echo -e "${GREEN}Backup info created:${NC} $BACKUP_DIR/backup_info.txt"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Store backup securely"
echo "2. Test restore in development environment"
echo "3. Consider automating this script with cron"
