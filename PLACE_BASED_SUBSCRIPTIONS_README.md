# Place-Based Subscriptions System

## 🎯 **Overview**

The subscription system has been completely redesigned to be **place-based** rather than schedule-based. Users now subscribe to **specific types of classes at specific locations**, rather than to individual class schedules.

## 🔄 **Key Changes from Old System**

### **Before (Schedule-Based)**
- ❌ Subscriptions tied to specific class schedules
- ❌ Fixed days and times
- ❌ Complex session management
- ❌ Difficult to manage recurring classes

### **After (Place-Based)**
- ✅ Subscriptions tied to **location + class type**
- ✅ Flexible attendance (any available class of that type at that location)
- ✅ Simple class counting system
- ✅ Easy to manage and understand

## 🏗️ **System Architecture**

### **Core Concept**
Users subscribe to a **class type** (e.g., "pilates", "yoga", "fitness") at a **specific location** (e.g., "Studio A", "Gym B") for a **time period** (monthly, quarterly, yearly).

### **Subscription Structure**
```typescript
interface PlaceBasedSubscriptionType {
  id: number;
  user_id: string;
  place_id: number;           // Location ID
  class_type: string;         // e.g., "pilates", "yoga"
  subscription_type: "monthly" | "quarterly" | "yearly";
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: "active" | "paused" | "cancelled" | "expired";
  max_classes_per_period?: number;  // e.g., 8 classes per month
  classes_used: number;             // How many classes used
  notes?: string;
}
```

## 📊 **How It Works**

### **1. Subscription Creation**
- User selects a **location** (e.g., "Studio Pilates")
- User selects a **class type** (e.g., "pilates")
- User chooses **subscription period** (monthly/quarterly/yearly)
- User sets **class limit** (optional - can be unlimited)
- System creates subscription with start/end dates

### **2. Class Attendance**
- User can attend **any pilates class** at **Studio Pilates**
- System tracks classes used vs. limit
- Classes reset at the beginning of each period

### **3. Subscription Management**
- Users can pause/resume/cancel subscriptions
- Auto-renewal available
- Flexible class limits (or unlimited)

## 🗄️ **Database Schema**

### **Main Table: `place_based_subscriptions`**
```sql
CREATE TABLE place_based_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  place_id BIGINT NOT NULL REFERENCES places(id),
  class_type TEXT NOT NULL,
  subscription_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  price DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'PLN',
  max_classes_per_period INTEGER,
  classes_used INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Key Features**
- **Unique constraint**: One active subscription per user/place/class type
- **Automatic expiration**: Subscriptions expire automatically
- **Class counting**: Tracks used vs. available classes
- **Period reset**: Classes reset automatically at period boundaries

## 🚀 **New Features**

### **1. Flexible Class Attendance**
- Attend any class of the subscribed type at the subscribed location
- No need to register for specific schedules
- Spontaneous attendance possible

### **2. Smart Class Limits**
- Set maximum classes per period (e.g., 8 per month)
- Unlimited subscriptions available
- Automatic class counting and reset

### **3. Location-Based Management**
- Manage subscriptions by location
- Easy to see all classes available at a location
- Location-specific pricing possible

### **4. Enhanced User Experience**
- Clear subscription overview
- Easy subscription creation
- Simple status management

## 🔧 **Technical Implementation**

### **New Actions Created**
```typescript
// Core subscription management
createPlaceBasedSubscription(userId, placeId, classType, subscriptionType, autoRenew, maxClasses, notes)
getUserPlaceBasedSubscription(userId)
pausePlaceBasedSubscription(subscriptionId)
resumePlaceBasedSubscription(subscriptionId)
cancelPlaceBasedSubscription(subscriptionId)

// Utility functions
getAvailableClassTypes()
getPlaceBasedSubscriptionStats(userId)
```

### **Database Functions**
```sql
-- Check if user can attend a class
can_user_attend_class(user_uuid, place_id, class_type)

-- Get subscription statistics
get_place_based_subscription_stats(user_uuid)

-- Increment classes used
increment_subscription_classes_used(subscription_id)

-- Auto-expire subscriptions
expire_place_based_subscriptions()

