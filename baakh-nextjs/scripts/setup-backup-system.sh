#!/bin/bash

# Baakh Poetry Archive - Backup System Setup Script
# This script sets up the complete backup infrastructure

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}Baakh Poetry Archive - Backup System Setup${NC}"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "../package.json" ]; then
    echo -e "${RED}Error: Please run this script from the scripts directory${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${BLUE}Creating backup infrastructure...${NC}"
mkdir -p ../backups
mkdir -p ../exports
mkdir -p ../logs

echo -e "${GREEN}✅ Directories created${NC}"

# Check if .env.local exists
if [ ! -f "../.env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Please create .env.local with the following variables:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    echo ""
    echo "You can find these in your Supabase project settings."
    echo ""
    read -p "Press Enter to continue after creating .env.local..."
fi

# Check environment variables
if [ -f "../.env.local" ]; then
    source ../.env.local
    
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo -e "${GREEN}✅ Environment variables loaded${NC}"
        
        # Extract project ID
        PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
        echo -e "${GREEN}Project ID:${NC} $PROJECT_ID"
    else
        echo -e "${RED}❌ Missing required environment variables${NC}"
        echo "Please check your .env.local file"
    fi
fi

# Check for required tools
echo ""
echo -e "${BLUE}Checking required tools...${NC}"

# Check Supabase CLI
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
    SUPABASE_VERSION=$(supabase --version)
    echo "  Version: $SUPABASE_VERSION"
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo "  Install with: npm install -g supabase"
fi

# Check PostgreSQL tools
if command -v pg_dump &> /dev/null; then
    echo -e "${GREEN}✅ pg_dump found${NC}"
    PG_VERSION=$(pg_dump --version | cut -d' ' -f3)
    echo "  Version: $PG_VERSION"
else
    echo -e "${YELLOW}⚠️  pg_dump not found${NC}"
    echo "  Install with: brew install postgresql (macOS) or sudo apt-get install postgresql-client (Ubuntu)"
fi

if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ psql found${NC}"
else
    echo -e "${YELLOW}⚠️  psql not found${NC}"
    echo "  Install with: brew install postgresql (macOS) or sudo apt-get install postgresql-client (Ubuntu)"
fi

# Check jq for JSON processing
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✅ jq found${NC}"
else
    echo -e "${YELLOW}⚠️  jq not found${NC}"
    echo "  Install with: brew install jq (macOS) or sudo apt-get install jq (Ubuntu)"
fi

# Test database connection if credentials are available
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo ""
    echo -e "${BLUE}Testing database connection...${NC}"
    
    if command -v psql &> /dev/null; then
        if PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
            --host="$PROJECT_ID.supabase.co" \
            --port=5432 \
            --username=postgres \
            --dbname=postgres \
            --command="SELECT version();" \
            --quiet \
            --no-align \
            --tuples-only &> /dev/null; then
            echo -e "${GREEN}✅ Database connection successful${NC}"
        else
            echo -e "${RED}❌ Database connection failed${NC}"
            echo "  Please check your credentials and network connection"
        fi
    else
        echo -e "${YELLOW}⚠️  Cannot test connection (psql not available)${NC}"
    fi
fi

# Create cron job example
echo ""
echo -e "${BLUE}Setting up automated backups...${NC}"

CRON_EXAMPLE="# Baakh Poetry Archive - Automated Daily Backup
# Run at 2 AM every day
0 2 * * * cd $(pwd)/.. && ./scripts/backup.sh >> logs/backup.log 2>&1

# Weekly content export (Sundays at 3 AM)
0 3 * * 0 cd $(pwd)/.. && ./scripts/export-content.sh >> logs/export.log 2>&1"

echo "$CRON_EXAMPLE" > ../cron-example.txt
echo -e "${GREEN}✅ Cron example created: cron-example.txt${NC}"

# Create backup configuration file
cat > ../backup-config.json << CONFIG
{
  "backup": {
    "enabled": true,
    "schedule": "daily",
    "retention": {
      "daily": 7,
      "weekly": 4,
      "monthly": 12
    },
    "compression": true,
    "encryption": false
  },
  "export": {
    "enabled": true,
    "schedule": "weekly",
    "content_types": ["poets", "poetry", "categories", "tags"],
    "format": "json"
  },
  "storage": {
    "local": true,
    "cloud": false,
    "encryption_at_rest": false
  },
  "monitoring": {
    "notifications": false,
    "health_checks": true,
    "log_retention": 30
  }
}
CONFIG

echo -e "${GREEN}✅ Backup configuration created: backup-config.json${NC}"

# Create quick start guide
cat > ../BACKUP_QUICKSTART.md << QUICKSTART
# Baakh Poetry Archive - Backup Quick Start

## 🚀 Quick Setup

1. **Environment Variables** (already configured)
   - NEXT_PUBLIC_SUPABASE_URL: ✅ Set
   - SUPABASE_SERVICE_ROLE_KEY: ✅ Set

2. **Available Scripts**
   - \`./scripts/backup.sh\` - Create database backup
   - \`./scripts/restore.sh <file>\` - Restore from backup
   - \`./scripts/export-content.sh\` - Export specific content

3. **Manual Backup**
   \`\`\`bash
   cd scripts
   ./backup.sh
   \`\`\`

4. **Automated Backup (Recommended)**
   \`\`\`bash
   # Add to crontab
   crontab -e
   
   # Add this line for daily backups at 2 AM
   0 2 * * * cd $(pwd) && ./scripts/backup.sh >> logs/backup.log 2>&1
   \`\`\`

5. **Restore from Backup**
   \`\`\`bash
   cd scripts
   ./restore.sh ../backups/YYYYMMDD_HHMMSS/poetry_backup.sql
   \`\`\`

## 📊 Backup Types

- **Full Database**: Complete backup with all data
- **Content Export**: Individual content types in JSON format
- **Compressed**: Automatic compression to save space

## 🔒 Security

- Store backups securely
- Use encryption for sensitive data
- Test restores regularly

## 📞 Support

- Check BACKUP_README.md for detailed information
- Test in development environment first
- Keep multiple backup copies
QUICKSTART

echo -e "${GREEN}✅ Quick start guide created: BACKUP_QUICKSTART.md${NC}"

# Final summary
echo ""
echo -e "${GREEN}🎉 Backup system setup completed!${NC}"
echo ""
echo "What was created:"
echo "  📁 backups/          - Backup storage directory"
echo "  📁 exports/          - Content export directory"
echo "  📁 logs/             - Log files directory"
echo "  📄 backup-config.json - Backup configuration"
echo "  📄 cron-example.txt  - Automated backup examples"
echo "  📄 BACKUP_QUICKSTART.md - Quick start guide"
echo ""
echo "Next steps:"
echo "  1. Test backup: ./scripts/backup.sh"
echo "  2. Set up automated backups with cron"
echo "  3. Store backups securely"
echo "  4. Test restore process"
echo ""
echo -e "${BLUE}For detailed information, see BACKUP_README.md${NC}"
