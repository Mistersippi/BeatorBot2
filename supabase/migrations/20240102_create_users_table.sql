-- Drop existing users table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    has_set_username BOOLEAN DEFAULT FALSE,
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    account_type TEXT DEFAULT 'user' CHECK (account_type IN ('user', 'admin')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add unique constraints
ALTER TABLE public.users ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow insert during signup" ON public.users;
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;

-- Create policies
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (
    auth.uid() = auth_id OR
    auth.role() = 'service_role'
);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (
    auth.uid() = auth_id OR
    auth.role() = 'service_role'
)
WITH CHECK (
    auth.uid() = auth_id OR
    auth.role() = 'service_role'
);

-- Allow anyone to create a profile during signup
CREATE POLICY "Allow insert during signup"
ON public.users 
FOR INSERT
TO public 
WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_auth_id_idx ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);

-- Update existing users to set auth_id if missing
UPDATE public.users u
SET auth_id = au.id 
FROM auth.users au
WHERE u.email = au.email 
AND u.auth_id IS NULL;
