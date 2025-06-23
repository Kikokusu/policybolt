/*
  # Create policies table with status tracking and audit trail

  1. New Tables
    - `policies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (uuid, foreign key to projects)
      - `title` (text)
      - `content` (text, the generated policy content)
      - `version` (text, version number like "1.0", "1.1", etc.)
      - `status` (text, enum: 'inactive', 'active', 'pending_review')
      - `created_at` (timestamp)
      - `approved_at` (timestamp, nullable)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `policies` table
    - Add policies for authenticated users to manage their own policies

  3. Indexes
    - Add index on user_id and project_id for faster queries
    - Add index on status for filtering
*/

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('inactive', 'active', 'pending_review')),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz DEFAULT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can read their own policies"
  ON policies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policies"
  ON policies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies"
  ON policies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies"
  ON policies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS policies_user_id_idx ON policies(user_id);
CREATE INDEX IF NOT EXISTS policies_project_id_idx ON policies(project_id);
CREATE INDEX IF NOT EXISTS policies_status_idx ON policies(status);
CREATE INDEX IF NOT EXISTS policies_created_at_idx ON policies(created_at DESC);

-- Create trigger for updating updated_at
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle policy approval workflow
CREATE OR REPLACE FUNCTION approve_policy(policy_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, set all other policies for the same project to inactive
  UPDATE policies 
  SET status = 'inactive', updated_at = now()
  WHERE project_id = (SELECT project_id FROM policies WHERE id = policy_id)
    AND user_id = auth.uid()
    AND status = 'active';
  
  -- Then approve the new policy
  UPDATE policies 
  SET status = 'active', 
      approved_at = now(), 
      updated_at = now()
  WHERE id = policy_id 
    AND user_id = auth.uid()
    AND status = 'pending_review';
END;
$$;