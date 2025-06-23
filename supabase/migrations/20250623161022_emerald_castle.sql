/*
  # Create projects and policy updates tables

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `repository_url` (text)
      - `status` (text: 'active', 'inactive', 'error')
      - `last_scan_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `policy_updates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (uuid, foreign key to projects)
      - `update_count` (integer, default 0)
      - `last_update_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  repository_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_scan_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create policy_updates table
CREATE TABLE IF NOT EXISTS policy_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  update_count integer NOT NULL DEFAULT 0,
  last_update_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id) -- One record per user-project combination
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_updates ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can read their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy updates policies
CREATE POLICY "Users can read their own policy updates"
  ON policy_updates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policy updates"
  ON policy_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policy updates"
  ON policy_updates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_updates_updated_at
  BEFORE UPDATE ON policy_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment policy update counter
CREATE OR REPLACE FUNCTION increment_policy_update_counter(
  p_user_id uuid,
  p_project_id uuid
)
RETURNS void AS $$
BEGIN
  INSERT INTO policy_updates (user_id, project_id, update_count, last_update_at)
  VALUES (p_user_id, p_project_id, 1, now())
  ON CONFLICT (user_id, project_id)
  DO UPDATE SET
    update_count = policy_updates.update_count + 1,
    last_update_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;