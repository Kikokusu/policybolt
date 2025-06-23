/*
  # Create plans and user subscriptions tables

  1. New Tables
    - `plans`
      - `id` (uuid, primary key)
      - `name` (text, plan name)
      - `description` (text, plan description)
      - `price` (numeric, monthly price)
      - `max_projects` (integer, maximum projects allowed)
      - `features` (jsonb, array of features)
      - `is_active` (boolean, whether plan is available)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan_id` (uuid, foreign key to plans)
      - `status` (text, subscription status)
      - `trial_ends_at` (timestamp, when trial ends)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read plans
    - Add policies for users to manage their own subscriptions

  3. Sample Data
    - Insert the three pricing plans with their limits and features
*/

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  max_projects integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id) -- One subscription per user
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans policies (everyone can read active plans)
CREATE POLICY "Anyone can read active plans"
  ON plans
  FOR SELECT
  USING (is_active = true);

-- User subscriptions policies
CREATE POLICY "Users can read their own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert the three pricing plans
INSERT INTO plans (name, description, price, max_projects, features) VALUES
(
  'Solo Developer',
  'Perfect for indie makers and solo founders',
  29.00,
  1,
  '["1 project/repository", "Auto-updating privacy policies", "Basic API monitoring", "GDPR & CCPA compliance", "Email support", "GitHub integration"]'::jsonb
),
(
  'Growing Startup',
  'Best for small teams shipping fast',
  79.00,
  5,
  '["Up to 5 projects", "Advanced AI monitoring", "All integrations", "Global regulation coverage", "Priority support", "Team collaboration", "Custom templates"]'::jsonb
),
(
  'Enterprise',
  'For companies with complex compliance needs',
  0.00,
  999999,
  '["Unlimited projects", "Custom AI training", "White-label solutions", "Dedicated support", "SLA guarantees", "Legal review service"]'::jsonb
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();