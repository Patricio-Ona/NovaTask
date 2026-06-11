ALTER TYPE activity_entity_type ADD VALUE IF NOT EXISTS 'SUBJECT';
ALTER TYPE activity_entity_type ADD VALUE IF NOT EXISTS 'EVENT';
ALTER TYPE activity_entity_type ADD VALUE IF NOT EXISTS 'TERM';

CREATE TYPE event_type AS ENUM ('CLASS', 'EXAM', 'MEETING', 'PERSONAL', 'DEADLINE');

ALTER TABLE users RENAME COLUMN name TO full_name;

ALTER TABLE projects ADD COLUMN subject_id UUID;

CREATE TABLE academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  academic_term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  code VARCHAR(40),
  instructor VARCHAR(160),
  color VARCHAR(20) NOT NULL DEFAULT '#6366F1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  type event_type NOT NULL DEFAULT 'PERSONAL',
  color VARCHAR(20) NOT NULL DEFAULT '#0EA5E9',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tags ADD COLUMN user_id UUID;

UPDATE tags
SET user_id = (
  SELECT user_id
  FROM projects
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE user_id IS NULL;

ALTER TABLE tags ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tags ADD CONSTRAINT fk_tags_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key;
ALTER TABLE tags ADD CONSTRAINT uq_tags_user_name UNIQUE (user_id, name);

ALTER TABLE projects
  ADD CONSTRAINT fk_projects_subject_id FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL;

CREATE INDEX idx_academic_terms_user_id ON academic_terms(user_id);
CREATE INDEX idx_academic_terms_user_active ON academic_terms(user_id, is_active);
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_term_id ON subjects(academic_term_id);
CREATE UNIQUE INDEX uq_subjects_user_name ON subjects(user_id, name);
CREATE INDEX idx_projects_subject_id ON projects(subject_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_subject_id ON events(subject_id);
CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_start_at ON events(start_at);
