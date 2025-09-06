#!/bin/bash

# Baakh Poetry Archive - Database Backup Utilities
# This script provides comprehensive backup functionality for the Sindhi poetry database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="baakh-poetry-archive"

# Load environment variables if .env file exists
if [ -f "${SCRIPT_DIR}/../.env.local" ]; then
    source "${SCRIPT_DIR}/../.env.local"
fi

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check required environment variables
check_env_vars() {
    local missing_vars=()
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        print_error "Please set them in your .env.local file"
        exit 1
    fi
    
    print_success "Environment variables validated"
}

# Function to extract database connection details
extract_db_details() {
    # Extract project ID from Supabase URL
    PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
    
    # Database connection details
    DB_HOST="${PROJECT_ID}.supabase.co"
    DB_PORT="5432"
    DB_NAME="postgres"
    DB_USER="postgres"
    
    print_status "Project ID: $PROJECT_ID"
    print_status "Database Host: $DB_HOST"
}

# Function to create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_success "Created backup directory: $BACKUP_DIR"
    fi
    
    # Create timestamped subdirectory
    BACKUP_SUBDIR="${BACKUP_DIR}/${TIMESTAMP}"
    mkdir -p "$BACKUP_SUBDIR"
    print_success "Created backup subdirectory: $BACKUP_SUBDIR"
}

# Function to create SQL dump backup
create_sql_dump() {
    local filename="${BACKUP_SUBDIR}/${PROJECT_NAME}_${TIMESTAMP}.sql"
    
    print_status "Creating SQL dump backup..."
    
    # Use pg_dump for SQL format
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --verbose \
        --file="$filename" \
        2>/dev/null || {
            print_error "Failed to create SQL dump"
            return 1
        }
    
    if [ -f "$filename" ]; then
        local size=$(du -h "$filename" | cut -f1)
        print_success "SQL dump created: $filename (Size: $size)"
        echo "$filename" > "${BACKUP_SUBDIR}/sql_dump_path.txt"
    else
        print_error "SQL dump file not found after creation"
        return 1
    fi
}

# Function to create custom format backup
create_custom_dump() {
    local filename="${BACKUP_SUBDIR}/${PROJECT_NAME}_${TIMESTAMP}.dump"
    
    print_status "Creating custom format backup..."
    
    # Use pg_dump for custom format (better for restore)
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --format=custom \
        --no-owner \
        --no-privileges \
        --verbose \
        --file="$filename" \
        2>/dev/null || {
            print_error "Failed to create custom format dump"
            return 1
        }
    
    if [ -f "$filename" ]; then
        local size=$(du -h "$filename" | cut -f1)
        print_success "Custom format dump created: $filename (Size: $size)"
        echo "$filename" > "${BACKUP_SUBDIR}/custom_dump_path.txt"
    else
        print_error "Custom format dump file not found after creation"
        return 1
    fi
}

# Function to create content-specific exports
export_content() {
    local content_type="$1"
    local filename="${BACKUP_SUBDIR}/${content_type}_${TIMESTAMP}.json"
    
    print_status "Exporting $content_type content..."
    
    # Use Supabase CLI or direct API calls to export specific content
    case "$content_type" in
        "poets")
            # Export poets data
            curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/poets?select=*" \
                -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
                -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
                -o "$filename" || {
                    print_error "Failed to export poets data"
                    return 1
                }
            ;;
        "poetry")
            # Export poetry data
            curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/poetry_main?select=*" \
                -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
                -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
                -o "$filename" || {
                    print_error "Failed to export poetry data"
                    return 1
                }
            ;;
        "categories")
            # Export categories data
            curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/categories?select=*" \
                -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
                -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
                -o "$filename" || {
                    print_error "Failed to export categories data"
                    return 1
                }
            ;;
        "tags")
            # Export tags data
            curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tags?select=*" \
                -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
                -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
                -o "$filename" || {
                    print_error "Failed to export tags data"
                    return 1
                }
            ;;
        *)
            print_error "Unknown content type: $content_type"
            return 1
            ;;
    esac
    
    if [ -f "$filename" ]; then
        local size=$(du -h "$filename" | cut -f1)
        print_success "$content_type export created: $filename (Size: $size)"
    else
        print_error "$content_type export file not found after creation"
        return 1
    fi
}

# Function to create backup manifest
create_manifest() {
    local manifest_file="${BACKUP_SUBDIR}/backup_manifest.txt"
    
    cat > "$manifest_file" << EOF
Baakh Poetry Archive - Database Backup Manifest
===============================================

Backup Date: $(date)
Timestamp: $TIMESTAMP
Project: $PROJECT_NAME

Backup Contents:
$(ls -la "$BACKUP_SUBDIR" | grep -v "manifest.txt" | tail -n +2)

Database Information:
- Host: $DB_HOST
- Database: $DB_NAME
- Backup Type: Full database backup

Restore Instructions:
1. SQL Dump: psql -f <sql_file> "postgresql://..."
2. Custom Dump: pg_restore --clean --if-exists -d "postgresql://..." <dump_file>

Content Exports:
- Use JSON files for specific content migration
- Import using your application's data import functions

Security Notes:
- Store backup files securely
- Use encryption at rest for sensitive data
- Test restores in development environment first

EOF

    print_success "Backup manifest created: $manifest_file"
}

