#!/bin/sh
set -e

# This runs once when the container is first created
# The user is already a superuser by default when created via POSTGRES_USER
# This script just ensures all schemas have correct ownership

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Grant all privileges to ensure no permission issues
    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
    GRANT ALL PRIVILEGES ON SCHEMA public TO ${POSTGRES_USER};
    ALTER SCHEMA public OWNER TO ${POSTGRES_USER};
EOSQL

echo "✅ Database initialized with correct permissions"