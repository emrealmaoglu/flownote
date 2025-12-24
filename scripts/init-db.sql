-- FlowNote Database Initialization Script
-- This script runs on first container creation

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'FlowNote database initialized at %', NOW();
END
$$;
