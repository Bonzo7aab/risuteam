-- Cleanup Script for Place-Based Subscriptions System
-- Run this if you want to completely remove all subscription objects and start fresh

-- Drop all objects in the correct order (dependencies first)
DROP TRIGGER IF EXISTS trigger_update_place_based_subscriptions_updated_at ON place_based_subscriptions;
DROP FUNCTION IF EXISTS update_place_based_subscriptions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_place_based_subscription_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_subscription_classes_used(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS can_user_attend_class(UUID, BIGINT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS expire_place_based_subscriptions() CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_subscription_classes() CASCADE;
DROP FUNCTION IF EXISTS reset_quarterly_subscription_classes() CASCADE;
DROP FUNCTION IF EXISTS reset_yearly_subscription_classes() CASCADE;

-- Drop views
DROP VIEW IF EXISTS place_based_subscriptions_view CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_place_based_subscriptions_user_id;
DROP INDEX IF EXISTS idx_place_based_subscriptions_place_id;
DROP INDEX IF EXISTS idx_place_based_subscriptions_status;
DROP INDEX IF EXISTS idx_place_based_subscriptions_end_date;
DROP INDEX IF EXISTS idx_place_based_subscriptions_user_place_class;
DROP INDEX IF EXISTS idx_unique_active_subscription;

-- Finally drop the table
DROP TABLE IF EXISTS place_based_subscriptions CASCADE;

-- Verify cleanup
SELECT 'Cleanup completed. All subscription objects removed.' as status;
