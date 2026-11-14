CREATE TABLE IF NOT EXISTS launch.weekly_email_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week integer NOT NULL UNIQUE,
  subject varchar(255),
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status varchar(20) NOT NULL DEFAULT 'running',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
