# Server Actions Usage Guide

This directory contains Next.js Server Actions for product search and discovery.

## What are Server Actions?

Server Actions let you run server-side code directly from client components without creating API routes. They enable type-safe data fetching and mutations with simple function calls.

## Available Actions

### searchProductsAction(query: string)
Search products by name, brand, category, or notification number.

```ts
import { searchProductsAction } from '../actions/product-actions';

const results = await searchProductsAction('Vitamin C');
```

### getProductByNotificationAction(notificationNumber: string)
Get a single product by notification number.

```ts
import { getProductByNotificationAction } from '../actions/product-actions';

const product = await getProductByNotificationAction('NOT110307162K');
```

### getAllProductsAction()
Retrieve all products with their ingredients.

```ts
import { getAllProductsAction } from '../actions/product-actions';

const products = await getAllProductsAction();
```

### getSimilarApprovedProductsAction(referenceNotifNo: string, limit?: number)
Find similar approved products based on the reference product's category.

```ts
import { getSimilarApprovedProductsAction } from '../actions/product-actions';

const similar = await getSimilarApprovedProductsAction('NOT110307162K', 6);
```

### getRandomProductsAction(limit?: number)
Get random products for featured sections.

```ts
import { getRandomProductsAction } from '../actions/product-actions';

const featured = await getRandomProductsAction(6);
```

### getFilterOptionsAction()
Fetch filter option lists for UI controls.

Returns ingredient list, unique categories, and unique brands.

```ts
import { getFilterOptionsAction } from '../actions/product-actions';

const options = await getFilterOptionsAction();
// options.ingredients: [{ ing_id, ing_name, ing_risk_type }]
// options.categories: string[]
// options.brands: string[]
```

### getFilteredProductsAction(filters: ProductFilters, searchQuery?: string)
Search products with filter criteria. If `searchQuery` is omitted/empty, filters alone are applied.

```ts
import { getFilteredProductsAction } from '../actions/product-actions';

const results = await getFilteredProductsAction({
  safetyLevels: ['safe', 'risky'],
  ingredientIds: [101, 202],
  approvalStatuses: ['A'],
  categories: ['Face Cream'],
  brands: ['Brand A', 'Brand B'],
}, 'retinol');
```

## Types

```ts
// Returned by search actions
export interface ProductSearchResult {
  prod_notif_no: string;
  prod_name: string;
  prod_brand: string;
  prod_category: string;
  prod_status_type: 'A' | 'C';
  prod_status_date: string;
  holder_name: string;
  ingredients: Array<{
    name: string;
    risk_type: 'L' | 'H' | 'B'; // Low | High | Banned
    risk_summary: string;
  }>;
}

export interface FilterOptions {
  ingredients: Array<{
    ing_id: number;
    ing_name: string;
    ing_risk_type: 'B' | 'H' | 'L' | 'N';
  }>;
  categories: string[];
  brands: string[];
}

// Input to getFilteredProductsAction
export interface ProductFilters {
  // Safety Level:
  // - 'safe': Approved products without banned/high-risk ingredients
  // - 'risky': Approved products with any banned/high-risk ingredients
  // - 'unsafe': Cancelled products
  safetyLevels: ('safe' | 'unsafe' | 'risky')[];

  // Ingredient selection by IDs (matches ANY of the selected ingredient IDs)
  ingredientIds: number[];

  // Approval status ('A' | 'C')
  approvalStatuses: ('A' | 'C')[];

  // Category and brand filters (match ANY selected within each group)
  categories: string[];
  brands: string[];
}
```

## Filter Semantics

- Group-level logic: products must satisfy ALL selected groups that are non-empty (AND across groups: Safety AND Approval AND Ingredients AND Categories AND Brands).
- Within a group:
  - approvalStatuses: IN semantics; selecting both 'A' and 'C' is equivalent to no approval filter.
  - categories: IN semantics across selected categories.
  - brands: IN semantics across selected brands.
  - ingredientIds: matches products that contain ANY of the selected ingredients.
  - safetyLevels:
    - 'unsafe': `prod_status_type === 'C'`
    - 'risky': approved ('A') and has any ingredient with risk_type 'B' or 'H'
    - 'safe': approved ('A') and has no ingredients with risk_type 'B' or 'H'

## Usage Patterns

### Direct calls with React transitions
```tsx
const [isPending, startTransition] = useTransition();

function applyFilters(filters: ProductFilters, searchQuery: string) {
  startTransition(async () => {
    const results = await getFilteredProductsAction(filters, searchQuery);
    setResults(results);
  });
}
```

### Debounced search with filters
```tsx
useEffect(() => {
  const id = setTimeout(() => {
    getFilteredProductsAction(activeFilters, searchQuery).then(setResults);
  }, 300);
  return () => clearTimeout(id);
}, [activeFilters, searchQuery]);
```

## Error Handling

All actions perform safe querying and will throw on fatal errors. Catch errors in client code and present user-friendly messages.

## Notes

- Actions are implemented with Drizzle ORM and typed Postgres schema.
- Ingredient risk types: 'B' (Banned), 'H' (High), 'L' (Low), 'N' (Normal/None).
- When there are no filters and no query, `getFilteredProductsAction` returns an empty list (call `searchProductsAction` or provide a filter to get results). 