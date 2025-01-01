-- Ensure admin role is properly set and synced
DO $$ 
BEGIN
  -- First ensure the user exists in the users table
  INSERT INTO users (auth_id, email, role)
  SELECT 
    id as auth_id,
    email,
    'admin' as role
  FROM auth.users
  WHERE email = 'fiveonebrent@gmail.com'
  ON CONFLICT (auth_id) DO UPDATE
  SET role = 'admin'
  WHERE users.role != 'admin';

  -- Then sync the role to auth.users metadata
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE email = 'fiveonebrent@gmail.com';
END $$;

-- Improve role sync function
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if role has changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(NEW.role)
    )
    WHERE id = NEW.auth_id;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to sync user role: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger with better error handling
DROP TRIGGER IF EXISTS sync_role_to_auth ON users;
CREATE TRIGGER sync_role_to_auth
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.role IS DISTINCT FROM OLD.role)
  EXECUTE FUNCTION sync_user_role();

-- Ensure proper RLS policies
DROP POLICY IF EXISTS "users_read_access" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_access" ON users;

CREATE POLICY "users_read_access"
ON users FOR SELECT
USING (true);  -- Allow read access to all authenticated users

CREATE POLICY "users_insert_own"
ON users FOR INSERT
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "users_update_access"
ON users FOR UPDATE
USING (
  auth.uid() = auth_id OR  -- Can update own profile
  EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() 
    AND role = 'admin'
  )  -- Or is admin
);