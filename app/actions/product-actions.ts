'use server'

import { db } from '../../db/index';
import { productTable, holderTable, ingredientTable, prodIngredientTable } from '../../db/schema';
import { SQL, eq, or, like, desc, sql } from 'drizzle-orm';
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
  if (!referenceNotifNo || !referenceNotifNo.trim()) {
    return [];
  }

  try {
    // Find the reference product to get its category
    const ref = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_category: productTable.prod_category,
        prod_brand: productTable.prod_brand,
      })
      .from(productTable)
      .where(eq(productTable.prod_notif_no, referenceNotifNo.trim()))
      .limit(1);

    if (ref.length === 0) return [];
    const refCategory = ref[0].prod_category;
    const refBrand = ref[0].prod_brand;

    // Subquery: approved counts per holder (trusted brands heuristic)
    const approvedCounts = db
      .select({
        holder_id: productTable.holder_id,
        approved_count: sql<number>`COUNT(*)`.as('approved_count'),
      })
      .from(productTable)
      .where(eq(productTable.prod_status_type, 'A'))
      .groupBy(productTable.holder_id)
      .as('approved_counts');

    // Helper to select approved products with dynamic where clause
    const selectApproved = async (whereExpr: any, take: number) => {
      const rows = await db
        .select({
          prod_notif_no: productTable.prod_notif_no,
          prod_name: productTable.prod_name,
          prod_brand: productTable.prod_brand,
          prod_category: productTable.prod_category,
          prod_status_type: productTable.prod_status_type,
          prod_status_date: productTable.prod_status_date,
          holder_name: holderTable.holder_name,
          holderApprovedCount: sql<number>`COALESCE(${approvedCounts.approved_count}, 0)`,
        })
        .from(productTable)
        .leftJoin(holderTable, eq(productTable.holder_id, holderTable.holder_id))
        .leftJoin(approvedCounts, eq(productTable.holder_id, approvedCounts.holder_id))
        .where(whereExpr)
        .orderBy(desc(sql`COALESCE(${approvedCounts.approved_count}, 0)`), desc(productTable.prod_status_date))
        .limit(take);

      return rows.map((r) => ({
        prod_notif_no: r.prod_notif_no,
        prod_name: r.prod_name,
        prod_brand: r.prod_brand,
        prod_category: r.prod_category,
        prod_status_type: r.prod_status_type as 'A' | 'C',
        prod_status_date: r.prod_status_date,
        holder_name: r.holder_name || 'Unknown Holder',
        holderApprovedCount: Number(r.holderApprovedCount ?? 0),
      }));
    };

    // Tier 1: Same category
    let results = await selectApproved(
      sql`${productTable.prod_status_type} = 'A' AND ${productTable.prod_category} = ${refCategory} AND ${productTable.prod_notif_no} <> ${referenceNotifNo}`,
      limit
    );
    if (results.length > 0) return results;

    // Tier 2: Same brand
    results = await selectApproved(
      sql`${productTable.prod_status_type} = 'A' AND ${productTable.prod_brand} = ${refBrand} AND ${productTable.prod_notif_no} <> ${referenceNotifNo}`,
      limit
    );
    if (results.length > 0) return results;

    // Tier 3: Fuzzy category token
    const token = refCategory?.split(/\s|\/|-/)?.filter((t) => t.length >= 3)?.[0] ?? '';
    if (token) {
      results = await selectApproved(
        sql`${productTable.prod_status_type} = 'A' AND ${productTable.prod_notif_no} <> ${referenceNotifNo} AND ${productTable.prod_category} ILIKE ${'%' + token + '%'}`,
        limit
      );
      if (results.length > 0) return results;
    }

    // Tier 4: Any approved (global trusted brands)
    results = await selectApproved(
      sql`${productTable.prod_status_type} = 'A' AND ${productTable.prod_notif_no} <> ${referenceNotifNo}`,
      limit
    );
    return results;
  } catch (error) {
    console.error('Error getting similar approved products:', error);
    throw new Error('Failed to get similar products');
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