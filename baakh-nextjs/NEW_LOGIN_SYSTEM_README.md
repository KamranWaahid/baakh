# New E2EE Login System

## Overview

This document describes the new, improved E2EE (End-to-End Encryption) login system that replaces the problematic old login function. The new system provides better error handling, fallback mechanisms, and follows the same pattern as the signup system.

## Problems with the Old System

The old login system had several issues:

1. **Base64 Decoding Errors**: Failed to handle various data formats from the database
2. **AES Key Import Failures**: Incorrect key length handling (66 bytes vs expected 32 bytes)
3. **Complex Master Key Decryption**: Overly complex flow that was prone to failures
4. **Poor Error Handling**: Limited fallback mechanisms when decryption failed

## New System Features

### 1. Improved Password Verification
- Uses password verifier with proper nonce handling
- Fallback to direct profile decryption if verifier fails
- Better error messages and logging

### 2. Robust Master Key Handling
- Proper key length validation and adjustment
- Fallback mechanisms when master key decryption fails
- Better error handling for edge cases

### 3. Enhanced Base64 Handling
- Improved `fromBase64` function with hex string support
- Better error handling for malformed data
- Fallback mechanisms for different data formats

### 4. Consistent with Signup System
- Follows the same encryption patterns
- Uses the same data structures
- Maintains compatibility with existing data

## Changes Made

### 1. Updated `useE2EEAuth.ts` Hook
- **New Login Function**: Completely rewritten with better error handling
- **Fallback Mechanisms**: Multiple ways to authenticate users
- **Better Logging**: Comprehensive logging for debugging

### 2. Updated Login API (`/api/auth/login/route.ts`)
- **Password Verifier Nonce**: Added support for password verifier nonce
- **Better Data Conversion**: Improved handling of database data formats

### 3. Updated Signup API (`/api/auth/signup/route.ts`)
- **Password Verifier Nonce**: Now stores the nonce for password verification
- **Consistent Data Structure**: Matches the new login system requirements

### 4. Database Schema Updates
- **New Column**: Added `password_verifier_nonce` to `e2ee_users` table
- **Migration Script**: `add_password_verifier_nonce.sql` for existing databases

### 5. Improved Crypto Utils
- **Enhanced fromBase64**: Better handling of edge cases
- **Hex String Support**: Automatic detection and conversion of hex strings

## Database Migration

### For New Installations
The updated schema in `supabase/e2ee_user_schema.sql` already includes the new column.

### For Existing Installations
Run the migration script:

```sql
-- Run this in your Supabase SQL editor
\i add_password_verifier_nonce.sql
```

Or manually add the column:

```sql
ALTER TABLE public.e2ee_users 
ADD COLUMN password_verifier_nonce bytea;

-- For existing records, copy profile_nonce as temporary value
UPDATE public.e2ee_users 
SET password_verifier_nonce = profile_nonce 
WHERE password_verifier_nonce IS NULL;

-- Make the column NOT NULL
ALTER TABLE public.e2ee_users 
ALTER COLUMN password_verifier_nonce SET NOT NULL;
```

## Testing

### Run the Test Script
```bash
node test-new-login.js
```

This will test:
- Base64 encoding/decoding
- Key derivation
- Encryption/decryption
- Master key handling
- Edge case handling

### Manual Testing
1. **Signup**: Create a new account using the signup form
2. **Login**: Test login with the new account
3. **Error Handling**: Test with invalid passwords to verify error messages

## How It Works

### 1. Login Flow
```
User enters credentials → API call → Password verification → Master key decryption → Profile decryption → Session creation
```

### 2. Fallback Mechanisms
- **Primary**: Password verifier + master key decryption
- **Fallback 1**: Direct profile decryption with derived key
- **Fallback 2**: Graceful error handling with user-friendly messages

### 3. Data Flow
```
Database (bytea) → Base64 conversion → Client-side decryption → Session storage
```

## Benefits

1. **Reliability**: Multiple fallback mechanisms ensure users can log in
2. **Security**: Maintains E2EE principles while improving usability
3. **Debugging**: Comprehensive logging for troubleshooting
4. **Maintainability**: Cleaner, more organized code structure
5. **Compatibility**: Works with existing data and new signups

## Troubleshooting

### Common Issues

1. **"Invalid key length" errors**
   - The system now automatically adjusts key lengths
   - Check console logs for warnings about length mismatches

2. **Base64 decoding failures**
   - The system now handles hex strings automatically
   - Check if data is being stored correctly in the database

3. **Password verification failures**
   - The system falls back to direct profile decryption
   - Check if password_verifier_nonce column exists in database

### Debug Steps

1. Check browser console for detailed error logs
2. Verify database schema has all required columns
3. Run the test script to verify crypto functions
4. Check API responses for data format issues

## Future Improvements

1. **SRP Protocol**: Implement proper Secure Remote Password protocol
2. **OPAQUE**: Consider OPAQUE for password-based key exchange
3. **Rate Limiting**: Add login attempt rate limiting
4. **Session Management**: Improve session handling and expiration

## Support

If you encounter issues:

1. Check the console logs for detailed error information
2. Verify the database schema is up to date
3. Run the test script to verify crypto functions
4. Check that all required columns exist in the database

The new system is designed to be robust and provide clear error messages to help with troubleshooting.
