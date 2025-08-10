import { getHolderById } from 'db/queries/getHolders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const holderId = parseInt(params.id, 10);
    
    if (isNaN(holderId)) {
      return NextResponse.json(
        { error: 'Invalid holder ID' },
        { status: 400 }
      );
    }

    const holder = await getHolderById(holderId);
    return NextResponse.json(holder);
  } catch (error) {
    console.error('Error fetching holder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}