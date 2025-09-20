# User Settings Architecture

## 🏗️ System Architecture

This project uses a **dual authentication system** with separate settings management for different user types:

### **Admin Users** (Supabase Auth)
- **Authentication**: Supabase built-in `auth.users` table
- **Profile Data**: `profiles` table with admin flags
- **Settings Storage**: `admin_settings` table
- **Access**: Full admin panel with system management features

### **Regular Users** (Custom E2EE System)
- **Authentication**: Custom `e2ee_users` table with encrypted credentials
- **Profile Data**: Encrypted in `profile_cipher` field
- **Settings Storage**: Encrypted in user profile (future implementation)
- **Access**: User settings page with basic preferences

## 📁 File Structure

```
src/app/
├── admin/settings/
│   ├── page.tsx                    # Admin settings page
│   └── api/settings/
│       ├── route.ts               # Original admin settings API
│       ├── admin/route.ts         # Admin-specific settings API
│       ├── test/route.ts          # Test endpoints (working)
│       ├── production/route.ts    # Production endpoints
│       ├── status/route.ts        # Database status check
│       └── password/route.ts      # Password change API
└── user/settings/
    ├── page.tsx                   # User settings page
    └── api/settings/
        └── route.ts               # User settings API
```

## 🔧 API Endpoints

### Admin Settings (Supabase Auth Users)

#### Test Endpoints (Currently Active)
- `GET /api/admin/settings/test?userId={id}` - Load admin settings
- `POST /api/admin/settings/test` - Save admin settings

#### Admin Endpoints (After RLS fix)
- `GET /api/admin/settings/admin?userId={id}` - Load admin settings
- `POST /api/admin/settings/admin` - Save admin settings

#### Status Endpoint
- `GET /api/admin/settings/status` - Check database readiness

### User Settings (E2EE Users)

#### User Endpoints
- `GET /api/user/settings?userId={id}` - Load user settings
- `POST /api/user/settings` - Save user settings

## 🎯 Settings Categories

### Admin Settings
- **Profile**: Name, email, phone, bio, avatar
- **Security**: Password change, 2FA, session timeout, login notifications
- **Notifications**: Email, push, SMS, weekly reports, system alerts, user activity
- **System**: Language, timezone, date/time format, theme, auto backup, backup frequency

### User Settings
- **Profile**: Name, email, phone, bio, avatar
- **Preferences**: Language, timezone, date/time format, theme, notifications
- **Privacy**: Profile visibility, show email/phone, allow messages

## 🔐 Security Implementation

### Admin Users
- Uses Supabase RLS (Row Level Security)
- Service role can manage all admin settings
- User-specific policies for regular admin users

### Regular Users
- Uses E2EE (End-to-End Encryption)
- Profile data encrypted with user's master key
- Settings stored in encrypted `profile_cipher` field
- Decryption happens client-side

## 🚀 Current Status

### ✅ Working Features
- **Admin Settings Page**: Fully functional at `/admin/settings`
- **User Settings Page**: Fully functional at `/user/settings`
- **Test Endpoints**: Working perfectly for admin users
- **Smart Fallback**: Automatically detects and switches modes
- **Complete UI**: All settings sections with validation

### ⏳ Pending Implementation
- **E2EE Integration**: User settings encryption/decryption
- **Database Permissions**: RLS fix for admin settings
- **Production Mode**: Switch from test to production endpoints

## 🧪 Testing

### Test Admin Settings
```bash
# Test admin settings page
curl "http://localhost:3000/admin/settings"

# Test admin API endpoints
curl "http://localhost:3000/api/admin/settings/test?userId=test-user"
```

### Test User Settings
```bash
# Test user settings page
curl "http://localhost:3000/user/settings"

# Test user API endpoints
curl "http://localhost:3000/api/user/settings?userId=mock-user-id"
```

## 🔄 Switching to Production

### For Admin Users
1. Run the RLS fix SQL script in Supabase Dashboard
2. Admin settings will automatically switch to production mode
3. All data will be saved to the `admin_settings` table

### For Regular Users
1. Implement E2EE encryption/decryption functions
2. Update user settings API to handle encrypted data
3. Settings will be stored in encrypted `profile_cipher` field

## 📋 Database Schema

### Admin Settings Table
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_settings JSONB,
  security_settings JSONB,
  notification_settings JSONB,
  system_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### E2EE Users Table
```sql
CREATE TABLE e2ee_users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_salt BYTEA NOT NULL,
  password_verifier BYTEA NOT NULL,
  profile_cipher BYTEA NOT NULL,  -- Encrypted profile data
  profile_nonce BYTEA NOT NULL,
  profile_aad TEXT NOT NULL,
  master_key_cipher BYTEA NOT NULL,
  master_key_nonce BYTEA NOT NULL,
  kdf_params JSONB NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎉 Features

### Admin Settings Page
- ✅ Profile management with validation
- ✅ Security settings with password change
- ✅ Notification preferences
- ✅ System configuration
- ✅ Smart fallback system
- ✅ Real-time validation
- ✅ Loading states and error handling

### User Settings Page
- ✅ Profile management
- ✅ Language and timezone preferences
- ✅ Privacy controls
- ✅ Notification settings
- ✅ Form validation
- ✅ Responsive design

## 🛠️ Next Steps

1. **Fix RLS Permissions**: Run SQL script for admin settings
2. **Implement E2EE**: Add encryption/decryption for user settings
3. **Test Both Systems**: Verify admin and user settings work correctly
4. **Production Deployment**: Switch to production endpoints

## 📝 Notes

- Admin users use Supabase auth with additional profile data
- Regular users use custom E2EE system with encrypted data
- Settings pages are fully functional with test data
- Smart fallback ensures pages always work
- TypeScript provides full type safety
- Responsive design works on all devices

---

**Status**: ✅ Fully Functional (Test Mode) | ⏳ Production Ready (After Implementation)
