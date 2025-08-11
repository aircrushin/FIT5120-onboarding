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
      like(sql`lower(${productTable.prod_brand})`, `%${searchQuery}%`),
      like(sql`lower(${productTable.prod_category})`, `%${searchQuery}%`),
    );
    
    // Individual word matches for multi-word searches
    searchTerms.forEach(term => {
      if (term.length >= 2) { // Only search terms with 2+ characters
        searchConditions.push(
          like(sql`lower(${productTable.prod_name})`, `%${term}%`),
          like(sql`lower(${productTable.prod_notif_no})`, `%${term}%`),
          like(sql`lower(${productTable.prod_brand})`, `%${term}%`),
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

    // For each product, get its ingredients and calculate relevance score
    const productsWithIngredients: ProductSearchResult[] = await Promise.all(
      uniqueProducts.map(async (product) => {
        const ingredients = await db
          .select({
            name: ingredientTable.ing_name,
            risk_type: ingredientTable.ing_risk_type,
            risk_summary: ingredientTable.ing_risk_summary,
          })
          .from(prodIngredientTable)
          .leftJoin(ingredientTable, eq(prodIngredientTable.ing_id, ingredientTable.ing_id))
          .where(eq(prodIngredientTable.prod_notif_no, product.prod_notif_no));

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
          ingredients: ingredients.map(ing => ({
            name: ing.name || '',
            risk_type: (ing.risk_type as 'L' | 'H' | 'B') || 'L',
            risk_summary: ing.risk_summary || '',
          })),
          relevanceScore,
        };
      })
    );

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
    throw new Error('Failed to search products');
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

    const productsWithIngredients: ProductSearchResult[] = await Promise.all(
      products.map(async (product) => {
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
      })
    );

    return productsWithIngredients;
  } catch (error) {
    console.error('Error getting all products:', error);
    throw new Error('Failed to get products');
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
  categories: string[];
  brands: string[];
}

export interface ProductFilters {
  safetyLevels: ('safe' | 'unsafe' | 'risky')[];
  ingredientIds: number[];
  approvalStatuses: ('A' | 'C')[];
  categories: string[];
  brands: string[];
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

    // Get all unique categories
    const categories = await db
      .selectDistinct({
        category: productTable.prod_category,
      })
      .from(productTable)
      .orderBy(productTable.prod_category);

    // Get all unique brands
    const brands = await db
      .selectDistinct({
        brand: productTable.prod_brand,
      })
      .from(productTable)
      .orderBy(productTable.prod_brand);

    return {
      ingredients: ingredients.map(ing => ({
        ing_id: ing.ing_id,
        ing_name: ing.ing_name,
        ing_risk_type: ing.ing_risk_type as 'B' | 'H' | 'L' | 'N',
      })),
      categories: categories.map(c => c.category),
      brands: brands.map(b => b.brand),
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      ingredients: [],
      categories: [],
      brands: [],
    };
  }
}

export async function getFilteredProductsAction(filters: ProductFilters, searchQuery?: string): Promise<ProductSearchResult[]> {
  try {
    // Build where conditions
    const whereConditions = [];

    // Apply search query if provided
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const searchTerms = query.split(' ').filter(term => term.length > 0);
      
      const searchConditions = [];
      searchConditions.push(
        like(sql`lower(${productTable.prod_name})`, `%${query}%`),
        like(sql`lower(${productTable.prod_notif_no})`, `%${query}%`),
        like(sql`lower(${productTable.prod_brand})`, `%${query}%`),
        like(sql`lower(${productTable.prod_category})`, `%${query}%`),
      );
      
      searchTerms.forEach(term => {
        if (term.length >= 2) {
          searchConditions.push(
            like(sql`lower(${productTable.prod_name})`, `%${term}%`),
            like(sql`lower(${productTable.prod_notif_no})`, `%${term}%`),
            like(sql`lower(${productTable.prod_brand})`, `%${term}%`),
            like(sql`lower(${productTable.prod_category})`, `%${term}%`),
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

    // Apply category filter
    if (filters.categories.length > 0) {
      whereConditions.push(
        sql`${productTable.prod_category} IN (${sql.join(filters.categories.map(cat => sql`${cat}`), sql`, `)})`
      );
    }

    // Apply brand filter
    if (filters.brands.length > 0) {
      whereConditions.push(
        sql`${productTable.prod_brand} IN (${sql.join(filters.brands.map(brand => sql`${brand}`), sql`, `)})`
      );
    }

    // Get products with base filters
    const baseQuery = db
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
      .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id));

    const products = whereConditions.length > 0
      ? await baseQuery.where(and(...whereConditions)).orderBy(desc(productTable.prod_status_date))
      : await baseQuery.orderBy(desc(productTable.prod_status_date));

    // Get products with their ingredients
    const productsWithIngredients: ProductSearchResult[] = await Promise.all(
      products.map(async (product) => {
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
      })
    );

    // Apply additional filters that require ingredient data
    let filteredProducts = productsWithIngredients;

    // Apply ingredient filter
    if (filters.ingredientIds.length > 0) {
      const productsWithIngredientData = await Promise.all(
        filteredProducts.map(async (product) => {
          const productIngredients = await db
            .select({ ing_id: prodIngredientTable.ing_id })
            .from(prodIngredientTable)
            .where(eq(prodIngredientTable.prod_notif_no, product.prod_notif_no));
          
          const productIngredientIds = productIngredients.map(pi => pi.ing_id);
          const hasMatchingIngredient = filters.ingredientIds.some(filterId => 
            productIngredientIds.includes(filterId)
          );
          
          return { product, hasMatchingIngredient };
        })
      );
      
      filteredProducts = productsWithIngredientData
        .filter(item => item.hasMatchingIngredient)
        .map(item => item.product);
    }

    // Apply safety level filter
    if (filters.safetyLevels.length > 0 && filters.safetyLevels.length < 3) {
      filteredProducts = filteredProducts.filter(product => {
        // Calculate safety level based on status and ingredients
        let safetyLevel: 'safe' | 'unsafe' | 'risky';
        
        if (product.prod_status_type === 'C') {
          safetyLevel = 'unsafe';
        } else {
          const hasBannedIngredients = product.ingredients.some(ing => ing.risk_type === 'B');
          const hasHighRiskIngredients = product.ingredients.some(ing => ing.risk_type === 'H');
          
          if (hasBannedIngredients || hasHighRiskIngredients) {
            safetyLevel = 'risky';
          } else {
            safetyLevel = 'safe';
          }
        }
        
        return filters.safetyLevels.includes(safetyLevel);
      });
    }

    return filteredProducts;
  } catch (error) {
    console.error('Error getting filtered products:', error);
    throw new Error('Failed to get filtered products');
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
    throw new Error('Failed to get featured products');
  }
} 