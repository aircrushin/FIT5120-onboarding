'use server'

import { db } from '../index';
import { holderTable } from '../schema';
import { eq } from 'drizzle-orm';

// Get holder by ID
async function getHolderById(holderId: number) {
  try {
    const holder = await db
      .select()
      .from(holderTable)
      .where(eq(holderTable.holder_id, holderId))
      .limit(1);
    
    if (holder.length === 0) {
      console.log(`No holder found with ID: ${holderId}`);
      return null;
    }
    
    return holder[0];
  } catch (error) {
    console.error('Error getting holder by ID:', error);
    return null;
  }
}

// Get holder by exact name match
async function getHolderByName(holderName: string) {
  try {
    const { db } = await import('../index');
    const { holderTable } = await import('../schema');
    const { eq } = await import('drizzle-orm');
    
    const holder = await db
      .select()
      .from(holderTable)
      .where(eq(holderTable.holder_name, holderName))
      .limit(1);
    
    if (holder.length === 0) {
      console.log(`No holder found with name: ${holderName}`);
      return null;
    }
    
    return holder[0];
  } catch (error) {
    console.error('Error getting holder by name:', error);
    return null;
  }
}

// Get holders by partial name match (case-insensitive)
async function getHoldersByNamePattern(namePattern: string) {
  try {
    const { db } = await import('../index');
    const { holderTable } = await import('../schema');
    const { ilike } = await import('drizzle-orm');
    
    const holders = await db
      .select()
      .from(holderTable)
      .where(ilike(holderTable.holder_name, `%${namePattern}%`))
      .orderBy(holderTable.holder_name);
    
    if (holders.length === 0) {
      console.log(`No holders found matching pattern: ${namePattern}`);
      return [];
    }
    
    return holders;
  } catch (error) {
    console.error('Error getting holders by name pattern:', error);
    return [];
  }
}

// Get all holders with pagination
async function getAllHolders(page: number = 1, pageSize: number = 50) {
  try {
    const { db } = await import('../index');
    const { holderTable } = await import('../schema');
    const { sql } = await import('drizzle-orm');
    
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(holderTable);
    
    // Get paginated results
    const holders = await db
      .select()
      .from(holderTable)
      .orderBy(holderTable.holder_name)
      .limit(pageSize)
      .offset(offset);
    
    return {
      holders,
      pagination: {
        page,
        pageSize,
        total: Number(totalCount[0].count),
        totalPages: Math.ceil(Number(totalCount[0].count) / pageSize)
      }
    };
  } catch (error) {
    console.error('Error getting all holders:', error);
    return { holders: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } };
  }
}

// Export all functions
export {
  getHolderById,
  getHolderByName,
  getHoldersByNamePattern,
  getAllHolders
};