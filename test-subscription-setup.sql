-- Test Script for Place-Based Subscriptions
-- Run this after setting up the main table to verify everything works

-- Test 1: Check if table exists and has correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'place_based_subscriptions'
ORDER BY ordinal_position;

-- Test 2: Check foreign key constraints
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'place_based_subscriptions';

-- Test 3: Check if places table exists and has data
SELECT COUNT(*) as places_count FROM places;

-- Test 4: Check if auth.users table is accessible
SELECT COUNT(*) as users_count FROM auth.users LIMIT 1;

-- Test 5: Get a sample user ID for testing
SELECT id, email FROM auth.users LIMIT 1;

-- Test 6: Get a sample place ID for testing
SELECT id, name FROM places LIMIT 1;

-- Test 7: Try to insert a test subscription (uncomment and modify with real IDs)
-- INSERT INTO place_based_subscriptions (
--   user_id, place_id, class_type, subscription_type, 
--   start_date, end_date, auto_renew, max_classes_per_period
-- ) VALUES (
--   'REPLACE_WITH_REAL_USER_ID', 
--   REPLACE_WITH_REAL_PLACE_ID, 
--   'pilates', 'monthly',
--   CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month' - INTERVAL '1 day',
--   true, 8
-- );

-- Test 8: Check if the view works
SELECT * FROM place_based_subscriptions_view LIMIT 5;

-- Test 9: Test the statistics function (uncomment and modify with real user ID)
-- SELECT * FROM get_place_based_subscription_stats('REPLACE_WITH_REAL_USER_ID');

-- Test 10: Check permissions
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'place_based_subscriptions';
