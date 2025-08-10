'use server'

import { db } from './index';
import { holderTable, ingredientTable, prodIngredientTable, productTable } from './schema';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface HolderCSVRow {
  holder_id: string;
  holder_name: string;
}

interface IngredientCSVRow {
  ingredient_id: string;
  ingredient_name: string;
  ingredient_risk_type: string;
  ingredient_risk_summary: string;
}

interface ProdIngredientCSVRow {
  prod_notif_no: string;
  ingredient_id: string;
}

interface ProductCSVRow {
  prod_notif_no: string;
  prod_name: string;
  holder_name: string;
  prod_status_date: string;
  prod_status_type: string;
  prod_brand: string;
  prod_category: string;
  banned_substances: string;
  holders_id: string;
}

// Function to map risk type from CSV to database format
function mapRiskType(csvRiskType: string): string {
  const riskTypeMap: { [key: string]: string } = {
    'Banned': 'B',
    'High Risk': 'H', 
    'No Risk': 'L'
  };
  
  return riskTypeMap[csvRiskType] || 'B'; // Default to 'B' for Banned
}

// Function to parse date from DD-MM-YY format to YYYY-MM-DD
function parseDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') {
    throw new Error('Invalid date string');
  }
  
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  let year = parts[2];
  
  // Convert 2-digit year to 4-digit year
  if (year.length === 2) {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const yearNum = parseInt(year, 10);
    
    // Assume years 00-30 are in 2000s, 31-99 are in 1900s
    if (yearNum <= 30) {
      year = (currentCentury + yearNum).toString();
    } else {
      year = (currentCentury - 100 + yearNum).toString();
    }
  }
  
  return `${year}-${month}-${day}`;
}

// Function to map status type from CSV to database format
function mapStatusType(csvStatusType: string): string {
  const statusTypeMap: { [key: string]: string } = {
    'Clear': 'A',      // Assuming "Clear" means "Approved"
    'Banned': 'C',
  };
  
  const mapped = statusTypeMap[csvStatusType.trim()];
  if (!mapped) {
    console.warn(`Unknown status type: ${csvStatusType}, defaulting to 'U'`);
    return 'U';
  }
  
  return mapped;
}

async function insertHoldersFromCSV() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'db/data/holders.csv'); // Adjust path as needed
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV content
    const parseResult = Papa.parse<HolderCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings initially for validation
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return;
    }

    // Transform CSV data to match database schema
    const holdersData: any[] = parseResult.data.map((row) => ({
      holder_id: parseInt(row.holder_id, 10),
      holder_name: row.holder_name.trim(),
    }));

    // Validate data
    const validHolders = holdersData.filter((holder) => {
      if (isNaN(holder.holder_id) || !holder.holder_name) {
        console.warn('Invalid holder data:', holder);
        return false;
      }
      return true;
    });

    if (validHolders.length === 0) {
      console.error('No valid holder data found');
      return;
    }

    console.log(`Inserting ${validHolders.length} holders into database...`);

    // Insert data in batches (optional, for better performance with large datasets)
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < validHolders.length; i += batchSize) {
      const batch = validHolders.slice(i, i + batchSize);
      
      try {
        await db.insert(holderTable).values(batch).onConflictDoNothing();
        insertedCount += batch.length;
        console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(validHolders.length / batchSize)}`);
      } catch (error) {
        console.error(`Error inserting batch ${Math.ceil((i + 1) / batchSize)}:`, error);
        // Continue with next batch instead of failing completely
      }
    }

    console.log(`Successfully inserted ${insertedCount} holders into the database`);
    
    // Verify the insertion
    const totalHolders = await db.select().from(holderTable);
    console.log(`Total holders in database: ${totalHolders.length}`);

  } catch (error) {
    console.error('Error inserting holders:', error);
  }
}

async function insertIngredientsFromCSV() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'db/data/ingredients.csv'); // Adjust path as needed
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV content
    const parseResult = Papa.parse<IngredientCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => header.trim(), // Clean headers
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return;
    }

    console.log(`Found ${parseResult.data.length} ingredients in CSV`);

    // Transform CSV data to match database schema
    const ingredientsData: any[] = parseResult.data.map((row) => {
      // Clean the risk summary by removing quotes and extra whitespace
      let cleanSummary = row.ingredient_risk_summary
        .replace(/^"|"$/g, '') // Remove leading/trailing quotes
        .trim();
      
      return {
        ing_id: parseInt(row.ingredient_id, 10),
        ing_name: row.ingredient_name.trim(),
        ing_risk_summary: cleanSummary,
        ing_risk_type: mapRiskType(row.ingredient_risk_type.trim()),
      };
    });

    // Validate data
    const validIngredients = ingredientsData.filter((ingredient) => {
      if (isNaN(ingredient.ing_id) || !ingredient.ing_name || !ingredient.ing_risk_summary) {
        console.warn('Invalid ingredient data:', ingredient);
        return false;
      }
      
      // Validate risk type
      if (!['B', 'H', 'L'].includes(ingredient.ing_risk_type)) {
        console.warn('Invalid risk type for ingredient:', ingredient);
        return false;
      }
      
      return true;
    });

    if (validIngredients.length === 0) {
      console.error('No valid ingredient data found');
      return;
    }

    console.log(`Inserting ${validIngredients.length} valid ingredients into database...`);

    // Log sample data for verification
    console.log('Sample ingredient data:');
    console.log(JSON.stringify(validIngredients.slice(0, 2), null, 2));

    // Insert data in batches
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < validIngredients.length; i += batchSize) {
      const batch = validIngredients.slice(i, i + batchSize);
      
      try {
        await db.insert(ingredientTable).values(batch).onConflictDoNothing();
        insertedCount += batch.length;
        console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(validIngredients.length / batchSize)}`);
      } catch (error) {
        console.error(`Error inserting batch ${Math.ceil((i + 1) / batchSize)}:`, error);
        console.error('Batch data:', JSON.stringify(batch, null, 2));
        // Continue with next batch instead of failing completely
      }
    }

    console.log(`Successfully inserted ${insertedCount} ingredients into the database`);
    
    // Verify the insertion
    const totalIngredients = await db.select().from(ingredientTable);
    console.log(`Total ingredients in database: ${totalIngredients.length}`);

    // Show sample of inserted data
    const sampleIngredients = await db.select().from(ingredientTable).limit(3);
    console.log('Sample inserted ingredients:');
    console.log(sampleIngredients);

  } catch (error) {
    console.error('Error inserting ingredients:', error);
  }
}

