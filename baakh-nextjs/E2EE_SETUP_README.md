# E2EE User Authentication Setup for Baakh Poetry

This document explains how to set up end-to-end encrypted user accounts for likes and bookmarks functionality.

## Overview

The system provides:
- **End-to-end encryption** of user data (email, name, likes, bookmarks)
- **Client-side encryption** using Web Crypto API
- **Supabase integration** with Row Level Security (RLS)
- **JWT-based authentication** for secure API access
- **Zero-knowledge** - server never sees plaintext user data

## Prerequisites

1. **Supabase Project** with service role key
2. **Next.js 14+** with App Router
3. **Environment Variables** configured

## Environment Variables

Add these to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=nNtxYnaq3DUjqTONa53jZxm6WvljfQ4biIMl2HI9q8zZ0D0KF4U9uyhfxpeIfs4Qz2fZ7281i3noFukUbXwqig==

# JWT Secret (get this from Supabase Dashboard → Settings → API → JWT Secret)
```

## Database Setup

1. **Run the SQL schema** in `supabase/e2ee_user_schema.sql`
2. **Enable RLS** on the tables
3. **Verify policies** are in place

## Installation Steps

### 1. Install Dependencies

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 2. Run Database Schema

Execute the SQL in `supabase/e2ee_user_schema.sql` in your Supabase SQL editor.

### 3. Verify File Structure

```
src/
├── lib/
│   └── crypto-utils.ts          # Crypto utilities
├── hooks/
│   └── useE2EEAuth.ts           # Authentication hook
├── components/ui/
│   └── AuthModal.tsx            # Login/signup modal
└── app/api/auth/
    ├── signup/route.ts          # User registration
    ├── login/route.ts           # User authentication
    └── user/
        ├── like/route.ts        # Like management
        └── bookmark/route.ts    # Bookmark management
```

## Usage

### 1. Authentication Hook

```tsx
import { useE2EEAuth } from '@/hooks/useE2EEAuth';

function MyComponent() {
  const { 
    isAuthenticated, 
    user, 
    login, 
    signup, 
    logout,
    createLike,
    createBookmark 
  } = useE2EEAuth();

  // Use authentication functions
  const handleLogin = async () => {
    try {
      await login('username', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLike = async () => {
    try {
      await createLike('poem-123', 'poem', { note: 'Beautiful poetry!' });
    } catch (error) {
      console.error('Like failed:', error);
    }
  };
}
```

### 2. Authentication Modal

```tsx
import { AuthModal } from '@/components/ui/AuthModal';

function Header() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <button onClick={() => setShowAuth(true)}>
        Sign In
      </button>
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </>
  );
}
```

### 3. Protected Actions

```tsx
function LikeButton({ poemId }: { poemId: string }) {
  const { isAuthenticated, createLike } = useE2EEAuth();
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Show auth modal
      return;
    }

    try {
      await createLike(poemId, 'poem');
      setIsLiked(true);
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={isLiked ? 'text-red-500' : 'text-gray-400'}
    >
      <Heart className={isLiked ? 'fill-current' : ''} />
    </button>
  );
}
```

## Security Features

### 1. Client-Side Encryption
- **AES-GCM** for data encryption
- **PBKDF2** for key derivation (upgradeable to Argon2)
- **Unique nonces** for each encryption
- **Additional authenticated data** (AAD) for integrity

### 2. Zero-Knowledge Architecture
- Server never sees plaintext user data
- All encryption/decryption happens in browser
- Master keys stored encrypted on server
- Password verification without storing passwords

### 3. Row Level Security
- Users can only access their own data
- JWT tokens with user-specific claims
- Supabase RLS policies enforce access control

## Data Flow

### Signup
1. User enters credentials
2. Client generates salt and derives key
3. Client creates master key and encrypts profile
4. Client encrypts master key with derived key
5. Server stores encrypted data
6. Client keeps master key in memory

### Login
1. User enters credentials
2. Server returns encrypted user data
3. Client derives key from password
4. Client decrypts master key
5. Client decrypts profile
6. Server returns JWT token

### Creating Like/Bookmark
1. Client encrypts metadata with master key
2. Client sends encrypted data to API
3. Server stores encrypted data under RLS
4. Only user can decrypt their own data

## Upgrades & Improvements

### 1. Better Password Hashing
Replace PBKDF2 with Argon2id for better security:

```bash
npm install argon2-browser
```

### 2. OPAQUE Protocol
Implement proper password-authenticated key exchange:

```bash
npm install @opaquejs/opaque
```

### 3. Recovery Options
- **Recovery codes** for password reset
- **Passkeys** for WebAuthn support
- **Backup encryption** keys

## Troubleshooting

### Common Issues

1. **JWT Secret Mismatch**
   - Ensure `SUPABASE_JWT_SECRET` matches Supabase dashboard
   - Check JWT algorithm is HS256

2. **Crypto API Errors**
   - Ensure HTTPS in production (Web Crypto requires secure context)
   - Check browser compatibility

3. **RLS Policy Issues**
   - Verify policies are enabled
   - Check JWT claims match policy conditions

### Debug Mode

Enable debug logging in development:

```tsx
// In crypto-utils.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Encryption details:', { cipher, nonce, aad });
}
```

## Production Considerations

1. **Rate Limiting** on auth endpoints
2. **Input Validation** and sanitization
3. **Error Handling** without information leakage
4. **Session Management** and token refresh
5. **Audit Logging** for security events

## Support

For issues or questions:
1. Check Supabase logs for database errors
2. Verify environment variables are set correctly
3. Test with minimal data first
4. Check browser console for crypto errors

---

**Note**: This is a simplified implementation. For production use, consider implementing proper SRP/OPAQUE protocols and additional security measures.
