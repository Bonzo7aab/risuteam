-- Place-Based Subscriptions System - Simplified Version
-- This script creates the new subscription system with minimal RLS complexity

-- Drop existing objects if they exist (clean start)
DROP TRIGGER IF EXISTS trigger_update_place_based_subscriptions_updated_at ON place_based_subscriptions;
DROP FUNCTION IF EXISTS update_place_based_subscriptions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_place_based_subscription_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_subscription_classes_used(BIGINT) CASCADE;
DROP VIEW IF EXISTS place_based_subscriptions_view CASCADE;
DROP TABLE IF EXISTS place_based_subscriptions CASCADE;

-- Create the place_based_subscriptions table
CREATE TABLE place_based_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  class_type TEXT NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  price DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'PLN',
  max_classes_per_period INTEGER,
  classes_used INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_place_based_subscriptions_user_id ON place_based_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_place_based_subscriptions_place_id ON place_based_subscriptions(place_id);
CREATE INDEX IF NOT EXISTS idx_place_based_subscriptions_status ON place_based_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_place_based_subscriptions_end_date ON place_based_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_place_based_subscriptions_user_place_class ON place_based_subscriptions(user_id, place_id, class_type);

-- Create a unique constraint to prevent multiple active subscriptions for the same user, place, and class type
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_subscription 
ON place_based_subscriptions(user_id, place_id, class_type) 
WHERE status = 'active';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_place_based_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER trigger_update_place_based_subscriptions_updated_at
  BEFORE UPDATE ON place_based_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_place_based_subscriptions_updated_at();

-- Grant ALL permissions to authenticated users (for now, we'll add RLS later)
GRANT ALL ON place_based_subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE place_based_subscriptions_id_seq TO authenticated;

-- Create a simple function to get subscription statistics
CREATE OR REPLACE FUNCTION get_place_based_subscription_stats(user_uuid UUID)
RETURNS TABLE(
  total_subscriptions BIGINT,
  active_subscriptions BIGINT,
  paused_subscriptions BIGINT,
  expired_subscriptions BIGINT,
  total_classes_remaining BIGINT,
  next_renewal_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_subscriptions,
    COUNT(*) FILTER (WHERE status = 'paused')::BIGINT as paused_subscriptions,
    COUNT(*) FILTER (WHERE status = 'expired')::BIGINT as expired_subscriptions,
    COALESCE(SUM(
      CASE 
        WHEN status = 'active' THEN 
          COALESCE(max_classes_per_period, 0) - classes_used
        ELSE 0
      END
    ), 0)::BIGINT as total_classes_remaining,
    MIN(end_date) FILTER (WHERE status = 'active' AND auto_renew = true) as next_renewal_date
  FROM place_based_subscriptions
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_place_based_subscription_stats(UUID) TO authenticated;

-- Create a function to increment classes used
CREATE OR REPLACE FUNCTION increment_subscription_classes_used(subscription_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Get subscription details
  SELECT * INTO subscription_record 
  FROM place_based_subscriptions 
  WHERE id = subscription_id AND status = 'active';
  
  -- Check if subscription exists and is active
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if there are classes remaining
  IF subscription_record.max_classes_per_period IS NOT NULL 
     AND subscription_record.classes_used >= subscription_record.max_classes_per_period THEN
    RETURN false;
  END IF;
  
  -- Increment classes used
  UPDATE place_based_subscriptions 
  SET classes_used = classes_used + 1, updated_at = NOW()
  WHERE id = subscription_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_subscription_classes_used(BIGINT) TO authenticated;

-- Create a view for easy subscription management
CREATE OR REPLACE VIEW place_based_subscriptions_view AS
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
  pbs.price,
  pbs.currency,
  pbs.max_classes_per_period,
  pbs.classes_used,
  pbs.notes,
  pbs.created_at,
  pbs.updated_at,
  p.name as place_name,
  p.address as place_address,
  CASE 
    WHEN pbs.status = 'active' AND pbs.end_date < CURRENT_DATE + INTERVAL '7 days' THEN true
    ELSE false
  END as is_expiring_soon,
  CASE 
    WHEN pbs.status = 'active' THEN 
      COALESCE(pbs.max_classes_per_period, 0) - pbs.classes_used
    ELSE 0
  END as classes_remaining
FROM place_based_subscriptions pbs
JOIN places p ON pbs.place_id = p.id;

-- Grant access to the view
GRANT SELECT ON place_based_subscriptions_view TO authenticated;

-- Insert some sample data for testing (optional - uncomment and modify as needed)
-- INSERT INTO place_based_subscriptions (user_id, place_id, class_type, subscription_type, start_date, end_date, auto_renew, max_classes_per_period) 
-- VALUES 
--   ('your-user-id-here', 1, 'pilates', 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month' - INTERVAL '1 day', true, 8);

COMMENT ON TABLE place_based_subscriptions IS 'Subskrypcje miejscowe - użytkownicy mogą mieć subskrypcje na określone typy zajęć w konkretnych lokalizacjach';
COMMENT ON COLUMN place_based_subscriptions.class_type IS 'Typ zajęć (np. pilates, yoga, fitness)';
COMMENT ON COLUMN place_based_subscriptions.max_classes_per_period IS 'Maksymalna liczba zajęć w okresie subskrypcji (NULL = bez limitu)';
COMMENT ON COLUMN place_based_subscriptions.classes_used IS 'Liczba wykorzystanych zajęć w bieżącym okresie';
COMMENT ON COLUMN place_based_subscriptions.auto_renew IS 'Czy subskrypcja ma być automatycznie odnawiana';
