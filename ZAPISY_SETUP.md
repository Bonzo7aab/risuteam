# Zapisy System Setup Guide

This guide explains how to set up the new class registration system for the Risu Team application.

## Overview

The Zapisy system allows logged-in users to:
- Browse available classes with filters
- Register for classes with capacity limits
- View and manage their registrations
- Cancel registrations (with deadline enforcement)

## Database Setup

### 1. Run Database Schema Updates

Execute the SQL commands in `database-schema-updates.sql` in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema-updates.sql`
4. Execute the script

This will:
- Add new columns to the `schedule` table
- Create the `class_registrations` table
- Set up indexes for performance
- Configure Row Level Security (RLS)
- Create triggers for automatic updates

### 2. Verify Database Changes

After running the script, verify that:
- The `schedule` table has new columns: `max_capacity`, `current_registrations`, `is_active`, `registration_deadline`
- The `class_registrations` table exists with proper structure
- RLS policies are in place
- Indexes are created

## Application Features

### 1. Authentication Protection

The `/zapisy` route is now protected and requires user authentication. Users will be redirected to `/sign-in` if not logged in.

### 2. Class Registration Flow

1. **Browse Classes**: Users can view all available classes with filters
2. **Filter Options**: Filter by day, activity type, trainer, or location
3. **Registration**: Click "Zapisz się" to register for a class
4. **Confirmation**: Modal shows class details and allows adding notes
5. **Management**: View and cancel registrations in "Moje zapisy" section

### 3. Admin Features

Admins can manage class capacity and availability through the existing admin panel:
- Set `max_capacity` for each class
- Toggle `is_active` to enable/disable classes
- Set `registration_deadline` for registration cutoff
- Monitor `current_registrations` count

## Components Structure

```
app/zapisy/
├── page.tsx                    # Main page with authentication check
├── zapisy-client.tsx          # Client component with main logic
└── components/
    ├── class-filters.tsx      # Filter sidebar component
    ├── registration-modal.tsx # Registration confirmation modal
    └── user-registrations.tsx # User's current registrations
```

## Server Actions

New server actions added to `app/actions.ts`:
- `registerForClass()` - Register user for a class
- `cancelRegistration()` - Cancel a registration
- `getUserRegistrations()` - Get user's registrations
- `getAvailableClasses()` - Get all available classes
- `checkClassAvailability()` - Check class capacity

## Type Definitions

Updated `app/types/types.ts` with:
- Enhanced `ScheduleType` interface
- New `ClassRegistrationType` interface

## Security Features

1. **Row Level Security (RLS)**: Users can only access their own registrations
2. **Authentication Required**: All registration operations require login
3. **Capacity Limits**: Prevents overbooking of classes
4. **Deadline Enforcement**: Respects registration deadlines
5. **Duplicate Prevention**: Users cannot register for the same class twice

## Usage Instructions

### For Users

1. **Access**: Navigate to `/zapisy` (requires login)
2. **Browse**: Use filters to find desired classes
3. **Register**: Click "Zapisz się" and confirm details
4. **Manage**: View registrations in "Moje zapisy" section
5. **Cancel**: Cancel registrations before deadline

### For Admins

1. **Manage Classes**: Use existing admin panel to set class parameters
2. **Monitor**: Check registration counts in schedule management
3. **Capacity**: Adjust `max_capacity` as needed
4. **Availability**: Toggle `is_active` to control class availability

## Testing

### Test Scenarios

1. **Registration Flow**:
   - Register for a class
   - Verify capacity decreases
   - Check user registration appears

2. **Cancellation Flow**:
   - Cancel a registration
   - Verify capacity increases
   - Check registration status updates

3. **Capacity Limits**:
   - Fill a class to capacity
   - Verify "Brak miejsc" appears
   - Test registration rejection

4. **Authentication**:
   - Try accessing `/zapisy` without login
   - Verify redirect to sign-in page

5. **Filters**:
   - Test all filter combinations
   - Verify results update correctly

## Troubleshooting

### Common Issues

1. **Database Errors**: Ensure all SQL commands executed successfully
2. **Authentication Issues**: Check RLS policies are properly configured
3. **Capacity Not Updating**: Verify triggers are working correctly
4. **Component Errors**: Check all UI components are properly imported

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify Supabase connection and environment variables
3. Test database queries directly in Supabase SQL editor
4. Check RLS policies are not blocking legitimate requests

## Future Enhancements

Potential improvements for the system:
- Email notifications for registrations/cancellations
- Waitlist functionality for full classes
- Recurring registration options
- Calendar integration
- Payment integration for paid classes
- Attendance tracking
- Class reminders

## Support

For issues or questions about the Zapisy system:
1. Check this setup guide
2. Review the database schema
3. Test with the provided scenarios
4. Check Supabase logs for errors
