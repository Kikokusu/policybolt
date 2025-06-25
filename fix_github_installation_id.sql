-- Remove foreign key constraint on github_installation_id and make it a simple text field
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_github_installation_id_fkey;

-- Ensure the column can accept text values
ALTER TABLE projects 
ALTER COLUMN github_installation_id TYPE TEXT;