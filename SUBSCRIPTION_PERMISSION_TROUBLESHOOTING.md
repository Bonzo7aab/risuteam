# Subscription System Troubleshooting Guide

## ✅ **Resolved Issues**

### **Location Display Issue - RESOLVED**
- **Problem**: Location information wasn't showing in "Moje Subskrypcje Miejscowe"
- **Root Cause**: Supabase join syntax `places!place_id(id, name, address)` wasn't working properly
- **Solution**: Changed to explicit approach - fetch subscriptions and places separately, then combine in application
- **Status**: ✅ **RESOLVED**

## 🚨 **Common Errors & Solutions**

### **Error: "trigger already exists"**

This error occurs when trying to create a trigger that already exists, usually because the table was partially created before.

### **Error: "relation does not exist"**

This error occurs when the table wasn't created successfully, usually due to errors in the SQL script execution.

## 🔍 **Root Causes**

### **1. RLS Policy Issues**
- Complex RLS policies that reference `auth.users` table
- Policies that check user metadata or roles
- Policies that don't properly handle authentication context

### **2. Permission Grant Issues**
- Permissions not granted before enabling RLS
- Missing sequence permissions
- Function permissions not properly set

### **3. Authentication Context Issues**
- `auth.uid()` not returning expected values
- User session not properly established
- RLS policies checking wrong user context

### **4. Foreign Key Constraint Issues**
- **Incorrect table reference**: `users` instead of `auth.users`
- **Missing referenced table**: `places` table doesn't exist
- **Wrong column types**: UUID mismatch between tables

### **5. Object Conflict Issues**
- **Trigger already exists**: Table was partially created before
- **Function already exists**: Functions were created in previous attempts
- **View already exists**: Views from previous setup attempts
- **Index conflicts**: Duplicate index creation attempts

### **6. Table Creation Failures**
- **Script execution errors**: SQL errors prevented table creation
- **Missing dependencies**: Required tables don't exist
- **Permission issues**: Cannot create tables in the schema
- **Syntax errors**: Invalid SQL in the setup script

## 🛠️ **Solutions**

### **Solution 1: Use Simplified Database Setup**

**Recommended for initial setup and testing:**

1. **Use the simplified script**: `database-place-based-subscriptions-simple.sql`
2. **This script**:
   - Creates the table without complex RLS
   - Grants ALL permissions to authenticated users
   - Uses `SECURITY DEFINER` functions
   - Avoids complex user metadata checks
   - **Correctly references `auth.users` and `places`**
   - **Automatically cleans up existing objects** before creating new ones

### **Solution 2: Clean Start Approach**

If you're getting object conflicts:

1. **Run cleanup script first**: Execute `cleanup-subscription-system.sql`
2. **Then run setup script**: Execute `database-place-based-subscriptions-simple.sql`
3. **This ensures**: No conflicts with existing objects

### **Solution 3: Fix Foreign Key Constraints**

If you're getting foreign key errors:

1. **Check table references**:
```sql
-- The correct reference should be:
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
```

2. **Verify referenced tables exist**:
```sql
-- Check if places table exists
SELECT COUNT(*) FROM places;

-- Check if auth.users is accessible
SELECT COUNT(*) FROM auth.users LIMIT 1;
```

### **Solution 4: Fix the Original Script**

If you want to use the full-featured version:

1. **Run permissions BEFORE enabling RLS**:
```sql
-- Grant permissions FIRST
GRANT SELECT, INSERT, UPDATE, DELETE ON place_based_subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE place_based_subscriptions_id_seq TO authenticated;

-- THEN enable RLS
ALTER TABLE place_based_subscriptions ENABLE ROW LEVEL SECURITY;
```

2. **Simplify admin policies**:
```sql
-- Instead of complex user metadata checks, use:
CREATE POLICY "Admins can view all place-based subscriptions" ON place_based_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all place-based subscriptions" ON place_based_subscriptions
  FOR ALL USING (true);
```

### **Solution 5: Disable RLS Temporarily**

For testing purposes, you can temporarily disable RLS:

```sql
-- Disable RLS temporarily
ALTER TABLE place_based_subscriptions DISABLE ROW LEVEL SECURITY;

-- Test your application
-- Re-enable when ready
ALTER TABLE place_based_subscriptions ENABLE ROW LEVEL SECURITY;
```

## 📋 **Step-by-Step Fix**

### **Step 1: Clean Up Existing Objects (if needed)**
```sql
-- If you're getting object conflicts, run this first:
-- Execute cleanup-subscription-system.sql
-- This removes all existing subscription objects
```

### **Step 2: Choose Your Setup Approach**

#### **Option A: Simplified Setup (Recommended for working systems)**
```sql
-- Execute database-place-based-subscriptions-simple.sql
-- This creates everything at once with automatic cleanup
```

### **Step 3: Verify Table Creation**
```sql
-- Check if the table was created successfully
SELECT COUNT(*) FROM place_based_subscriptions;

-- If this fails, the table wasn't created - check for errors
```

### **Step 4: Test Basic Functionality**
```sql
-- Test if you can insert data
INSERT INTO place_based_subscriptions (
  user_id, place_id, class_type, subscription_type, 
  start_date, end_date, auto_renew, max_classes_per_period
) VALUES (
  'your-test-user-id', 1, 'pilates', 'monthly',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month' - INTERVAL '1 day',
  true, 8
);

-- Test if you can query data
SELECT * FROM place_based_subscriptions;
```

### **Step 5: Test Functions and Views**
```sql
-- Test the statistics function
SELECT * FROM get_place_based_subscription_stats('your-test-user-id');

-- Test the view
SELECT * FROM place_based_subscriptions_view LIMIT 5;
```

### **Step 6: Add RLS Later (Optional)**
Once the basic system is working, you can add RLS policies:

```sql
-- Enable RLS
ALTER TABLE place_based_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add basic user isolation
CREATE POLICY "Users can only see own subscriptions" ON place_based_subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

## 🎯 **Quick Fix Summary**

**For immediate resolution, use this approach:**

1. **Clean up existing objects** (if getting conflicts): Execute `cleanup-subscription-system.sql`
2. **Run setup script**: Execute `database-place-based-subscriptions-simple.sql`
3. **Verify table creation**: Check if `SELECT COUNT(*) FROM place_based_subscriptions;` works
4. **Test basic functionality**: Insert and query test data
5. **Verify in application**: Test the subscription features

This approach gives you a working system that you can secure later with proper RLS policies.

## 🔧 **Current Working Implementation**

The subscription system now uses an **explicit approach** that:

1. **Fetches subscriptions** from `place_based_subscriptions` table
2. **Fetches places** from `places` table separately  
3. **Combines data** in the application layer
4. **Displays location information** correctly in the UI

This approach is more reliable than complex database joins and provides better error handling.
