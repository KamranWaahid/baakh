# Couplets by Poet API

This document describes how to fetch couplets from the database according to poet ID using the new API endpoints and utilities.

## API Endpoint

### GET `/api/couplets/by-poet/[poetId]`

Fetches couplets for a specific poet with pagination, filtering, and sorting options.

#### Parameters

- **poetId** (path parameter): UUID of the poet
- **page** (query): Page number (default: 1)
- **limit** (query): Number of couplets per page (default: 20)
- **lang** (query): Language filter ('sd' for Sindhi, 'en' for English)
- **sortBy** (query): Sort field ('created_at', 'couplet_slug', 'lang')
- **sortOrder** (query): Sort direction ('asc' or 'desc', default: 'desc')

#### Example Request

```bash
GET /api/couplets/by-poet/123e4567-e89b-12d3-a456-426614174000?page=1&limit=10&lang=sd&sortBy=created_at&sortOrder=desc
```

#### Response Structure

```json
{
  "couplets": [
    {
      "id": "uuid",
      "couplet_text": "Line 1\nLine 2",
      "couplet_slug": "couplet-slug",
      "lang": "sd",
      "lines": ["Line 1", "Line 2"],
      "tags": ["tag1", "tag2"],
      "poet": {
        "name": "Poet Name",
        "slug": "poet-slug",
        "photo": "photo-url"
      },
      "poetry": null,
      "created_at": "2024-01-01T00:00:00Z",
      "likes": 150,
      "views": 1000
    }
  ],
  "poet": {
    "id": "uuid",
    "slug": "poet-slug",
    "name": "Poet Name",
    "sindhi_name": "شاعر کا نام",
    "english_name": "Poet Name",
    "photo": "photo-url"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

## Frontend Utilities

### API Functions

#### `fetchCoupletsByPoet(params)`

Fetches couplets by poet ID with pagination.

```typescript
import { fetchCoupletsByPoet } from '@/lib/api/couplets';

const response = await fetchCoupletsByPoet({
  poetId: 'uuid',
  page: 1,
  limit: 20,
  lang: 'sd',
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

#### `fetchAllCoupletsByPoet(params)`

Fetches all couplets by poet ID (handles pagination automatically).

```typescript
import { fetchAllCoupletsByPoet } from '@/lib/api/couplets';

const allCouplets = await fetchAllCoupletsByPoet({
  poetId: 'uuid',
  lang: 'sd',
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

### React Hook

#### `useCoupletsByPoet(poetId, options)`

A React hook that provides state management for fetching couplets by poet ID.

```typescript
import { useCoupletsByPoet } from '@/hooks/useCoupletsByPoet';

function MyComponent() {
  const {
    couplets,
    poet,
    pagination,
    loading,
    error,
    fetchCouplets,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage
  } = useCoupletsByPoet('poet-uuid', {
    autoFetch: true,
    initialParams: {
      lang: 'sd',
      limit: 10
    }
  });

  // Use the hook data and functions
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {couplets.map(couplet => (
        <div key={couplet.id}>
          {couplet.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ))}
      
      {hasNextPage && <button onClick={nextPage}>Next</button>}
      {hasPreviousPage && <button onClick={previousPage}>Previous</button>}
    </div>
  );
}
```

## Database Schema

The API works with the following database tables:

### `poetry_couplets` Table

```sql
CREATE TABLE poetry_couplets (
  id UUID PRIMARY KEY,
  poetry_id UUID REFERENCES poetry_main(id),
  poet_id UUID REFERENCES poets(id),
  couplet_slug TEXT NOT NULL,
  couplet_text TEXT NOT NULL,
  couplet_tags TEXT[],
  lang TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### `poets` Table

```sql
CREATE TABLE poets (
  id UUID PRIMARY KEY,
  poet_slug TEXT UNIQUE NOT NULL,
  sindhi_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  sindhi_laqab TEXT,
  english_laqab TEXT,
  sindhi_takhalus TEXT,
  english_takhalus TEXT,
  file_url TEXT,
  -- other fields...
);
```

## Usage Examples

### Basic Usage

```typescript
// Simple fetch
const couplets = await fetchCoupletsByPoet({
  poetId: 'uuid',
  lang: 'sd'
});

console.log(`Found ${couplets.couplets.length} couplets`);
```

### With Pagination

```typescript
// Fetch first page
const page1 = await fetchCoupletsByPoet({
  poetId: 'uuid',
  page: 1,
  limit: 10
});

// Fetch next page
const page2 = await fetchCoupletsByPoet({
  poetId: 'uuid',
  page: 2,
  limit: 10
});
```

### In React Component

```typescript
function PoetCouplets({ poetId }: { poetId: string }) {
  const { couplets, loading, error, pagination } = useCoupletsByPoet(poetId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Couplets ({pagination?.total || 0})</h2>
      {couplets.map(couplet => (
        <div key={couplet.id}>
          <p>{couplet.lines.join('\n')}</p>
          <small>Language: {couplet.lang}</small>
        </div>
      ))}
    </div>
  );
}
```

### Error Handling

```typescript
try {
  const response = await fetchCoupletsByPoet({ poetId: 'invalid-uuid' });
} catch (error) {
  if (error.message === 'Poet not found') {
    console.log('Poet does not exist');
  } else {
    console.error('API error:', error.message);
  }
}
```

## Features

- **Pagination**: Built-in pagination support
- **Language Filtering**: Filter by Sindhi ('sd') or English ('en')
- **Sorting**: Sort by creation date, slug, or language
- **Poet Information**: Returns poet details along with couplets
- **Tag Support**: Handles both JSON array and comma-separated tag formats
- **Error Handling**: Comprehensive error handling and user feedback
- **TypeScript Support**: Full TypeScript interfaces and types
- **React Integration**: Custom hook for easy React integration

## Performance Considerations

- Use pagination to limit the number of couplets fetched at once
- Consider caching poet information if fetching multiple pages
- Use language filters to reduce data transfer
- The API automatically handles database connection pooling

## Security

- Uses admin Supabase client for database access
- Validates poet ID before querying
- Sanitizes input parameters
- Returns appropriate HTTP status codes
