# Backend Setup Guide

## Overview

Your Baakh project now has a complete backend system with the following components:

### ✅ Completed
- **Backend API Server** (Node.js/Express)
- **Poets CRUD Endpoints** - Full CRUD operations for poets
- **Couplets CRUD Endpoints** - Full CRUD operations for couplets
- **Frontend Integration** - Next.js API routes now proxy to backend
- **Supabase Integration** - Database operations via Supabase client

### 🔄 Next Steps Required

## 1. Backend Server Setup

### Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5001`

### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 2. Frontend Configuration

### Environment Variables

Create a `.env.local` file in the `baakh-nextjs` directory:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# Supabase Configuration (if using direct Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 3. Database Schema

You'll need to create the following tables in your Supabase database:

### Poets Table
```sql
CREATE TABLE poets (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sindhi_name VARCHAR(255),
  english_name VARCHAR(255) NOT NULL,
  sindhi_laqab VARCHAR(255),
  english_laqab VARCHAR(255),
  sindhi_tagline TEXT,
  english_tagline TEXT,
  birth_date DATE,
  death_date DATE,
  birth_place VARCHAR(255),
  death_place VARCHAR(255),
  sindhi_details TEXT,
  english_details TEXT,
  period VARCHAR(100),
  tags TEXT[],
  file_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Couplets Table
```sql
CREATE TABLE poetry_couplets (
  id SERIAL PRIMARY KEY,
  couplet_text TEXT NOT NULL,
  couplet_slug VARCHAR(255),
  couplet_tags TEXT,
  lang VARCHAR(10) DEFAULT 'en',
  poet_id INTEGER REFERENCES poets(id),
  poetry_id INTEGER,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 4. API Endpoints

### Poets Endpoints
- `GET /api/poets` - List poets with pagination and filtering
- `GET /api/poets/:id` - Get single poet by ID
- `POST /api/poets` - Create new poet
- `PUT /api/poets/:id` - Update poet
- `DELETE /api/poets/:id` - Delete poet

### Couplets Endpoints
- `GET /api/couplets` - List couplets with pagination and filtering
- `GET /api/couplets/by-poet/:poetId` - Get couplets by specific poet
- `GET /api/couplets/:id` - Get single couplet by ID
- `POST /api/couplets` - Create new couplet
- `PUT /api/couplets/:id` - Update couplet
- `DELETE /api/couplets/:id` - Delete couplet

## 5. Testing the Integration

### Start Both Servers

1. **Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Server:**
   ```bash
   cd baakh-nextjs
   npm run dev
   ```

### Test API Endpoints

1. **Test Backend Health:**
   ```bash
   curl http://localhost:5001/health
   ```

2. **Test Poets API:**
   ```bash
   curl http://localhost:5001/api/poets
   ```

3. **Test Frontend Proxy:**
   ```bash
   curl http://localhost:3000/api/poets
   ```

## 6. Architecture

```
Frontend (Next.js) → API Routes → Backend (Express) → Supabase
     ↓                    ↓              ↓
  /api/poets    →    Proxy Request  →  /api/poets
  /api/couplets  →   Proxy Request  →  /api/couplets
```

## 7. Next Steps

1. **Set up Supabase database** with the required tables
2. **Configure environment variables** in both frontend and backend
3. **Test the API endpoints** to ensure they work correctly
4. **Implement authentication** (JWT-based auth system is ready)
5. **Add more endpoints** for categories, periods, and search functionality

## 8. Troubleshooting

### Common Issues

1. **CORS Errors:** Make sure `FRONTEND_URL` is set correctly in backend `.env`
2. **Database Connection:** Verify Supabase credentials are correct
3. **Port Conflicts:** Ensure ports 3000 and 5001 are available
4. **Environment Variables:** Check that all required variables are set

### Debug Mode

Both servers have extensive logging. Check the console output for detailed error messages and API request/response logs.

## 9. Development Workflow

1. Make changes to backend endpoints in `backend/src/routes/`
2. Frontend automatically proxies requests to backend
3. Test changes using the frontend interface or direct API calls
4. Use browser dev tools to monitor network requests

The backend is now fully integrated with your frontend and ready for development!
