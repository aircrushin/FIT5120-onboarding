import { 
  holderTable, 
  productTable, 
  ingredientTable, 
  prodIngredientTable,
  type InsertHolder,
  type InsertProduct,
  type InsertIngredient,
  type InsertProdIngredient
} from '../schema'; // Import your schema
import { db } from '../index';

// 2.1 Insert Holder
async function insertHolder(holderData: InsertHolder) {
  try {
    const result = await db.insert(holderTable)
      .values(holderData)
      .returning();
    
    console.log('Holder inserted:', result);
    return result[0];
  } catch (error) {
    console.error('Error inserting holder:', error);
    throw error;
  }
}

// 2.2 Insert Ingredient
async function insertIngredient(ingredientData: InsertIngredient) {
  try {
    const result = await db.insert(ingredientTable)
      .values(ingredientData)
      .returning();
    
    console.log('Ingredient inserted:', result);
    return result[0];
  } catch (error) {
    console.error('Error inserting ingredient:', error);
    throw error;
  }
}

// 2.3 Insert Product (requires existing holder_id)
async function insertProduct(productData: InsertProduct) {
  try {
    const result = await db.insert(productTable)
      .values(productData)
      .returning();
    
    console.log('Product inserted:', result);
    return result[0];
  } catch (error) {
    console.error('Error inserting product:', error);
    throw error;
  }
}

// 2.4 Insert Product-Ingredient relationship
async function insertProdIngredient(prodIngData: InsertProdIngredient) {
  try {
    const result = await db.insert(prodIngredientTable)
      .values(prodIngData)
      .returning();
    
    console.log('Product-Ingredient relationship inserted:', result);
    return result[0];
  } catch (error) {
    console.error('Error inserting product-ingredient relationship:', error);
    throw error;
  }
}

// Step 3: Batch Insert Functions

// 3.1 Insert multiple holders
async function insertMultipleHolders(holdersData: InsertHolder[]) {
  try {
    const result = await db.insert(holderTable)
      .values(holdersData)
      .returning();
    
    console.log('Multiple holders inserted:', result);
    return result;
  } catch (error) {
    console.error('Error inserting multiple holders:', error);
    throw error;
  }
}

// 3.2 Insert multiple ingredients
async function insertMultipleIngredients(ingredientsData: InsertIngredient[]) {
  try {
    const result = await db.insert(ingredientTable)
      .values(ingredientsData)
      .returning();
    
    console.log('Multiple ingredients inserted:', result);
    return result;
  } catch (error) {
    console.error('Error inserting multiple ingredients:', error);
    throw error;
  }
}

// Export all functions for use in other modules
export {
  insertHolder,
  insertIngredient,
  insertProduct,
  insertProdIngredient,
  insertMultipleHolders,
  insertMultipleIngredients
};