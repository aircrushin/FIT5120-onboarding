'use server'

import { db } from '../../db/index';
import { productTable, holderTable, ingredientTable, prodIngredientTable } from '../../db/schema';
import { SQL, eq, or, like, desc, sql, and } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';

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
    risk_type: 'L' | 'H' | 'B';
    risk_summary: string;
  }>;
  relevanceScore?: number;
}

export interface SimilarProductResult {
  prod_notif_no: string;
  prod_name: string;
  prod_brand: string;
  prod_category: string;
  prod_status_type: 'A' | 'C';
  prod_status_date: string;
  holder_name: string;
  holderApprovedCount: number;
}

export interface FeaturedProduct {
  prod_notif_no: string;
  prod_name: string;
  prod_status_type: 'A' | 'C';
}

export async function searchProductsAction(query: string): Promise<ProductSearchResult[]> {
  if (!query || !query.trim()) {
    return [];
  }

  try {
    const searchQuery = query.trim().toLowerCase();
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    // Enhanced search with multiple strategies
    const searchConditions = [];
    
    // Exact phrase match (highest priority)
    searchConditions.push(
      like(sql`lower(${productTable.prod_name})`, `%${searchQuery}%`),
      like(sql`lower(${productTable.prod_notif_no})`, `%${searchQuery}%`),
      like(sql`lower(${productTable.prod_category})`, `%${searchQuery}%`),
    );
    
    // Individual word matches for multi-word searches
    searchTerms.forEach(term => {
      if (term.length >= 2) { // Only search terms with 2+ characters
        searchConditions.push(
          like(sql`lower(${productTable.prod_name})`, `%${term}%`),
          like(sql`lower(${productTable.prod_notif_no})`, `%${term}%`),
          like(sql`lower(${productTable.prod_category})`, `%${term}%`),
        );
      }
    });

    // Search for products with enhanced conditions
    const products = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_name: productTable.prod_name,
        prod_brand: productTable.prod_brand,
        prod_category: productTable.prod_category,
        prod_status_type: productTable.prod_status_type,
        prod_status_date: productTable.prod_status_date,
        holder_name: holderTable.holder_name,
      })
      .from(productTable)
      .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id))
      .where(or(...searchConditions))
      .orderBy(desc(productTable.prod_status_date));

    // Remove duplicates (since we're using multiple search conditions)
    const uniqueProducts = Array.from(
      new Map(products.map(p => [p.prod_notif_no, p])).values()
    );

    // Batch fetch all ingredients for all products to reduce database queries
    const allProductNotifNos = uniqueProducts.map(p => p.prod_notif_no);
    
    let allIngredients: { [key: string]: Array<{ name: string; risk_type: 'L' | 'H' | 'B'; risk_summary: string; }> } = {};
    
    try {
      // Fetch all ingredients in a single query
      const ingredientsData = await db
        .select({
          prod_notif_no: prodIngredientTable.prod_notif_no,
          name: ingredientTable.ing_name,
          risk_type: ingredientTable.ing_risk_type,
          risk_summary: ingredientTable.ing_risk_summary,
        })
        .from(prodIngredientTable)
        .leftJoin(ingredientTable, eq(prodIngredientTable.ing_id, ingredientTable.ing_id))
        .where(sql`${prodIngredientTable.prod_notif_no} IN (${sql.join(allProductNotifNos.map(notif => sql`${notif}`), sql`, `)})`);

      // Group ingredients by product notification number
      ingredientsData.forEach(item => {
        if (!allIngredients[item.prod_notif_no]) {
          allIngredients[item.prod_notif_no] = [];
        }
        allIngredients[item.prod_notif_no].push({
          name: item.name || '',
          risk_type: (item.risk_type as 'L' | 'H' | 'B') || 'L',
          risk_summary: item.risk_summary || '',
        });
      });
    } catch (ingredientError) {
      console.error('Error fetching ingredients:', ingredientError);
      // Initialize empty ingredients for all products if query fails
      allProductNotifNos.forEach(notif => {
        allIngredients[notif] = [];
      });
    }

    // Process products with their ingredients and calculate relevance scores
    const productsWithIngredients: ProductSearchResult[] = uniqueProducts.map((product) => {
      // Calculate relevance score for better sorting
      let relevanceScore = 0;
      const productText = `${product.prod_name} ${product.prod_brand} ${product.prod_category}`.toLowerCase();
      
      // Exact phrase match gets highest score
      if (productText.includes(searchQuery.toLowerCase())) {
        relevanceScore += 100;
      }
      
      // Count how many search terms match
      searchTerms.forEach(term => {
        if (productText.includes(term)) {
          relevanceScore += 10;
        }
      });
      
      // Notification number exact match gets high score
      if (product.prod_notif_no.toLowerCase().includes(searchQuery.toLowerCase())) {
        relevanceScore += 50;
      }

      return {
        ...product,
        prod_status_type: product.prod_status_type as 'A' | 'C',
        holder_name: product.holder_name || 'Unknown Holder',
        ingredients: allIngredients[product.prod_notif_no] || [],
        relevanceScore,
      };
    });

    // Sort by relevance score then by status date
    return productsWithIngredients.sort((a, b) => {
      const scoreA = a.relevanceScore || 0;
      const scoreB = b.relevanceScore || 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return new Date(b.prod_status_date).getTime() - new Date(a.prod_status_date).getTime();
    });
  } catch (error) {
    console.error('Error searching products:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
}

export async function getProductByNotificationAction(notificationNumber: string): Promise<ProductSearchResult | null> {
  if (!notificationNumber || !notificationNumber.trim()) {
    return null;
  }

  try {
    const productResult = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_name: productTable.prod_name,
        prod_brand: productTable.prod_brand,
        prod_category: productTable.prod_category,
        prod_status_type: productTable.prod_status_type,
        prod_status_date: productTable.prod_status_date,
        holder_name: holderTable.holder_name,
      })
      .from(productTable)
      .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id))
      .where(eq(productTable.prod_notif_no, notificationNumber.trim()))
      .limit(1);

    if (productResult.length === 0) {
      return null;
    }

    const product = productResult[0];

    // Get ingredients for this product
    const ingredients = await db
      .select({
        name: ingredientTable.ing_name,
        risk_type: ingredientTable.ing_risk_type,
        risk_summary: ingredientTable.ing_risk_summary,
      })
      .from(prodIngredientTable)
      .leftJoin(ingredientTable, eq(prodIngredientTable.ing_id, ingredientTable.ing_id))
      .where(eq(prodIngredientTable.prod_notif_no, product.prod_notif_no));

    return {
      ...product,
      prod_status_type: product.prod_status_type as 'A' | 'C',
      holder_name: product.holder_name || 'Unknown Holder',
      ingredients: ingredients.map(ing => ({
        name: ing.name || '',
        risk_type: (ing.risk_type as 'L' | 'H' | 'B') || 'L',
        risk_summary: ing.risk_summary || '',
      })),
    };
  } catch (error) {
    console.error('Error getting product by notification number:', error);
    throw new Error('Failed to get product details');
  }
}

