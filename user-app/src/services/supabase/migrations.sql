-- Supabase Database Schema Setup
-- Run these commands in your Supabase Dashboard > SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create records table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table (using IF NOT EXISTS equivalent)
-- Drop existing policies first to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for records table (using IF NOT EXISTS equivalent)
-- Drop existing policies first to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can view their own records" ON records;
DROP POLICY IF EXISTS "Users can insert their own records" ON records;
DROP POLICY IF EXISTS "Users can update their own records" ON records;
DROP POLICY IF EXISTS "Users can delete their own records" ON records;

CREATE POLICY "Users can view their own records" ON records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records" ON records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" ON records
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Create a function to automatically set user_id when inserting records
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create trigger to automatically set user_id
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT ON records
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION set_user_id();