-- Reset class counts for new periods
reset_monthly_subscription_classes()
reset_quarterly_subscription_classes()
reset_yearly_subscription_classes()
```

## 📱 **User Interface**

### **Dashboard Overview**
- **Active subscriptions** count
- **Classes remaining** across all subscriptions
- **Next renewal** information
- Quick access to subscription management

### **Subscription Management**
- **Create new subscriptions** with location and class type selection
- **View all subscriptions** with detailed information
- **Pause/Resume/Cancel** subscriptions
- **Track class usage** and limits

### **Settings Panel**
- Quick access to subscription management
- Subscription overview and statistics
- Easy navigation to subscription features

## 🎨 **User Experience Benefits**

### **For Users**
- **Simpler understanding**: Subscribe to a type of class at a location
- **More flexibility**: Attend any available class of that type
- **Better value**: Get more use out of subscriptions
- **Easier management**: Clear overview and simple controls

### **For Administrators**
- **Better capacity planning**: Know how many users can attend each location
- **Simpler scheduling**: Focus on class availability, not individual registrations
- **Easier reporting**: Clear subscription metrics by location and type
- **Better user engagement**: Users can attend spontaneously

## 🔮 **Future Enhancements**

### **Phase 1: Core System** ✅
- Place-based subscription creation
- Basic subscription management
- Class counting and limits

### **Phase 2: Advanced Features**
- **Pricing tiers**: Different prices for different locations/class types
- **Package deals**: Discounts for multiple subscriptions
- **Class reservations**: Optional advance booking system
- **Waitlist management**: Handle oversubscribed classes

### **Phase 3: Analytics & Optimization**
- **Usage analytics**: Track popular locations and class types
- **Capacity optimization**: Adjust class schedules based on subscription data
- **Revenue optimization**: Pricing strategies based on demand
- **User behavior insights**: Understand attendance patterns

## 📋 **Setup Instructions**

### **1. Database Setup**
Run the SQL script `database-place-based-subscriptions.sql` in your Supabase SQL editor:
```sql
-- Execute the entire script to create:
-- - place_based_subscriptions table
-- - Indexes and constraints
-- - RLS policies
-- - Helper functions
-- - Views and triggers
```

### **2. Application Updates** ✅
- New types defined in `app/types/types.ts`
- New actions created in `app/actions.ts`
- Updated dashboard components
- New subscription management interface

### **3. Testing**
- Create test subscriptions
- Verify class counting works
- Test subscription lifecycle (create, pause, resume, cancel)
- Verify RLS policies work correctly

## 🧪 **Testing the System**

### **Test Scenarios**
1. **Create Subscription**: Subscribe to "pilates" at "Studio A"
2. **Attend Classes**: Verify class counting works
3. **Pause/Resume**: Test subscription status changes
4. **Class Limits**: Test with limited vs. unlimited subscriptions
5. **Period Reset**: Verify classes reset at period boundaries

### **Test Data**
```sql
-- Insert test subscription
INSERT INTO place_based_subscriptions (
  user_id, place_id, class_type, subscription_type, 
  start_date, end_date, auto_renew, max_classes_per_period
) VALUES (
  'your-user-id', 1, 'pilates', 'monthly',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month' - INTERVAL '1 day',
  true, 8
);
```

## 🔒 **Security & Permissions**

### **Row Level Security (RLS)**
- Users can only see their own subscriptions
- Users can only manage their own subscriptions
- Admins have full access to all subscriptions
- Proper authentication required for all operations

### **Data Validation**
- Subscription type validation (monthly/quarterly/yearly)
- Status validation (active/paused/cancelled/expired)
- Date validation (start_date < end_date)
- Class limit validation (classes_used <= max_classes_per_period)

## 📊 **Monitoring & Maintenance**

### **Automated Tasks**
- **Daily**: Expire expired subscriptions
- **Monthly**: Reset monthly subscription class counts
- **Quarterly**: Reset quarterly subscription class counts
- **Yearly**: Reset yearly subscription class counts

### **Manual Maintenance**
- Monitor subscription statistics
- Review expired subscriptions
- Analyze usage patterns
- Optimize class schedules

## 🎉 **Summary**

The new **Place-Based Subscriptions System** provides:

✅ **Better User Experience**: Simpler, more flexible subscription model
✅ **Improved Management**: Easier to manage and understand
✅ **Scalable Architecture**: Better foundation for future features
✅ **Location Focus**: Aligns with how users think about fitness
✅ **Flexible Attendance**: Users can attend classes spontaneously
✅ **Clear Value Proposition**: Easy to understand what you're paying for

This system transforms the subscription model from rigid schedule-based access to flexible, location-based fitness memberships that better serve both users and administrators.