export async function getAllProductsAction(): Promise<ProductSearchResult[]> {
  try {
    const products = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_name: productTable.prod_name,
        prod_brand: productTable.prod_brand,
        prod_category: productTable.prod_category,
        prod_status_type: productTable.prod_status_type,
        prod_status_date: productTable.prod_status_date,
        holder_name: holderTable.holder_name,
      })
      .from(productTable)
      .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id))
      .orderBy(desc(productTable.prod_status_date));

    // Batch fetch all ingredients for all products
    const allProductNotifNos = products.map(p => p.prod_notif_no);
    
    let allIngredients: { [key: string]: Array<{ name: string; risk_type: 'L' | 'H' | 'B'; risk_summary: string; }> } = {};
    
    try {
      if (allProductNotifNos.length > 0) {
        const ingredientsData = await db
          .select({
            prod_notif_no: prodIngredientTable.prod_notif_no,
            name: ingredientTable.ing_name,
            risk_type: ingredientTable.ing_risk_type,
            risk_summary: ingredientTable.ing_risk_summary,
          })
          .from(prodIngredientTable)
          .leftJoin(ingredientTable, eq(prodIngredientTable.ing_id, ingredientTable.ing_id))
          .where(sql`${prodIngredientTable.prod_notif_no} IN (${sql.join(allProductNotifNos.map(notif => sql`${notif}`), sql`, `)})`);

        // Group ingredients by product notification number
        ingredientsData.forEach(item => {
          if (!allIngredients[item.prod_notif_no]) {
            allIngredients[item.prod_notif_no] = [];
          }
          allIngredients[item.prod_notif_no].push({
            name: item.name || '',
            risk_type: (item.risk_type as 'L' | 'H' | 'B') || 'L',
            risk_summary: item.risk_summary || '',
          });
        });
      }
    } catch (ingredientError) {
      console.error('Error fetching ingredients in getAllProducts:', ingredientError);
      // Initialize empty ingredients for all products if query fails
      allProductNotifNos.forEach(notif => {
        allIngredients[notif] = [];
      });
    }

    const productsWithIngredients: ProductSearchResult[] = products.map((product) => {
      return {
        ...product,
        prod_status_type: product.prod_status_type as 'A' | 'C',
        holder_name: product.holder_name || 'Unknown Holder',
        ingredients: allIngredients[product.prod_notif_no] || [],
      };
    });

    return productsWithIngredients;
  } catch (error) {
    console.error('Error getting all products:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
}

export async function getSimilarApprovedProductsAction(referenceNotifNo: string, limit: number = 6): Promise<SimilarProductResult[]> {
  
  try {
    const referenceProduct = await db
      .select()
      .from(productTable)
      .where(eq(productTable.prod_notif_no, referenceNotifNo))
      .limit(1);

    if (referenceProduct.length === 0) {
      return [];
    }

    const refCategory = referenceProduct[0].prod_category;

    const products = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_name: productTable.prod_name,
        prod_brand: productTable.prod_brand,
        prod_category: productTable.prod_category,
        prod_status_type: productTable.prod_status_type,
        prod_status_date: productTable.prod_status_date,
        holder_name: holderTable.holder_name,
      })
      .from(productTable)
      .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id))
      .where(
        sql`${productTable.prod_category} = ${refCategory} AND ${productTable.prod_status_type} = 'A' AND ${productTable.prod_notif_no} != ${referenceNotifNo}`
      )
      .orderBy(desc(productTable.prod_status_date))
      .limit(limit);

    return products.map(product => ({
      prod_notif_no: product.prod_notif_no,
      prod_name: product.prod_name,
      prod_brand: product.prod_brand,
      prod_category: product.prod_category,
      prod_status_type: product.prod_status_type as 'A' | 'C',
      prod_status_date: product.prod_status_date,
      holder_name: product.holder_name || 'Unknown Holder',
      holderApprovedCount: 0, // Set default value since we're not calculating this in the new implementation
    }));
  } catch (error) {
    console.error('Error getting similar products:', error);
    return [];
  }
}

