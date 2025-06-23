/*
  # Add config column to projects table

  1. Changes
    - Add `config` column to `projects` table as JSONB to store wizard configuration
    - This allows storing all project setup options in a single JSON field
    - Maintains backward compatibility with existing projects

  2. Benefits
    - Flexible storage for project configuration
    - No need for additional tables
    - Easy to query and update project settings
*/

-- Add config column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'config'
  ) THEN
    ALTER TABLE projects ADD COLUMN config jsonb DEFAULT NULL;
  END IF;
END $$;

-- Add comment to the column
COMMENT ON COLUMN projects.config IS 'JSON configuration storing project wizard settings including purpose, geography, AI usage, hosting details, etc.';