async function insertProductsFromCSV() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'db/data/products.csv'); // Adjust path as needed
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV content
    const parseResult = Papa.parse<ProductCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => header.trim(), // Clean headers
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return;
    }

    console.log(`Found ${parseResult.data.length} products in CSV`);

    // Transform CSV data to match database schema
    const productsData: any[] = [];
    const skippedProducts: any[] = [];

    for (const row of parseResult.data) {
      try {
        console.log(row);
        const product = {
          prod_notif_no: row.prod_notif_no.trim(),
          prod_name: row.prod_name.trim(),
          prod_brand: row.prod_brand.trim(),
          prod_category: row.prod_category.trim(),
          prod_status_type: mapStatusType(row.prod_status_type),
          prod_status_date: parseDate(row.prod_status_date),
          holder_id: parseInt(row.holders_id, 10),
        };

        // Validation
        if (!product.prod_notif_no || product.prod_notif_no.length > 15) {
          throw new Error('Invalid product notification number');
        }
        
        if (!product.prod_name || !product.prod_brand || !product.prod_category) {
          throw new Error('Missing required product information');
        }
        
        if (isNaN(product.holder_id)) {
          throw new Error('Invalid holder ID');
        }

        productsData.push(product);
      } catch (error) {
        console.warn(`Skipping invalid product row:`, row, error);
        skippedProducts.push({ row, error: error instanceof Error ? error.message : String(error) });
      }
    }

    if (productsData.length === 0) {
      console.error('No valid product data found');
      return;
    }

    console.log(`Processing ${productsData.length} valid products`);
    if (skippedProducts.length > 0) {
      console.log(`Skipped ${skippedProducts.length} invalid products`);
    }

    // Log sample data for verification
    console.log('Sample product data:');
    console.log(JSON.stringify(productsData.slice(0, 2), null, 2));

    // Insert data in batches
    const batchSize = 50;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < productsData.length; i += batchSize) {
      const batch = productsData.slice(i, i + batchSize);
      
      try {
        await db.insert(productTable).values(batch).onConflictDoNothing();
        insertedCount += batch.length;
        console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(productsData.length / batchSize)}`);
      } catch (error) {
        console.error(`Error inserting batch ${Math.ceil((i + 1) / batchSize)}:`, error);
        
        // Try to insert items one by one to identify problematic records
        for (const product of batch) {
          try {
            await db.insert(productTable).values([product]).onConflictDoNothing();
            insertedCount++;
          } catch (individualError) {
            console.error('Failed to insert individual product:', product.prod_notif_no, individualError);
            errorCount++;
          }
        }
      }
    }

    console.log(`Successfully inserted ${insertedCount} products into the database`);
    if (errorCount > 0) {
      console.log(`Failed to insert ${errorCount} products due to errors`);
    }
    
    // Verify the insertion
    const totalProducts = await db.select().from(productTable);
    console.log(`Total products in database: ${totalProducts.length}`);

    // Show sample of inserted data
    const sampleProducts = await db.select().from(productTable).limit(3);
    console.log('Sample inserted products:');
    console.log(sampleProducts);

  } catch (error) {
    console.error('Error inserting products:', error);
  }
}

async function insertProdIngredientsFromCSV() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'db/data/product_ingredients.csv'); // Adjust path as needed
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV content
    const parseResult = Papa.parse<ProdIngredientCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => header.trim(), // Clean headers
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return;
    }

    console.log(`Found ${parseResult.data.length} product-ingredient relationships in CSV`);

    // Transform CSV data to match database schema
    const prodIngredientsData: any[] = parseResult.data.map((row) => ({
      prod_notif_no: row.prod_notif_no.trim(),
      ing_id: parseInt(row.ingredient_id, 10),
    }));

    // Validate data
    const validProdIngredients = prodIngredientsData.filter((prodIngredient) => {
      if (!prodIngredient.prod_notif_no || isNaN(prodIngredient.ing_id)) {
        console.warn('Invalid product-ingredient data:', prodIngredient);
        return false;
      }
      
      // Check if prod_notif_no is within length constraint (15 characters)
      if (prodIngredient.prod_notif_no.length > 15) {
        console.warn('Product notification number too long:', prodIngredient);
        return false;
      }
      
      return true;
    });

    if (validProdIngredients.length === 0) {
      console.error('No valid product-ingredient data found');
      return;
    }

    console.log(`Inserting ${validProdIngredients.length} valid product-ingredient relationships into database...`);

    // Log sample data for verification
    console.log('Sample product-ingredient data:');
    console.log(JSON.stringify(validProdIngredients.slice(0, 3), null, 2));

    // Remove duplicates (in case CSV has duplicate entries)
    const uniqueProdIngredients = validProdIngredients.filter((item, index, self) => {
      return index === self.findIndex(t => (
        t.prod_notif_no === item.prod_notif_no && t.ing_id === item.ing_id
      ));
    });

    console.log(`After removing duplicates: ${uniqueProdIngredients.length} unique relationships`);

    // Insert data in batches
    const batchSize = 100;
    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < uniqueProdIngredients.length; i += batchSize) {
      const batch = uniqueProdIngredients.slice(i, i + batchSize);
      
      try {
        const result = await db.insert(prodIngredientTable).values(batch).onConflictDoNothing();
        insertedCount += batch.length;
        console.log(`Processed batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(uniqueProdIngredients.length / batchSize)}`);
      } catch (error) {
        console.error(`Error inserting batch ${Math.ceil((i + 1) / batchSize)}:`, error);
        
        // Try to insert items one by one to identify problematic records
        for (const item of batch) {
          try {
            await db.insert(prodIngredientTable).values([item]).onConflictDoNothing();
            insertedCount++;
          } catch (individualError) {
            console.error('Failed to insert individual item:', item, individualError);
            skippedCount++;
          }
        }
      }
    }

    console.log(`Successfully processed ${insertedCount} product-ingredient relationships`);
    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} relationships due to errors`);
    }
    
    // Verify the insertion
    const totalProdIngredients = await db.select().from(prodIngredientTable);
    console.log(`Total product-ingredient relationships in database: ${totalProdIngredients.length}`);

    // Show sample of inserted data
    const sampleProdIngredients = await db.select().from(prodIngredientTable).limit(5);
    console.log('Sample inserted product-ingredient relationships:');
    console.log(sampleProdIngredients);

    // Show some statistics
    const uniqueProducts = await db.selectDistinct({ prod_notif_no: prodIngredientTable.prod_notif_no }).from(prodIngredientTable);
    const uniqueIngredients = await db.selectDistinct({ ing_id: prodIngredientTable.ing_id }).from(prodIngredientTable);
    
    console.log(`\nStatistics:`);
    console.log(`- Unique products with ingredients: ${uniqueProducts.length}`);
    console.log(`- Unique ingredients used: ${uniqueIngredients.length}`);

  } catch (error) {
    console.error('Error inserting product-ingredients:', error);
  }
}

// Export the function to use in your application
export { 
  insertHoldersFromCSV, 
  insertIngredientsFromCSV,
  insertProductsFromCSV,
  insertProdIngredientsFromCSV,
};