export interface FilterOptions {
  ingredients: Array<{
    ing_id: number;
    ing_name: string;
    ing_risk_type: 'B' | 'H' | 'L' | 'N';
  }>;
}

export interface ProductFilters {
  safetyLevels: ('safe' | 'unsafe' | 'risky')[];
  ingredientIds: number[];
  approvalStatuses: ('A' | 'C')[];
}

export async function getFilterOptionsAction(): Promise<FilterOptions> {
  try {
    // Get all ingredients
    const ingredients = await db
      .select({
        ing_id: ingredientTable.ing_id,
        ing_name: ingredientTable.ing_name,
        ing_risk_type: ingredientTable.ing_risk_type,
      })
      .from(ingredientTable)
      .orderBy(ingredientTable.ing_name);

    return {
      ingredients: ingredients.map(ing => ({
        ing_id: ing.ing_id,
        ing_name: ing.ing_name,
        ing_risk_type: ing.ing_risk_type as 'B' | 'H' | 'L' | 'N',
      }))
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      ingredients: []
    };
  }
}

export async function getFilteredProductsAction(filters: ProductFilters, searchQuery?: string): Promise<ProductSearchResult[]> {
  try {
    // Build where conditions for the main product query
    const whereConditions = [];

    // Apply search query if provided
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const searchTerms = query.split(' ').filter(term => term.length > 0);
      
      const searchConditions = [];
      searchConditions.push(
        like(sql`lower(${productTable.prod_name})`, `%${query}%`),
        like(sql`lower(${productTable.prod_notif_no})`, `%${query}%`),
      );
      
      searchTerms.forEach(term => {
        if (term.length >= 2) {
          searchConditions.push(
            like(sql`lower(${productTable.prod_name})`, `%${term}%`),
            like(sql`lower(${productTable.prod_notif_no})`, `%${term}%`),
          );
        }
      });
      
      whereConditions.push(or(...searchConditions));
    }

    // Apply approval status filter
    if (filters.approvalStatuses.length > 0 && filters.approvalStatuses.length < 2) {
      whereConditions.push(
        sql`${productTable.prod_status_type} IN (${sql.join(filters.approvalStatuses.map(status => sql`${status}`), sql`, `)})`
      );
    }

    // Apply ingredient filter using subquery
    if (filters.ingredientIds.length > 0) {
      whereConditions.push(
        sql`${productTable.prod_notif_no} IN (
          SELECT DISTINCT ${prodIngredientTable.prod_notif_no} 
          FROM ${prodIngredientTable} 
          WHERE ${prodIngredientTable.ing_id} IN (${sql.join(filters.ingredientIds.map(id => sql`${id}`), sql`, `)})
        )`
      );
    }

    // Apply safety level filter using subqueries
    if (filters.safetyLevels.length > 0 && filters.safetyLevels.length < 3) {
      const safetyConditions: any[] = [];
      
      filters.safetyLevels.forEach(level => {
        switch (level) {
          case 'safe':
            // Products that are approved AND don't have banned or high-risk ingredients
            safetyConditions.push(
              sql`(
                ${productTable.prod_status_type} = 'A' 
                AND ${productTable.prod_notif_no} NOT IN (
                  SELECT DISTINCT pi.prod_notif_no 
                  FROM ${prodIngredientTable} pi
                  JOIN ${ingredientTable} i ON pi.ing_id = i.ing_id
                  WHERE i.ing_risk_type IN ('L', 'H', 'B')
                )
              )`
            );
            break;
            
          case 'risky':
            // Products that are approved but have banned or high-risk ingredients
            safetyConditions.push(
              sql`(
                ${productTable.prod_status_type} = 'A' 
                AND ${productTable.prod_notif_no} IN (
                  SELECT DISTINCT pi.prod_notif_no 
                  FROM ${prodIngredientTable} pi
                  JOIN ${ingredientTable} i ON pi.ing_id = i.ing_id
                  WHERE i.ing_risk_type IN ('L', 'H', 'B')
                )
              )`
            );
            break;
            
          case 'unsafe':
            // Products that are cancelled
            safetyConditions.push(
              sql`${productTable.prod_status_type} = 'C'`
            );
            break;
        }
      });
      
      if (safetyConditions.length > 0) {
        whereConditions.push(or(...safetyConditions));
      }
    }

    // Single optimized query with JOINs to get products with aggregated ingredients
    const productsWithIngredients = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_name: productTable.prod_name,
        prod_brand: productTable.prod_brand,
        prod_category: productTable.prod_category,
        prod_status_type: productTable.prod_status_type,
        prod_status_date: productTable.prod_status_date,
        holder_name: holderTable.holder_name,
        // Aggregate ingredients as JSON
        ingredients: sql<string>`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'name', ${ingredientTable.ing_name},
              'risk_type', ${ingredientTable.ing_risk_type},
              'risk_summary', ${ingredientTable.ing_risk_summary}
            )
          ) FILTER (WHERE ${ingredientTable.ing_name} IS NOT NULL),
          '[]'::json
        )`,
      })
      .from(productTable)
      .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id))
      .leftJoin(prodIngredientTable, eq(productTable.prod_notif_no, prodIngredientTable.prod_notif_no))
      .leftJoin(ingredientTable, eq(prodIngredientTable.ing_id, ingredientTable.ing_id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(
        productTable.prod_notif_no,
        productTable.prod_name,
        productTable.prod_brand,
        productTable.prod_category,
        productTable.prod_status_type,
        productTable.prod_status_date,
        holderTable.holder_name
      )
      .orderBy(desc(productTable.prod_status_date));

    // Transform the results to match expected format
    const results: ProductSearchResult[] = productsWithIngredients.map(product => ({
      prod_notif_no: product.prod_notif_no,
      prod_name: product.prod_name,
      prod_brand: product.prod_brand,
      prod_category: product.prod_category,
      prod_status_type: product.prod_status_type as 'A' | 'C',
      prod_status_date: product.prod_status_date,
      holder_name: product.holder_name || 'Unknown Holder',
      ingredients: typeof product.ingredients === 'string' 
        ? JSON.parse(product.ingredients)
        : (Array.isArray(product.ingredients) ? product.ingredients : [])
    }));

    return results;
    
  } catch (error) {
    console.error('Error getting filtered products:', error);
    
    // Fallback to simpler query if JSON aggregation fails (for databases that don't support it)
    try {
      console.log('Falling back to basic query without ingredient aggregation...');
      
      const whereConditions = [];
      
      // Re-apply basic filters for fallback
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        whereConditions.push(or(
          like(sql`lower(${productTable.prod_name})`, `%${query}%`),
          like(sql`lower(${productTable.prod_notif_no})`, `%${query}%`)
        ));
      }

      if (filters.approvalStatuses.length > 0 && filters.approvalStatuses.length < 2) {
        whereConditions.push(
          sql`${productTable.prod_status_type} IN (${sql.join(filters.approvalStatuses.map(status => sql`${status}`), sql`, `)})`
        );
      }

      if (filters.ingredientIds.length > 0) {
        whereConditions.push(
          sql`${productTable.prod_notif_no} IN (
            SELECT DISTINCT ${prodIngredientTable.prod_notif_no} 
            FROM ${prodIngredientTable} 
            WHERE ${prodIngredientTable.ing_id} IN (${sql.join(filters.ingredientIds.map(id => sql`${id}`), sql`, `)})
          )`
        );
      }
      
      const basicProducts = await db
        .select({
          prod_notif_no: productTable.prod_notif_no,
          prod_name: productTable.prod_name,
          prod_brand: productTable.prod_brand,
          prod_category: productTable.prod_category,
          prod_status_type: productTable.prod_status_type,
          prod_status_date: productTable.prod_status_date,
          holder_name: holderTable.holder_name,
        })
        .from(productTable)
        .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(productTable.prod_status_date));

      // Return basic results with empty ingredients array
      return basicProducts.map(product => ({
        ...product,
        prod_status_type: product.prod_status_type as 'A' | 'C',
        holder_name: product.holder_name || 'Unknown Holder',
        ingredients: [] // Empty ingredients array for fallback
      }));
      
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }
}

export async function getRandomProductsAction(limit: number = 6): Promise<FeaturedProduct[]> {
  try {
    const products = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_name: productTable.prod_name,
        prod_status_type: productTable.prod_status_type,
      })
      .from(productTable)
      .where(eq(productTable.prod_status_type, 'C'))
      .orderBy(sql`random()`)
      .limit(Math.max(1, Math.min(limit, 20))); // Limit between 1-20

    return products.map((p) => ({
      prod_notif_no: p.prod_notif_no,
      prod_name: p.prod_name,
      prod_status_type: p.prod_status_type as 'A' | 'C',
    }));
  } catch (error) {
    console.error('Error getting random products:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
} 