# Function to compress backup directory
compress_backup() {
    local archive_name="${BACKUP_DIR}/${PROJECT_NAME}_${TIMESTAMP}.tar.gz"
    
    print_status "Compressing backup directory..."
    
    tar -czf "$archive_name" -C "$BACKUP_DIR" "$TIMESTAMP" || {
        print_error "Failed to compress backup directory"
        return 1
    }
    
    if [ -f "$archive_name" ]; then
        local size=$(du -h "$archive_name" | cut -f1)
        print_success "Backup compressed: $archive_name (Size: $size)"
        
        # Remove uncompressed directory
        rm -rf "$BACKUP_SUBDIR"
        print_status "Removed uncompressed backup directory"
    else
        print_error "Compressed archive not found after creation"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    local max_backups=10
    local current_backups=$(find "$BACKUP_DIR" -name "*.tar.gz" | wc -l)
    
    if [ "$current_backups" -gt "$max_backups" ]; then
        print_status "Cleaning up old backups (keeping $max_backups most recent)..."
        
        # Keep only the most recent backups
        find "$BACKUP_DIR" -name "*.tar.gz" -type f -printf '%T@ %p\n' | \
            sort -nr | \
            tail -n +$((max_backups + 1)) | \
            cut -d' ' -f2- | \
            xargs rm -f
        
        print_success "Old backups cleaned up"
    else
        print_status "No cleanup needed (current: $current_backups, max: $max_backups)"
    fi
}

# Function to test database connection
test_connection() {
    print_status "Testing database connection..."
    
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --command="SELECT version();" \
        --quiet \
        --no-align \
        --tuples-only || {
            print_error "Database connection test failed"
            return 1
        }
    
    print_success "Database connection test passed"
}

# Function to show backup status
show_backup_status() {
    print_status "Backup Status:"
    echo "  - Backup Directory: $BACKUP_DIR"
    echo "  - Total Backups: $(find "$BACKUP_DIR" -name "*.tar.gz" | wc -l)"
    echo "  - Latest Backup: $(find "$BACKUP_DIR" -name "*.tar.gz" -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2- | xargs basename 2>/dev/null || echo 'None')"
    echo "  - Available Space: $(df -h "$BACKUP_DIR" | tail -1 | awk '{print $4}')"
}

# Main backup function
main_backup() {
    print_status "Starting Baakh Poetry Archive backup process..."
    
    check_env_vars
    extract_db_details
    test_connection
    create_backup_dir
    
    # Create different types of backups
    create_sql_dump
    create_custom_dump
    
    # Export specific content types
    export_content "poets"
    export_content "poetry"
    export_content "categories"
    export_content "tags"
    
    create_manifest
    compress_backup
    cleanup_old_backups
    
    print_success "Backup process completed successfully!"
    show_backup_status
}

# Function to restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file to restore from"
        echo "Usage: $0 restore <backup_file.tar.gz>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will overwrite your current database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    print_status "Starting restore process from: $backup_file"
    
    check_env_vars
    extract_db_details
    test_connection
    
    # Extract backup
    local temp_dir=$(mktemp -d)
    tar -xzf "$backup_file" -C "$temp_dir"
    
    # Find the backup directory
    local backup_subdir=$(find "$temp_dir" -type d -name "*" | head -1)
    
    if [ -z "$backup_subdir" ]; then
        print_error "Invalid backup archive structure"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # Restore database
    local sql_dump=$(find "$backup_subdir" -name "*.sql" | head -1)
    if [ -n "$sql_dump" ]; then
        print_status "Restoring from SQL dump: $sql_dump"
        PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --file="$sql_dump" || {
                print_error "SQL restore failed"
                rm -rf "$temp_dir"
                exit 1
            }
    else
        print_error "No SQL dump found in backup"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
    print_success "Restore completed successfully!"
}

# Function to show help
show_help() {
    cat << EOF
Baakh Poetry Archive - Database Backup Utilities

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  backup              Create a complete database backup
  restore <file>      Restore database from backup file
  status              Show backup status and information
  test                Test database connection
  help                Show this help message

Examples:
  $0 backup                    # Create a new backup
  $0 restore backup.tar.gz    # Restore from backup file
  $0 status                   # Show backup status
  $0 test                     # Test database connection

Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL    Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY   Supabase service role key

Backup Contents:
  - Full database SQL dump
  - Custom format dump (.dump)
  - Individual content exports (poets, poetry, categories, tags)
  - Backup manifest and metadata
  - Compressed archive (.tar.gz)

EOF
}

# Main script logic
case "${1:-backup}" in
    "backup")
        main_backup
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "status")
        show_backup_status
        ;;
    "test")
        check_env_vars
        extract_db_details
        test_connection
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
