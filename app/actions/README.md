# Server Actions Usage Guide

This directory contains Next.js Server Actions for product search functionality.

## What are Server Actions?

Server Actions are a feature in Next.js that allows you to run server-side code directly from client components without creating API routes. They provide a seamless way to handle form submissions and data mutations.

## Available Actions

### `searchProductsAction(query: string)`
Search for products by name, brand, or notification number.

**Usage in components:**
```tsx
import { searchProductsAction } from '../actions/product-actions';

// In a form submission
const handleSubmit = async (formData: FormData) => {
  const query = formData.get('query') as string;
  const results = await searchProductsAction(query);
  // Handle results...
};

// With useActionState hook
const [state, formAction, isPending] = useActionState(searchFormAction, {
  results: []
});
```

### `getProductByNotificationAction(notificationNumber: string)`
Get a specific product by its notification number.

### `getAllProductsAction()`
Retrieve all products with ingredients.

### `getSimilarApprovedProductsAction(referenceNotifNo: string, limit?: number)`
Find similar approved products based on category, brand, or other criteria.

### `getRandomProductsAction(limit?: number)`
Get random featured products for display.

## Benefits of Server Actions

### ✅ Advantages:
1. **Type Safety**: Full TypeScript support with shared types
2. **Direct Integration**: No need for separate API routes
3. **Automatic Revalidation**: Built-in cache invalidation
4. **Progressive Enhancement**: Works without JavaScript
5. **Optimistic Updates**: Easy to implement with React transitions
6. **Error Handling**: Centralized error handling in actions

### ❌ Considerations:
1. **Bundle Size**: May increase client bundle if not used properly
2. **Limited Caching**: Less flexible than REST API caching
3. **Platform Lock-in**: Specific to Next.js ecosystem
4. **Debugging**: Harder to test in isolation

## Usage Patterns

### 1. Form Submissions (Recommended)
```tsx
// SearchForm.tsx
export default function SearchForm() {
  const [state, formAction, isPending] = useActionState(searchFormAction, {
    results: []
  });

  return (
    <form action={formAction}>
      <input name="query" type="text" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
```

### 2. Direct Function Calls (Current Implementation)
```tsx
// ProductSearchPage.tsx
import { searchProductsAction } from '../actions/product-actions';

const handleSearch = () => {
  startTransition(async () => {
    try {
      const results = await searchProductsAction(query);
      setResults(results);
    } catch (error) {
      setError('Search failed');
    }
  });
};
```

### 3. With React Transitions
```tsx
const [isPending, startTransition] = useTransition();

const handleAction = () => {
  startTransition(async () => {
    await searchProductsAction(query);
  });
};
```

## Error Handling

All actions include proper error handling:
- Input validation
- Database error handling
- User-friendly error messages
- Fallback to safe defaults

## Migration from Traditional API

### Before (API Route):
```tsx
// pages/api/search.ts
export default function handler(req, res) {
  // API logic
}

// In component
const response = await fetch('/api/search?q=' + query);
const data = await response.json();
```

### After (Server Action):
```tsx
// app/actions/product-actions.ts
export async function searchProductsAction(query: string) {
  // Same logic as API route
}

// In component
const results = await searchProductsAction(query);
```

## Best Practices

1. **Use with Forms**: Server Actions work best with form submissions
2. **Handle Loading States**: Use `useTransition` or `useActionState`
3. **Error Boundaries**: Implement proper error handling
4. **Input Validation**: Always validate inputs in actions
5. **Type Safety**: Use TypeScript interfaces for return types
6. **Progressive Enhancement**: Ensure forms work without JavaScript

## Example Component

See `app/components/search-form.tsx` for a complete example of using Server Actions with forms and proper loading/error states. 