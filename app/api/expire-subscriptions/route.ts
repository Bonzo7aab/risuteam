import { NextRequest, NextResponse } from 'next/server';
import { expirePlaceBasedSubscriptions } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    // For example, check for a secret token in headers
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Execute the expiration process
    const result = await expirePlaceBasedSubscriptions();
    
    if (result.error) {
      console.error('Error expiring subscriptions:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          expiredCount: 0,
          expiredIds: []
        },
        { status: 500 }
      );
    }

    console.log(`Successfully expired ${result.expiredCount} subscriptions:`, result.expiredIds);
    
    return NextResponse.json({
      success: true,
      message: `Successfully expired ${result.expiredCount} subscriptions`,
      expiredCount: result.expiredCount,
      expiredIds: result.expiredIds,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error in expire-subscriptions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        expiredCount: 0,
        expiredIds: []
      },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  try {
    const result = await expirePlaceBasedSubscriptions();
    
    if (result.error) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          expiredCount: 0,
          expiredIds: []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Found and expired ${result.expiredCount} subscriptions`,
      expiredCount: result.expiredCount,
      expiredIds: result.expiredIds,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error in expire-subscriptions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        expiredCount: 0,
        expiredIds: []
      },
      { status: 500 }
    );
  }
}
