import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/utils/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { action, userId, data } = await request.json();

    switch (action) {
      case 'subscription_ending':
        await NotificationService.sendSubscriptionEndingNotification(userId, data);
        break;
      
      case 'new_camp':
        await NotificationService.sendNewCampNotification(userId, data);
        break;
      
      case 'subscription_expired':
        await NotificationService.sendSubscriptionExpiredNotification(userId, data);
        break;
      
      case 'batch_subscriptions':
        await NotificationService.notifyUsersAboutEndingSubscriptions();
        break;
      
      case 'batch_camps':
        await NotificationService.notifyUsersAboutNewCamps();
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Notification sent for action: ${action}` 
    });

  } catch (error) {
    console.error('Error in test notifications:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test notifications endpoint. Use POST with action, userId, and data.',
    available_actions: [
      'subscription_ending',
      'new_camp', 
      'subscription_expired',
      'batch_subscriptions',
      'batch_camps'
    ]
  });
}
