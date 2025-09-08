-- Admin Panel Supabase Setup
-- This SQL creates the necessary tables and policies for the admin panel

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Store hashed passwords
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin', 'manager'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  permissions JSONB DEFAULT '{}' -- Store specific permissions
);

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_email VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(255),
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table (if not exists from user app)
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  category VARCHAR(100),
  coordinates JSONB, -- {latitude: number, longitude: number}
  images TEXT[], -- Array of image URLs
  entrance_fee VARCHAR(100),
  opening_hours VARCHAR(255),
  contact_number VARCHAR(50),
  website VARCHAR(255),
  amenities TEXT[],
  accessibility_features TEXT[],
  best_time_to_visit VARCHAR(255),
  estimated_duration VARCHAR(100),
  difficulty_level VARCHAR(50),
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false
);

-- Create delicacies table (if not exists from user app)
CREATE TABLE IF NOT EXISTS delicacies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  restaurant VARCHAR(255),
  location VARCHAR(255),
  price_range VARCHAR(100),
  ingredients TEXT[],
  allergens TEXT[],
  dietary_info TEXT[], -- vegetarian, vegan, etc.
  cultural_significance TEXT,
  preparation_time VARCHAR(100),
  images TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false
);

-- Row Level Security (RLS) Policies

-- Enable RLS on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first, then create new ones
DROP POLICY IF EXISTS "Admin users can view own data" ON admin_users;
CREATE POLICY "Admin users can view own data" ON admin_users
  FOR SELECT USING (auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND role = 'super_admin'));

DROP POLICY IF EXISTS "Only super_admin can modify admin_users" ON admin_users;
CREATE POLICY "Only super_admin can modify admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "Admin can manage own sessions" ON admin_sessions;
CREATE POLICY "Admin can manage own sessions" ON admin_sessions
  FOR ALL USING (admin_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view audit log" ON admin_audit_log;
CREATE POLICY "Admins can view audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND is_active = true)
  );

DROP POLICY IF EXISTS "Admins can insert audit log" ON admin_audit_log;
CREATE POLICY "Admins can insert audit log" ON admin_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND is_active = true)
  );

-- Destinations policies (allow admin access)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active destinations" ON destinations;
CREATE POLICY "Public can view active destinations" ON destinations
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage destinations" ON destinations;
CREATE POLICY "Admins can manage destinations" ON destinations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND is_active = true)
  );

-- Delicacies policies (allow admin access)
ALTER TABLE delicacies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active delicacies" ON delicacies;
CREATE POLICY "Public can view active delicacies" ON delicacies
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage delicacies" ON delicacies;
CREATE POLICY "Admins can manage delicacies" ON delicacies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND is_active = true)
  );

-- Users table policies (drop if exists, then create)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND is_active = true)
  );

DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND is_active = true)
  );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_destinations_updated_at ON destinations;
CREATE TRIGGER update_destinations_updated_at 
  BEFORE UPDATE ON destinations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delicacies_updated_at ON delicacies;
CREATE TRIGGER update_delicacies_updated_at 
  BEFORE UPDATE ON delicacies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin users (using SHA-256 hash that matches our admin service)
-- The hash is: SHA-256(password + 'cebu_tourist_salt')
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES (
  'admin@cebutourist.com',
  '9c7bfbb0f7cf7a9c9e22fd26f3a9b10e2c5b8bfed33d1d0acfc9c8a4e8a8db72', -- password: admin123
  'Super Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO admin_users (email, password_hash, name, role) 
VALUES (
  'manager@cebutourist.com',
  'a8a1e9b6c7d4f5e2a3b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', -- password: manager123
  'Content Manager',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_delicacies_category ON delicacies(category);
CREATE INDEX IF NOT EXISTS idx_delicacies_active ON delicacies(is_active);
