# Poetry Reports Database Schema

This directory contains the database schema and related files for the poetry reporting system in Supabase.

## Files

- `reports_schema.sql` - Complete SQL schema for the reports system
- `README.md` - This documentation file

## Setup Instructions

### 1. Run the SQL Schema

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `reports_schema.sql`
4. Execute the SQL to create all tables, functions, and policies

### 2. Environment Variables

Make sure you have the following environment variables set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Tables Created

#### Main Tables
- `poetry_reports` - Main reports table
- `report_statistics` - View for report statistics
- `admin_reports_view` - View for admin dashboard

#### Enums
- `report_category` - 'common' | 'additional'
- `report_reason` - All report reason types
- `report_status` - Report status types

#### Functions
- `submit_poetry_report()` - Submit a new report
- `get_admin_reports()` - Get reports for admin dashboard
- `update_report_status()` - Update report status
- `can_user_report()` - Check if user can report (spam prevention)
- `get_report_reasons_translations()` - Get reason translations

### 4. Row Level Security (RLS)

The following RLS policies are created:
- Users can create reports
- Users can view their own reports
- Admins can view, update, and delete all reports

### 5. API Endpoints

The following API endpoints are available:

#### Public Endpoints
- `POST /api/reports/submit` - Submit a new report
- `GET /api/reports/statistics` - Get report statistics

#### Admin Endpoints
- `GET /api/admin/reports` - Get all reports (admin only)
- `PUT /api/admin/reports` - Update report status (admin only)

### 6. TypeScript Types

Import the types from `@/types/reports`:

```typescript
import { 
  PoetryReport, 
  ReportStatistics, 
  AdminReportView,
  SubmitReportData,
  ReportCategory,
  ReportReason,
  ReportStatus
} from '@/types/reports';
```

### 7. React Hooks

Use the provided hooks for easy integration:

```typescript
import { useReports, useAdminReports } from '@/hooks/useReports';

// For regular users
const { submitReport, getReportStatistics, loading, error } = useReports();

// For admins
const { getReports, updateReportStatus, loading, error } = useAdminReports();
```

## Usage Examples

### Submitting a Report

```typescript
const { submitReport } = useReports();

const handleSubmitReport = async () => {
  const result = await submitReport({
    poetry_id: 'poetry-uuid',
    category: 'common',
    reason: 'contentError',
    description: 'This poem has grammatical errors'
  });

  if (result.success) {
    console.log('Report submitted:', result.reportId);
  } else {
    console.error('Error:', result.error);
  }
};
```

### Getting Report Statistics

```typescript
const { getReportStatistics } = useReports();

const fetchStats = async () => {
  const result = await getReportStatistics('poetry-uuid');
  if (result.success) {
    console.log('Statistics:', result.data);
  }
};
```

### Admin: Getting All Reports

```typescript
const { getReports } = useAdminReports();

const fetchReports = async () => {
  const result = await getReports({
    status: 'pending',
    limit: 20,
    offset: 0
  });
  
  if (result.success) {
    console.log('Reports:', result.data);
  }
};
```

### Admin: Updating Report Status

```typescript
const { updateReportStatus } = useAdminReports();

const handleUpdateStatus = async () => {
  const result = await updateReportStatus(
    'report-uuid',
    'resolved',
    'Issue has been fixed'
  );
  
  if (result.success) {
    console.log('Status updated');
  }
};
```

## Features

### Spam Prevention
- Users can only report the same poetry once every 24 hours
- Implemented via `can_user_report()` function

### Multi-language Support
- All report reasons have English and Sindhi translations
- Available via `get_report_reasons_translations()` function

### Admin Dashboard
- Complete admin interface for managing reports
- Filter by status, reason, and pagination
- Update report status with admin notes

### Statistics
- Real-time report statistics per poetry
- Breakdown by reason type
- Status tracking

### Security
- Row Level Security (RLS) enabled
- Role-based access control
- Admin-only functions protected

## Database Schema Details

### poetry_reports Table
- `id` - UUID primary key
- `poetry_id` - Foreign key to poetry table
- `reporter_id` - Foreign key to auth.users
- `category` - Report category (common/additional)
- `reason` - Specific reason for reporting
- `description` - Optional user description
- `status` - Current status of the report
- `admin_notes` - Admin notes (admin only)
- `resolved_by` - Admin who resolved it
- `resolved_at` - When it was resolved
- `created_at` - When report was created
- `updated_at` - Last updated timestamp

### Indexes
- Performance indexes on frequently queried columns
- Composite indexes for common query patterns

### Views
- `report_statistics` - Aggregated statistics
- `admin_reports_view` - Admin dashboard data
- `public_report_stats` - Public statistics (limited data)

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure RLS policies are properly set up
2. **Function Not Found**: Ensure all functions are created in the correct schema
3. **Token Issues**: Verify Supabase auth tokens are properly configured
4. **Role Issues**: Make sure admin users have the correct role in their metadata

### Debugging

1. Check Supabase logs for SQL errors
2. Verify environment variables are set correctly
3. Test functions directly in Supabase SQL editor
4. Check RLS policies are working as expected

## Support

For issues or questions:
1. Check the Supabase documentation
2. Review the SQL schema for any syntax errors
3. Verify all dependencies are installed
4. Check the API routes for proper error handling
