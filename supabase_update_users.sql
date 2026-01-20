-- Add new columns to the users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS sessions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to update their own data (e.g. last_login)
CREATE POLICY "Users can update own data" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Policy to allow users to read their own data
CREATE POLICY "Users can read own data" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy to allow service_role (server actions) to manage all users
CREATE POLICY "Service role can manage all users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
