# Baakh Poetry Archive - Database Backup Guide

This guide covers comprehensive backup strategies for your Sindhi poetry archive database.

## 🎯 Backup Strategy Overview

Your poetry archive uses a **small Postgres database** (text-only content), making it perfect for logical backups that you can download and manage yourself.

## 📊 Backup Methods

### 1. **Supabase Dashboard Backups (Recommended for Production)**

**Location:** Supabase Dashboard → Project → Database → Backups

**What you get:**
- Scheduled logical backups (usually daily)
- Downloadable .sql files
- Automatic retention management
- No additional setup required

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Database** → **Backups**
4. Click **Download** on any backup file
5. Store securely with versioning

**Note:** PITR (Point-in-Time Recovery) is typically disabled for small apps, which is fine for text archives.

### 2. **Supabase CLI Backups (Automation & Development)**

**Installation:**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

**Create SQL Dump:**
```bash
supabase db dump -f poetry_backup.sql
```

### 3. **Direct Database Backups (Advanced Users)**

**SQL Format:**
```bash
pg_dump \
  --host=YOUR_PROJECT_ID.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --verbose \
  --file=poetry_backup.sql
```

## 🔄 Restore Procedures

### From SQL Dump:
```bash
psql -f poetry_backup.sql "postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_ID.supabase.co:5432/postgres"
```

## 🛡️ Security Best Practices

### 1. **Environment Variables**
Store your credentials securely in .env.local

### 2. **Backup Storage**
- Local: Encrypted storage with strong passwords
- Cloud: Use cloud storage with versioning enabled
- Access Control: Limit backup access to authorized personnel only

## 📅 Backup Schedule Recommendations

### **Development Environment:**
- Frequency: Before major changes
- Retention: Keep last 5 backups
- Type: SQL dumps (faster, smaller)

### **Production Environment:**
- Frequency: Daily automated backups
- Retention: Keep last 30 days + monthly backups for 1 year
- Type: Both SQL and custom format
- Testing: Monthly restore tests

## 🧪 Testing Your Backups

### **Regular Restore Tests:**
1. Create a test database
2. Restore from your latest backup
3. Verify data integrity
4. Test application functionality
5. Document any issues

---

**Remember:** Regular backups are your safety net. Test them regularly and keep multiple copies in different locations!
