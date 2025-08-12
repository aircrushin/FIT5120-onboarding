"use server";

import { db } from "../../db";
import { ingredientTable, productTable, prodIngredientTable } from "../../db/schema";
import { eq, like, and, sql, desc } from "drizzle-orm";

export interface IngredientSearchResult {
  ing_id: number;
  ing_name: string;
  ing_risk_summary: string;
  ing_risk_type: 'B' | 'H' | 'L' | 'N';
}

export interface BannedTrendData {
  year: number;
  banned_count: number;
}

export interface IngredientTrends {
  ingredient_name: string;
  total_banned_count: number;
  yearly_trends: BannedTrendData[];
}

export async function searchIngredientAction(ingredientName: string): Promise<IngredientSearchResult | null> {
  try {
    const results = await db
      .select({
        ing_id: ingredientTable.ing_id,
        ing_name: ingredientTable.ing_name,
        ing_risk_summary: ingredientTable.ing_risk_summary,
        ing_risk_type: ingredientTable.ing_risk_type
      })
      .from(ingredientTable)
      .where(like(sql`lower(${ingredientTable.ing_name})`, `%${ingredientName}%`))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return results[0] as IngredientSearchResult;
  } catch (error) {
    console.error("Error searching ingredient:", error);
    throw new Error("Failed to search ingredient");
  }
}

export async function getIngredientBannedTrendsAction(ingredientName: string): Promise<IngredientTrends | null> {
  try {
    // Get the ingredient to ensure it exists
    const ingredient = await db
      .select()
      .from(ingredientTable)
      .where(like(ingredientTable.ing_name, `%${ingredientName}%`))
      .limit(1);

    if (ingredient.length === 0) {
      return null;
    }

    // For banned ingredients, get yearly trends of cancelled products containing this ingredient
    // For non-banned ingredients, we'll still show if they appear in cancelled products
    const yearlyTrends = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${productTable.prod_status_date})::integer`,
        banned_count: sql<number>`COUNT(*)::integer`
      })
      .from(productTable)
      .innerJoin(prodIngredientTable, eq(productTable.prod_notif_no, prodIngredientTable.prod_notif_no))
      .innerJoin(ingredientTable, eq(prodIngredientTable.ing_id, ingredientTable.ing_id))
      .where(and(
        eq(productTable.prod_status_type, 'C'), // Cancelled products
        eq(ingredientTable.ing_id, ingredient[0].ing_id)
      ))
      .groupBy(sql`EXTRACT(YEAR FROM ${productTable.prod_status_date})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${productTable.prod_status_date})`);

    // Calculate total banned count
    const totalBannedCount = yearlyTrends.reduce((sum, trend) => sum + trend.banned_count, 0);

    // Fill in missing years with 0 count if needed
    const allYears: BannedTrendData[] = [];
    if (yearlyTrends.length > 0) {
      const minYear = Math.min(...yearlyTrends.map(t => t.year));
      const maxYear = Math.max(...yearlyTrends.map(t => t.year));
      
      for (let year = minYear; year <= maxYear; year++) {
        const existingData = yearlyTrends.find(t => t.year === year);
        allYears.push({
          year,
          banned_count: existingData ? existingData.banned_count : 0
        });
      }
    }

    return {
      ingredient_name: ingredient[0].ing_name,
      total_banned_count: totalBannedCount,
      yearly_trends: allYears
    };
  } catch (error) {
    console.error("Error getting ingredient trends:", error);
    throw new Error("Failed to get ingredient trends");
  }
} 