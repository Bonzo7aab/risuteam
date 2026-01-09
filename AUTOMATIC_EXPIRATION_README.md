# Automatic Subscription Expiration System

## 🎯 Overview

This system automatically updates subscription statuses to "expired" when their end date has passed. It provides multiple layers of automation to ensure subscriptions are properly expired without manual intervention.

## 🏗️ System Architecture

### 1. **Application-Level Automation**
- **Function**: `expirePlaceBasedSubscriptions()` in `app/actions.ts`
- **Trigger**: Called when users access their registrations panel
- **Performance**: Batch updates for efficiency

### 2. **Database-Level Automation**
- **Functions**: `expire_place_based_subscriptions()`, `check_and_expire_subscriptions()`
- **Triggers**: Automatic expiration on table access and data changes
- **Views**: Real-time status checking with `current_subscription_status`

### 3. **API-Level Automation**
- **Endpoint**: `/api/expire-subscriptions`
- **Purpose**: Scheduled task execution and manual testing
- **Security**: Optional token-based authentication

## 🚀 Setup Instructions

### Step 1: Database Setup

Run the database script to set up automatic expiration:

```sql
-- Execute the automatic expiration setup
\i automatic-subscription-expiration.sql
```

This will create:
- Enhanced expiration functions
- Automatic triggers
- Performance indexes
- Status checking views

### Step 2: Environment Variables

Add the following to your `.env.local` file:

```env
# Optional: Secret token for cron job authentication
CRON_SECRET_TOKEN=your-secret-token-here
```

### Step 3: Scheduled Task Setup

#### Option A: Using Vercel Cron Jobs (Recommended for Vercel deployments)

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/expire-subscriptions",
      "schedule": "0 1 * * *"
    }
  ]
}
```

#### Option B: Using External Cron Service

Set up a cron job to call your API endpoint daily:

```bash
# Daily at 1 AM
0 1 * * * curl -X POST https://your-domain.com/api/expire-subscriptions
```

#### Option C: Using pg_cron (If available in your database)

```sql
-- Schedule daily expiration check at 1 AM
SELECT cron.schedule('daily-expire-subscriptions', '0 1 * * *', 'SELECT check_and_expire_subscriptions();');
```

## 🔧 How It Works

### Automatic Expiration Triggers

1. **User Access**: When users view their registrations, expired subscriptions are automatically updated
2. **Data Changes**: When subscriptions are inserted/updated, they're checked for expiration
3. **Scheduled Tasks**: Daily cron jobs ensure no subscriptions are missed
4. **Database Triggers**: Real-time expiration checking on table access

### Expiration Logic

```typescript
// A subscription is considered expired if:
const isExpired = subscription.end_date < currentDate && subscription.status === 'active';

// The system will:
// 1. Find all active subscriptions with end_date < today
// 2. Update their status to 'expired'
// 3. Update the updated_at timestamp
// 4. Log the changes
```

## 🧪 Testing

### Manual Testing

1. **API Endpoint Test**:
   ```bash
   curl -X GET https://your-domain.com/api/expire-subscriptions
   ```

2. **Database Function Test**:
   ```sql
   SELECT manual_expire_subscriptions();
   ```

3. **Component Test**: Access the registrations panel to trigger automatic expiration

### Test Data Setup

Create test subscriptions with past end dates:

```sql
-- Create a test subscription that should be expired
INSERT INTO place_based_subscriptions (
  user_id, place_id, class_type, subscription_type, 
  start_date, end_date, status
) VALUES (
  'your-user-id', 1, 'pilates', 'monthly',
  '2024-01-01', '2024-01-31', 'active'
);
```

## 📊 Monitoring

### Logs and Monitoring

The system provides comprehensive logging:

```typescript
// Application logs
console.log(`Successfully expired ${expiredCount} subscriptions:`, expiredIds);

// Database logs
RAISE NOTICE 'Expired % subscriptions: %', count_result, expired_ids_array;
```

### Status Checking

Use the database view for real-time status:

```sql
-- Check current subscription statuses
SELECT * FROM current_subscription_status WHERE user_id = 'your-user-id';

-- Check for subscriptions expiring soon
SELECT * FROM current_subscription_status WHERE expires_soon = true;
```

## 🔒 Security Considerations

### API Security

- **Token Authentication**: Use `CRON_SECRET_TOKEN` for secure API calls
- **Rate Limiting**: Consider implementing rate limiting for the API endpoint
- **IP Whitelisting**: Restrict API access to known IP addresses if needed

### Database Security

- **RLS Policies**: Ensure Row Level Security is properly configured
- **Function Permissions**: Only grant necessary permissions to functions
- **Audit Logging**: Consider adding audit logs for subscription changes

## 🚨 Troubleshooting

### Common Issues

1. **Subscriptions Not Expiring**:
   - Check if the cron job is running
   - Verify database triggers are active
   - Check application logs for errors

2. **Performance Issues**:
   - Ensure indexes are created (`idx_place_based_subscriptions_expiration_check`)
   - Monitor database query performance
   - Consider batch size optimization

3. **API Authentication Errors**:
   - Verify `CRON_SECRET_TOKEN` is set correctly
   - Check request headers format
   - Ensure token is passed in Authorization header

### Debug Commands

```sql
-- Check if triggers are active
SELECT * FROM pg_trigger WHERE tgname LIKE '%expire%';

-- Check function definitions
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%expire%';

-- Check recent subscription changes
SELECT * FROM place_based_subscriptions 
WHERE updated_at > NOW() - INTERVAL '1 day' 
ORDER BY updated_at DESC;
```

## 📈 Performance Optimization

### Database Optimization

- **Indexes**: Created for efficient expiration queries
- **Batch Updates**: Single query for multiple subscriptions
- **Trigger Efficiency**: Minimal performance impact on normal operations

### Application Optimization

- **Lazy Loading**: Expiration check only when needed
- **Error Handling**: Graceful degradation if expiration fails
- **Caching**: Consider caching subscription statuses

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Logs**: Check for expiration errors weekly
2. **Performance Review**: Monitor query performance monthly
3. **Data Cleanup**: Consider archiving old expired subscriptions
4. **Security Updates**: Review and update authentication tokens

### Backup Considerations

- **Function Backups**: Export function definitions
- **Trigger Backups**: Document trigger configurations
- **Data Backups**: Regular subscription data backups

## 📝 API Reference

### POST /api/expire-subscriptions

Expires all subscriptions that have passed their end date.

**Headers**:
```
Authorization: Bearer <CRON_SECRET_TOKEN>
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully expired 5 subscriptions",
  "expiredCount": 5,
  "expiredIds": [1, 2, 3, 4, 5],
  "timestamp": "2024-01-15T01:00:00.000Z"
}
```

### GET /api/expire-subscriptions

Same as POST but without authentication requirement (for testing).

## 🎉 Benefits

- **Automatic**: No manual intervention required
- **Reliable**: Multiple layers of automation ensure nothing is missed
- **Efficient**: Batch processing and optimized queries
- **Scalable**: Handles large numbers of subscriptions
- **Monitored**: Comprehensive logging and status checking
- **Secure**: Optional authentication and proper permissions
