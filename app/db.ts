import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import postgres from 'postgres';

// Database connection
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

// Example table schema (you can modify this as needed)
export const exampleTable = pgTable('example', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }),
});

export { db, client };
