-- Migration: Add ON UPDATE CASCADE to foreign keys
-- This allows automatic ID synchronization when pre-registered users complete their registration

-- Drop existing foreign key constraints
ALTER TABLE psychologists DROP CONSTRAINT IF EXISTS psychologists_user_id_users_id_fk;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_users_id_fk;
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_users_id_fk;
ALTER TABLE session_files DROP CONSTRAINT IF EXISTS session_files_uploader_id_users_id_fk;

-- Re-add foreign key constraints with ON UPDATE CASCADE
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

-- Verify the changes
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
ORDER BY tc.table_name;
