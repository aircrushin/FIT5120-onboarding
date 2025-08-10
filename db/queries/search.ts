'use server'

import { db } from '../index';
import { productTable, holderTable, ingredientTable, prodIngredientTable } from '../schema';
import { eq, or, like, desc, sql } from 'drizzle-orm';

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
}

export async function searchProducts(query: string): Promise<ProductSearchResult[]> {
  try {
    // Search for products by name or notification number
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
        or(
          like(productTable.prod_name, `%${query}%`),
          like(productTable.prod_notif_no, `%${query}%`),
          like(productTable.prod_brand, `%${query}%`)
        )
      )
      .orderBy(desc(productTable.prod_status_date));

    // For each product, get its ingredients
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
    console.error('Error searching products:', error);
    return [];
  }
}

export async function getProductByNotificationNumber(notificationNumber: string): Promise<ProductSearchResult | null> {
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
      .where(eq(productTable.prod_notif_no, notificationNumber))
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
    return null;
  }
}

export async function getAllProducts(): Promise<ProductSearchResult[]> {
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
    return [];
  }
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

export async function getSimilarApprovedProducts(referenceNotifNo: string, limit: number = 6): Promise<SimilarProductResult[]> {
  try {
    // Find the reference product to get its category
    const ref = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_category: productTable.prod_category,
        prod_brand: productTable.prod_brand,
      })
      .from(productTable)
      .where(eq(productTable.prod_notif_no, referenceNotifNo))
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
    return [];
  }
}
// Lightweight type for featured products
export interface FeaturedProduct {
  prod_notif_no: string;
  prod_name: string;
  prod_status_type: 'A' | 'C';
}

export async function getRandomProducts(limit: number = 6): Promise<FeaturedProduct[]> {
  try {
    const products = await db
      .select({
        prod_notif_no: productTable.prod_notif_no,
        prod_name: productTable.prod_name,
        prod_status_type: productTable.prod_status_type,
      })
      .from(productTable)
      .orderBy(sql`random()`)
      .limit(limit);

    return products.map((p) => ({
      prod_notif_no: p.prod_notif_no,
      prod_name: p.prod_name,
      prod_status_type: p.prod_status_type as 'A' | 'C',
    }));
  } catch (error) {
    console.error('Error getting random products:', error);
    return [];
  }
}
