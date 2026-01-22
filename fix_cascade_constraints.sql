-- Fix CASCADE constraints - Remove ALL existing foreign keys and recreate them properly
-- This ensures we don't have duplicate or conflicting constraints

-- Step 1: Drop ALL foreign key constraints that reference users(id)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'users'
          AND tc.table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name || ' CASCADE';
    END LOOP;
END $$;

-- Step 2: Re-add foreign key constraints with ON UPDATE CASCADE and ON DELETE CASCADE
ALTER TABLE psychologists 
  ADD CONSTRAINT psychologists_user_id_users_id_fk 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON UPDATE CASCADE 
  ON DELETE CASCADE;

ALTER TABLE appointments 
  ADD CONSTRAINT appointments_patient_id_users_id_fk 
  FOREIGN KEY (patient_id) 
  REFERENCES users(id) 
  ON UPDATE CASCADE 
  ON DELETE CASCADE;

ALTER TABLE support_tickets 
  ADD CONSTRAINT support_tickets_user_id_users_id_fk 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON UPDATE CASCADE 
  ON DELETE CASCADE;

ALTER TABLE session_files 
  ADD CONSTRAINT session_files_uploader_id_users_id_fk 
  FOREIGN KEY (uploader_id) 
  REFERENCES users(id) 
  ON UPDATE CASCADE 
  ON DELETE CASCADE;

-- Step 3: Verify the changes - Should show CASCADE for all
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
