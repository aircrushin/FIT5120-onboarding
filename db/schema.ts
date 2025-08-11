import { sql } from "drizzle-orm";
import { pgTable, text, varchar, char, date, integer, check, primaryKey, foreignKey } from 'drizzle-orm/pg-core';

/* Example for setting up table
export const usersTable = pgTable('users_table', {
   id: serial('id').primaryKey(),
   name: text('name').notNull(),
   age: integer('age').notNull(),
   email: text('email').notNull().unique(),
}); 

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
*/

// TABLE CREATION
// Holder table - Holders are companies that hold the notification for the products
export const holderTable = pgTable(
    'holder', 
    {
        holder_id: integer('holder_id').primaryKey(),
        holder_name: text('holder_name').notNull(),
    }
);

// Product table - Master cosmetic product table
export const productTable = pgTable(
    'product',
    {
        prod_notif_no: varchar('prod_notif_no', {length: 15}).primaryKey(),
        prod_name: text('prod_name').notNull(),
        prod_brand: text('prod_brand').notNull(),
        prod_category: text('prod_category').notNull(),
        prod_status_type: char('prod_status_type', {length: 1}).notNull(), // Approval status (A - Approved, C - Cancelled)
        prod_status_date: date('prod_status_date').notNull(),
        holder_id: integer('holder_id').notNull(),
    },
    (table) => [
        // Add foreign key constraints
        foreignKey({
            columns: [table.holder_id],
            foreignColumns: [holderTable.holder_id]
        }),
        check("chk_prod_status_type", sql`${table.prod_status_type} in ('A', 'C', 'U')`),
    ]
);

// Ingredient table - Master ingredient table
export const ingredientTable = pgTable(
    'ingredient',
    {
        ing_id: integer('ing_id').primaryKey(),
        ing_name: text('ing_name').notNull(),
        ing_risk_summary: text('ing_risk_summary').notNull(),
        ing_risk_type: char('ing_risk_type', {length: 1}).notNull(), // Risk type (B - Banned, H - High, L - Low)
    },
    (table) => [
        check("chk_ing_risk_type", sql`${table.ing_risk_type} in ('B', 'H', 'L', 'N')`),
    ]
);

// Prod_Ingredient table - associative table for Product-Ingredients
export const prodIngredientTable = pgTable(
    'prod_ingredient',
    {
        prod_notif_no: varchar('prod_notif_no', {length: 15}).notNull(),
        ing_id: integer('ing_id').notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.prod_notif_no, table.ing_id]}),
        // Add foreign key constraints
        foreignKey({
            columns: [table.prod_notif_no],
            foreignColumns: [productTable.prod_notif_no]
        }),
        foreignKey({
            columns: [table.ing_id],
            foreignColumns: [ingredientTable.ing_id]
        }),
    ]
);

export type InsertHolder = typeof holderTable.$inferInsert;
export type SelectHolder = typeof holderTable.$inferSelect;

export type InsertProduct = typeof productTable.$inferInsert;
export type SelectProduct = typeof productTable.$inferSelect;

export type InsertIngredient = typeof ingredientTable.$inferInsert;
export type SelectIngredient = typeof ingredientTable.$inferSelect;

export type InsertProdIngredient = typeof prodIngredientTable.$inferInsert;
export type SelectProdIngredient = typeof prodIngredientTable.$inferSelect;