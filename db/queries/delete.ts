import { db } from '../index'; // Adjust import path to your database instance
import { sql } from 'drizzle-orm';
import { 
  holderTable, 
  productTable, 
  ingredientTable, 
  prodIngredientTable 
} from '../schema'; // Adjust import path to your schema file

// Option 1: Clear tables in correct order (recommended for production)
export async function clearTables() {
    try {
        console.log('Clearing tables...');
        
        // Clear child tables first (tables with foreign keys)
        await db.delete(prodIngredientTable);
        console.log('Cleared prod_ingredient table');
        
        // Clear parent tables
        await db.delete(productTable);
        console.log('Cleared product table');
        
        await db.delete(ingredientTable);
        console.log('Cleared ingredient table');
        
        await db.delete(holderTable);
        console.log('Cleared holder table');
        
        console.log('All tables cleared successfully');
    } catch (error) {
        console.error('Error clearing tables:', error);
        throw error;
    }
}

// Option 2: Clear tables with CASCADE (faster but more destructive)
export async function clearTablesWithCascade() {
    try {
        console.log('Clearing tables with CASCADE...');
        
        // Use raw SQL to truncate with CASCADE
        await db.execute(sql`TRUNCATE TABLE prod_ingredient, product, ingredient, holder CASCADE`);
        
        console.log('All tables cleared with CASCADE');
    } catch (error) {
        console.error('Error clearing tables with CASCADE:', error);
        throw error;
    }
}

// Option 3: Clear specific table
export async function clearTable(tableName: 'holder' | 'product' | 'ingredient' | 'prod_ingredient') {
    try {
        console.log(`Clearing ${tableName} table...`);
        
        switch (tableName) {
            case 'holder':
                await db.delete(holderTable);
                break;
            case 'product':
                await db.delete(productTable);
                break;
            case 'ingredient':
                await db.delete(ingredientTable);
                break;
            case 'prod_ingredient':
                await db.delete(prodIngredientTable);
                break;
        }
        
        console.log(`${tableName} table cleared successfully`);
    } catch (error) {
        console.error(`Error clearing ${tableName} table:`, error);
        throw error;
    }
}

// Option 4: Clear with transaction (safest)
export async function clearTablesWithTransaction() {
    try {
        await db.transaction(async (tx) => {
            console.log('Starting transaction to clear tables...');
            
            // Clear in correct order
            await tx.delete(prodIngredientTable);
            console.log('Cleared prod_ingredient table');
            
            await tx.delete(productTable);
            console.log('Cleared product table');
            
            await tx.delete(ingredientTable);
            console.log('Cleared ingredient table');
            
            await tx.delete(holderTable);
            console.log('Cleared holder table');
            
            console.log('Transaction completed - all tables cleared');
        });
    } catch (error) {
        console.error('Transaction failed - no tables were cleared:', error);
        throw error;
    }
}

// Usage examples:
// await clearTables();
// await clearTablesWithCascade();
// await clearTable('prod_ingredient');
// await clearTablesWithTransaction();