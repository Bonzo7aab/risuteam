-- Automatic Subscription Expiration System
-- This script creates database-level automation for expiring subscriptions

-- 1. Enhanced function to expire subscriptions with better logging
CREATE OR REPLACE FUNCTION expire_place_based_subscriptions()
RETURNS TABLE(
  expired_count BIGINT,
  expired_ids BIGINT[]
) AS $$
DECLARE
  expired_subscriptions RECORD;
  expired_ids_array BIGINT[] := '{}';
  count_result BIGINT := 0;
BEGIN
  -- Get all active subscriptions that have passed their end date
  FOR expired_subscriptions IN
    SELECT id 
    FROM place_based_subscriptions 
    WHERE status = 'active' 
      AND end_date < CURRENT_DATE
  LOOP
    expired_ids_array := array_append(expired_ids_array, expired_subscriptions.id);
    count_result := count_result + 1;
  END LOOP;

  -- Update all expired subscriptions in a single query
  IF count_result > 0 THEN
    UPDATE place_based_subscriptions 
    SET 
      status = 'expired', 
      updated_at = NOW()
    WHERE id = ANY(expired_ids_array);
    
    -- Log the expiration (you can create a logs table if needed)
    RAISE NOTICE 'Expired % subscriptions: %', count_result, expired_ids_array;
  END IF;

  RETURN QUERY SELECT count_result, expired_ids_array;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to check and expire subscriptions on demand
CREATE OR REPLACE FUNCTION check_and_expire_subscriptions()
RETURNS void AS $$
DECLARE
  result RECORD;
BEGIN
  SELECT * INTO result FROM expire_place_based_subscriptions();
  
  IF result.expired_count > 0 THEN
    RAISE NOTICE 'Automatically expired % subscriptions', result.expired_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger function that automatically expires subscriptions when accessed
CREATE OR REPLACE FUNCTION trigger_expire_subscriptions_on_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run expiration check occasionally to avoid performance issues
  -- This will run the expiration check 1% of the time when accessing the table
  IF random() < 0.01 THEN
    PERFORM check_and_expire_subscriptions();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on place_based_subscriptions table
DROP TRIGGER IF EXISTS trigger_auto_expire_subscriptions ON place_based_subscriptions;
CREATE TRIGGER trigger_auto_expire_subscriptions
  AFTER SELECT ON place_based_subscriptions
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_expire_subscriptions_on_access();

-- 5. Create a more efficient trigger that runs on INSERT/UPDATE
CREATE OR REPLACE FUNCTION trigger_check_expiration_on_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the subscription being inserted/updated is expired
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status := 'expired';
    NEW.updated_at := NOW();
    RAISE NOTICE 'Subscription % automatically expired due to end_date', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for INSERT/UPDATE operations
DROP TRIGGER IF EXISTS trigger_check_expiration_on_insert_update ON place_based_subscriptions;
CREATE TRIGGER trigger_check_expiration_on_insert_update
  BEFORE INSERT OR UPDATE ON place_based_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_expiration_on_change();

-- 7. Create a view that automatically shows current subscription status
CREATE OR REPLACE VIEW current_subscription_status AS
SELECT 
  pbs.*,
  CASE 
    WHEN pbs.end_date < CURRENT_DATE AND pbs.status = 'active' THEN 'expired'
    ELSE pbs.status
  END as current_status,
  CASE 
    WHEN pbs.end_date < CURRENT_DATE THEN true
    ELSE false
  END as is_expired,
  CASE 
    WHEN pbs.end_date <= CURRENT_DATE + INTERVAL '7 days' AND pbs.status = 'active' THEN true
    ELSE false
  END as expires_soon
FROM place_based_subscriptions pbs;

-- 8. Grant permissions
GRANT SELECT ON current_subscription_status TO authenticated;
GRANT EXECUTE ON FUNCTION expire_place_based_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_expire_subscriptions() TO authenticated;

-- 9. Create a function to get subscription status with automatic expiration check
CREATE OR REPLACE FUNCTION get_user_subscriptions_with_auto_expiry(user_uuid UUID)
RETURNS TABLE(
  id BIGINT,
  user_id UUID,
  place_id BIGINT,
  class_type TEXT,
  subscription_type TEXT,
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN,
  status TEXT,
  current_status TEXT,
  is_expired BOOLEAN,
  expires_soon BOOLEAN,
  price DECIMAL(10,2),
  currency TEXT,
  max_classes_per_period INTEGER,
  classes_used INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- First, check and expire any subscriptions that need to be expired
  PERFORM check_and_expire_subscriptions();
  
  -- Then return the current subscription data
  RETURN QUERY
  SELECT 
    pbs.id,
    pbs.user_id,
    pbs.place_id,
    pbs.class_type,
    pbs.subscription_type,
    pbs.start_date,
    pbs.end_date,
    pbs.auto_renew,
    pbs.status,
    CASE 
      WHEN pbs.end_date < CURRENT_DATE AND pbs.status = 'active' THEN 'expired'
      ELSE pbs.status
    END as current_status,
    CASE 
      WHEN pbs.end_date < CURRENT_DATE THEN true
      ELSE false
    END as is_expired,
    CASE 
      WHEN pbs.end_date <= CURRENT_DATE + INTERVAL '7 days' AND pbs.status = 'active' THEN true
      ELSE false
    END as expires_soon,
    pbs.price,
    pbs.currency,
    pbs.max_classes_per_period,
    pbs.classes_used,
    pbs.notes,
    pbs.created_at,
    pbs.updated_at
  FROM place_based_subscriptions pbs
  WHERE pbs.user_id = user_uuid
  ORDER BY pbs.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION get_user_subscriptions_with_auto_expiry(UUID) TO authenticated;

-- 11. Create a scheduled function for daily expiration check (if pg_cron is available)
-- Uncomment the following lines if you have pg_cron extension installed:
-- SELECT cron.schedule('daily-expire-subscriptions', '0 1 * * *', 'SELECT check_and_expire_subscriptions();');

-- 12. Create a function to manually run expiration check (for testing)
CREATE OR REPLACE FUNCTION manual_expire_subscriptions()
RETURNS TEXT AS $$
DECLARE
  result RECORD;
BEGIN
  SELECT * INTO result FROM expire_place_based_subscriptions();
  RETURN format('Expired %s subscriptions: %s', result.expired_count, result.expired_ids);
END;
$$ LANGUAGE plpgsql;

-- 13. Grant execute permission
GRANT EXECUTE ON FUNCTION manual_expire_subscriptions() TO authenticated;

-- 14. Create an index to improve expiration query performance
CREATE INDEX IF NOT EXISTS idx_place_based_subscriptions_expiration_check 
ON place_based_subscriptions(status, end_date) 
WHERE status = 'active';

-- 15. Add a comment explaining the automatic expiration system
COMMENT ON FUNCTION expire_place_based_subscriptions() IS 'Automatically expires subscriptions that have passed their end date';
COMMENT ON FUNCTION check_and_expire_subscriptions() IS 'Checks and expires subscriptions, can be called manually or scheduled';
COMMENT ON TRIGGER trigger_auto_expire_subscriptions ON place_based_subscriptions IS 'Automatically checks for expired subscriptions when table is accessed';
COMMENT ON TRIGGER trigger_check_expiration_on_insert_update ON place_based_subscriptions IS 'Automatically expires subscriptions when they are inserted or updated with past end dates';
