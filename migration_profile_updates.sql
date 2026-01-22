-- Migration: Add username and languages, remove experience
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns
ALTER TABLE psychologists 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['Español'];

-- Step 2: Remove experience column
ALTER TABLE psychologists 
DROP COLUMN IF EXISTS experience;

-- Step 3: Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_psychologists_username ON psychologists(username);

-- Step 4: Update existing psychologists to have default languages if null
UPDATE psychologists 
SET languages = ARRAY['Español'] 
WHERE languages IS NULL;

-- Step 5: Generate usernames for existing psychologists (based on their name)
UPDATE psychologists 
SET username = LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 6)
WHERE username IS NULL;

-- Step 6: Update appointments table for Stripe
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
