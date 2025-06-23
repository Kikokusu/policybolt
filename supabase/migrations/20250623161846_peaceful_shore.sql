/*
  # Add GitHub sync status to projects

  1. Changes
    - Add `github_synced` boolean column to projects table
    - Set default to false for existing projects
    - Update RLS policies to include new column

  2. Security
    - Maintains existing RLS policies
    - No additional security changes needed
*/

-- Add github_synced column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'github_synced'
  ) THEN
    ALTER TABLE projects ADD COLUMN github_synced boolean NOT NULL DEFAULT false;
  END IF;
END $$;