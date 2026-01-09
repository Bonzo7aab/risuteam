# Auto-Renewal System for Place-Based Subscriptions

## Overview

The auto-renewal system automatically extends subscriptions when they expire, ensuring continuous access to classes for users who have enabled this feature.

## Features

### 1. Auto-Renewal Toggle
- **Switch component** in subscription creation form
- **Interactive toggle** in existing subscription cards
- **Visual indicators** showing auto-renewal status
- **Real-time updates** when toggling settings

### 2. Automatic Processing
- **Expired subscription detection** based on end_date
- **Smart renewal logic** based on subscription type
- **Class usage reset** for new periods
- **Database updates** with new start/end dates

### 3. Subscription Type Handling
- **Monthly**: 1 month extension
- **Quarterly**: 3 month extension  
- **Yearly**: 12 month extension
- **Consistent logic** across all types

## Database Structure

### Required Columns
```sql
ALTER TABLE place_based_subscriptions 
ADD COLUMN auto_renew BOOLEAN NOT NULL DEFAULT false;
```

### Indexes
```sql
CREATE INDEX idx_place_based_subscriptions_auto_renew 
ON place_based_subscriptions(auto_renew, status, end_date);
```

### Functions
- `get_expired_auto_renew_subscriptions()` - Returns expired subscriptions
- `processAutoRenewals()` - Processes auto-renewals
- `toggleAutoRenewal()` - Toggles auto-renewal setting

## API Functions

### Frontend Actions
```typescript
// Toggle auto-renewal for a subscription
toggleAutoRenewal(subscriptionId: number, autoRenew: boolean)

// Process auto-renewals (admin/testing)
triggerAutoRenewalProcessing()

// Get expired auto-renewal subscriptions
getExpiredAutoRenewSubscriptions()
```

### Backend Processing
```typescript
// Main auto-renewal processing function
processAutoRenewals(): Promise<{ error: string | null; renewedCount: number }>
```

## User Experience

### 1. Subscription Creation
- **Switch toggle** for auto-renewal preference
- **Clear explanation** of what auto-renewal means
- **Default setting** is OFF (false)

### 2. Subscription Management
- **Interactive toggle** in subscription cards
- **Visual badge** showing auto-renewal status
- **Real-time feedback** when changing settings
- **Success/error notifications** for all actions

### 3. Visual Indicators
- **Green badge** with "Auto-odnawianie" text
- **RefreshCw icon** for visual clarity
- **Status updates** in real-time

## Auto-Renewal Process

### 1. Detection
- System checks for expired subscriptions
- Only processes `active` status subscriptions
- Only processes subscriptions with `auto_renew = true`
- Uses `end_date < CURRENT_DATE` for expiration check

### 2. Renewal Logic
- **Start date**: Current date
- **End date**: Based on subscription type
- **Classes used**: Reset to 0
- **Status**: Remains 'active'
- **Updated timestamp**: Current timestamp

### 3. Database Updates
```sql
UPDATE place_based_subscriptions 
SET 
  start_date = CURRENT_DATE,
  end_date = calculated_end_date,
  classes_used = 0,
  updated_at = CURRENT_TIMESTAMP
WHERE id = subscription_id;
```

## Setup Instructions

### 1. Database Setup
```bash
# Run the auto-renewal setup script
psql -d your_database -f auto-renewal-setup.sql
```

### 2. Verify Setup
- Check if `auto_renew` column exists
- Verify indexes are created
- Test function permissions
- Confirm view access

### 3. Testing
```typescript
// Test auto-renewal toggle
await toggleAutoRenewal(subscriptionId, true);

// Test auto-renewal processing
await triggerAutoRenewalProcessing();

// Check expired subscriptions
await getExpiredAutoRenewSubscriptions();
```

## Monitoring

### 1. Database Views
```sql
-- Monitor auto-renewal subscriptions
SELECT * FROM auto_renewal_subscriptions_view;

-- Check renewal status
SELECT renewal_status, COUNT(*) 
FROM auto_renewal_subscriptions_view 
GROUP BY renewal_status;
```

### 2. Logs
- Function execution logs
- Error handling logs
- Renewal count tracking
- Performance metrics

## Security Considerations

### 1. Permissions
- **Authenticated users** can toggle their own subscriptions
- **Admin functions** require proper authentication
- **Database functions** use SECURITY DEFINER

### 2. Data Validation
- **Subscription ownership** verification
- **Status validation** before processing
- **Date validation** for renewal calculations

## Future Enhancements

### 1. Scheduled Processing
- **Cron jobs** for automatic processing
- **Batch processing** for large numbers
- **Email notifications** for renewals

### 2. Advanced Features
- **Renewal limits** (max renewals)
- **Custom renewal periods**
- **Renewal history tracking**
- **Payment integration**

### 3. Analytics
- **Renewal rate tracking**
- **User behavior analysis**
- **Subscription lifecycle metrics**

## Troubleshooting

### Common Issues
1. **Auto-renewal not working**: Check database permissions
2. **Toggle not updating**: Verify function calls
3. **Renewal processing fails**: Check subscription status
4. **Performance issues**: Verify indexes exist

### Debug Steps
1. Check database logs
2. Verify function permissions
3. Test individual functions
4. Monitor query performance

## Support

For issues or questions about the auto-renewal system:
1. Check this documentation
2. Review database logs
3. Test with sample data
4. Contact development team
