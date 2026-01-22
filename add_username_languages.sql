-- Add username and languages columns, remove experience column
ALTER TABLE psychologists 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS languages TEXT[];

-- Remove experience column if it exists
ALTER TABLE psychologists 
DROP COLUMN IF EXISTS experience;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_psychologists_username ON psychologists(username);
