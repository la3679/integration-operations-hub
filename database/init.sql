CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    department VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integration_jobs (
    id UUID PRIMARY KEY,
    source_system VARCHAR(80) NOT NULL,
    target_system VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED')),
    correlation_id UUID NOT NULL,
    records_received INTEGER NOT NULL DEFAULT 0,
    records_succeeded INTEGER NOT NULL DEFAULT 0,
    records_failed INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS integration_events (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES integration_jobs(id),
    event_type VARCHAR(80) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO employees (id, employee_number, first_name, last_name, email, department, status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'E-1001', 'Avery', 'Stone', 'avery.stone@example.com', 'Operations', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222222', 'E-1002', 'Jordan', 'Patel', 'jordan.patel@example.com', 'Engineering', 'ACTIVE')
ON CONFLICT DO NOTHING;

