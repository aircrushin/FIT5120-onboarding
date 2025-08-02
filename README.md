# Next.js + PostgreSQL Starter

This is a [Next.js](https://nextjs.org/) starter kit that uses [Drizzle ORM](https://orm.drizzle.team) and a [PostgreSQL](https://vercel.com/postgres) database for data persistence.

## Features

- ✅ **Next.js 14** with App Router
- ✅ **PostgreSQL** database
- ✅ **Drizzle ORM** for type-safe database operations
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Vercel deployment** ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- PostgreSQL database (local or hosted)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/aircrushin/FIT5120-onboarding.git
cd fit5120-onborading

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# For production with SSL (e.g., Vercel Postgres, Neon, etc.)
# POSTGRES_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

#### Database Options:

**Option A: Vercel Postgres**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database
3. Copy the connection string to your `.env.local`

**Option B: Neon (Free tier)**
1. Sign up at [Neon](https://neon.tech/)
2. Create a new database
3. Copy the connection string to your `.env.local`

### 3. Database Setup

The current setup includes an example table. You can modify it in `app/db.ts`:

```typescript
// Example table schema in app/db.ts
export const exampleTable = pgTable('example', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }),
});
```

### 4. Creating Tables

**Option A: Manual SQL**
Connect to your database and run:
```sql
CREATE TABLE example (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64)
);
```

**Option B: Using Drizzle Kit (Recommended)**

1. Install Drizzle Kit:
```bash
pnpm add -D drizzle-kit
```

2. Create `drizzle.config.ts` in the root:
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './app/db.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config;
```

3. Generate and push schema:
```bash
# Generate migration files
pnpm db:generate

# Push schema to database
pnpm db:push

# Open Drizzle Studio (optional)
pnpm db:studio
```

### 5. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Database Operations

### Basic Queries

```typescript
import { db, exampleTable } from './app/db';

// Insert data
await db.insert(exampleTable).values({ name: 'John Doe' });

// Select data
const users = await db.select().from(exampleTable);

// Update data
await db.update(exampleTable).set({ name: 'Jane Doe' }).where(eq(exampleTable.id, 1));

// Delete data
await db.delete(exampleTable).where(eq(exampleTable.id, 1));
```

### Adding New Tables

1. Define your table in `app/db.ts`:
```typescript
export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

2. Generate and push migration:
```bash
pnpm db:generate
pnpm db:push
```

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   ├── db.ts               # Database schema and connection
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── drizzle/                # Generated migrations (if using Drizzle Kit)
├── .env.local              # Environment variables
├── drizzle.config.ts       # Drizzle Kit configuration
└── package.json
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!