-- Create the suitebusiness user if it doesn't exist
CREATE USER suitebusiness_user WITH ENCRYPTED PASSWORD 'suitebusiness_dev_password';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE suitebusiness TO suitebusiness_user;

-- Connect to the suitebusiness database
\c suitebusiness;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO suitebusiness_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO suitebusiness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO suitebusiness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO suitebusiness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO suitebusiness_user;
