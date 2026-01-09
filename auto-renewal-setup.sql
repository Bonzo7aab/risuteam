-- Auto-Renewal Setup for Place-Based Subscriptions
-- This script sets up the necessary database structure and functions for auto-renewal

-- Check if auto_renew column exists and has proper constraints
DO $$
BEGIN
    -- Add auto_renew column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'place_based_subscriptions' 
        AND column_name = 'auto_renew'
    ) THEN
        ALTER TABLE place_based_subscriptions 
        ADD COLUMN auto_renew BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Added auto_renew column to place_based_subscriptions table';
    ELSE
        RAISE NOTICE 'auto_renew column already exists';
    END IF;
    
    -- Ensure auto_renew has proper default value
    ALTER TABLE place_based_subscriptions 
    ALTER COLUMN auto_renew SET DEFAULT false;
    
    -- Update existing subscriptions to have auto_renew = false if NULL
    UPDATE place_based_subscriptions 
    SET auto_renew = false 
    WHERE auto_renew IS NULL;
    
    RAISE NOTICE 'Updated existing subscriptions with default auto_renew value';
END $$;

-- Create index for efficient auto-renewal queries
CREATE INDEX IF NOT EXISTS idx_place_based_subscriptions_auto_renew 
ON place_based_subscriptions(auto_renew, status, end_date);

-- Create function to check for expired subscriptions
CREATE OR REPLACE FUNCTION get_expired_auto_renew_subscriptions()
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
  max_classes_per_period INTEGER,
  classes_used INTEGER
) AS $$
BEGIN
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
    pbs.max_classes_per_period,
    pbs.classes_used
  FROM place_based_subscriptions pbs
  WHERE pbs.status = 'active'
    AND pbs.auto_renew = true
    AND pbs.end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_expired_auto_renew_subscriptions() TO authenticated;

-- Create a view for monitoring auto-renewal subscriptions
CREATE OR REPLACE VIEW auto_renewal_subscriptions_view AS
SELECT 
  id,
  user_id,
  place_id,
  class_type,
  subscription_type,
  start_date,
  end_date,
  auto_renew,
  status,
  CASE 
    WHEN end_date < CURRENT_DATE THEN 'EXPIRED'
    WHEN end_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'EXPIRING_SOON'
    ELSE 'ACTIVE'
  END as renewal_status,
  max_classes_per_period,
  classes_used
FROM place_based_subscriptions
WHERE auto_renew = true AND status = 'active'
ORDER BY end_date ASC;

-- Grant select permission on the view
GRANT SELECT ON auto_renewal_subscriptions_view TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN place_based_subscriptions.auto_renew IS 'Whether the subscription should automatically renew when it expires';
COMMENT ON FUNCTION get_expired_auto_renew_subscriptions() IS 'Returns all expired subscriptions that have auto-renewal enabled';
COMMENT ON VIEW auto_renewal_subscriptions_view IS 'View for monitoring auto-renewal subscriptions and their status';

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Auto-renewal setup completed successfully!';
  RAISE NOTICE 'Features available:';
  RAISE NOTICE '- auto_renew column with proper constraints';
  RAISE NOTICE '- Index for efficient auto-renewal queries';
  RAISE NOTICE '- Function to get expired auto-renewal subscriptions';
  RAISE NOTICE '- View for monitoring auto-renewal status';
END $$;
