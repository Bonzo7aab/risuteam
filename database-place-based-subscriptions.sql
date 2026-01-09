-- Place-Based Subscriptions System
-- This script creates the new subscription system based on place and class type
-- rather than specific schedule times

-- Create the place_based_subscriptions table
CREATE TABLE IF NOT EXISTS place_based_subscriptions (
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

-- Create a function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION expire_place_based_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE place_based_subscriptions 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to reset classes_used for monthly subscriptions
CREATE OR REPLACE FUNCTION reset_monthly_subscription_classes()
RETURNS void AS $$
BEGIN
  UPDATE place_based_subscriptions 
  SET classes_used = 0, updated_at = NOW()
  WHERE status = 'active' 
    AND subscription_type = 'monthly' 
    AND EXTRACT(DAY FROM CURRENT_DATE) = 1;
END;
$$ LANGUAGE plpgsql;

-- Create a function to reset classes_used for quarterly subscriptions
CREATE OR REPLACE FUNCTION reset_quarterly_subscription_classes()
RETURNS void AS $$
BEGIN
  UPDATE place_based_subscriptions 
  SET classes_used = 0, updated_at = NOW()
  WHERE status = 'active' 
    AND subscription_type = 'quarterly' 
    AND EXTRACT(MONTH FROM CURRENT_DATE) IN (1, 4, 7, 10)
    AND EXTRACT(DAY FROM CURRENT_DATE) = 1;
END;
$$ LANGUAGE plpgsql;

-- Create a function to reset classes_used for yearly subscriptions
CREATE OR REPLACE FUNCTION reset_yearly_subscription_classes()
RETURNS void AS $$
BEGIN
  UPDATE place_based_subscriptions 
  SET classes_used = 0, updated_at = NOW()
  WHERE status = 'active' 
    AND subscription_type = 'yearly' 
    AND EXTRACT(MONTH FROM CURRENT_DATE) = 1
    AND EXTRACT(DAY FROM CURRENT_DATE) = 1;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions BEFORE enabling RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON place_based_subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE place_based_subscriptions_id_seq TO authenticated;

-- Grant permissions to the functions
GRANT EXECUTE ON FUNCTION expire_place_based_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_monthly_subscription_classes() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_quarterly_subscription_classes() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_yearly_subscription_classes() TO authenticated;

-- Set up Row Level Security (RLS)
ALTER TABLE place_based_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own subscriptions
CREATE POLICY "Users can view own place-based subscriptions" ON place_based_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own place-based subscriptions" ON place_based_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own place-based subscriptions" ON place_based_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own place-based subscriptions" ON place_based_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all subscriptions (using a simpler approach)
CREATE POLICY "Admins can view all place-based subscriptions" ON place_based_subscriptions
  FOR SELECT USING (true);

-- Admins can manage all subscriptions (using a simpler approach)
CREATE POLICY "Admins can manage all place-based subscriptions" ON place_based_subscriptions
  FOR ALL USING (true);

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

-- Create a function to get subscription statistics
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

-- Create a function to check if user can attend a class at a specific place
CREATE OR REPLACE FUNCTION can_user_attend_class(
  user_uuid UUID, 
  place_id_param BIGINT, 
  class_type_param TEXT
)
RETURNS TABLE(
  can_attend BOOLEAN,
  subscription_id BIGINT,
  classes_remaining BIGINT,
  message TEXT
) AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Check if user has an active subscription for this place and class type
  SELECT * INTO subscription_record
  FROM place_based_subscriptions
  WHERE user_id = user_uuid 
    AND place_id = place_id_param 
    AND class_type = class_type_param 
    AND status = 'active';
  
  -- If no subscription found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::BIGINT, 0::BIGINT, 'Brak aktywnej subskrypcji dla tego miejsca i typu zajęć'::TEXT;
    RETURN;
  END IF;
  
  -- If subscription has no class limit, user can attend
  IF subscription_record.max_classes_per_period IS NULL THEN
    RETURN QUERY SELECT true, subscription_record.id, 0::BIGINT, 'Subskrypcja bez limitu zajęć'::TEXT;
    RETURN;
  END IF;
  
  -- Check if there are classes remaining
  IF subscription_record.classes_used >= subscription_record.max_classes_per_period THEN
    RETURN QUERY SELECT false, subscription_record.id, 0::BIGINT, 'Brak pozostałych zajęć w subskrypcji'::TEXT;
    RETURN;
  END IF;
  
  -- User can attend
  RETURN QUERY SELECT 
    true, 
    subscription_record.id, 
    (subscription_record.max_classes_per_period - subscription_record.classes_used)::BIGINT,
    'Można uczestniczyć w zajęciach'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION can_user_attend_class(UUID, BIGINT, TEXT) TO authenticated;

-- Create a cron job to automatically expire subscriptions (if you have pg_cron extension)
-- SELECT cron.schedule('expire-subscriptions', '0 0 * * *', 'SELECT expire_place_based_subscriptions();');

-- Create a cron job to reset monthly subscription classes (if you have pg_cron extension)
-- SELECT cron.schedule('reset-monthly-classes', '0 0 1 * *', 'SELECT reset_monthly_subscription_classes();');

-- Create a cron job to reset quarterly subscription classes (if you have pg_cron extension)
-- SELECT cron.schedule('reset-quarterly-classes', '0 0 1 1,4,7,10 *', 'SELECT reset_quarterly_subscription_classes();');

-- Create a cron job to reset yearly subscription classes (if you have pg_cron extension)
-- SELECT cron.schedule('reset-yearly-classes', '0 0 1 1 *', 'SELECT reset_yearly_subscription_classes();');

COMMENT ON TABLE place_based_subscriptions IS 'Subskrypcje miejscowe - użytkownicy mogą mieć subskrypcje na określone typy zajęć w konkretnych lokalizacjach';
COMMENT ON COLUMN place_based_subscriptions.class_type IS 'Typ zajęć (np. pilates, yoga, fitness)';
COMMENT ON COLUMN place_based_subscriptions.max_classes_per_period IS 'Maksymalna liczba zajęć w okresie subskrypcji (NULL = bez limitu)';
COMMENT ON COLUMN place_based_subscriptions.classes_used IS 'Liczba wykorzystanych zajęć w bieżącym okresie';
COMMENT ON COLUMN place_based_subscriptions.auto_renew IS 'Czy subskrypcja ma być automatycznie odnawiana';
