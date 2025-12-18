-- Example documents to test automatic embedding generation
-- Insert these after starting the worker to see embeddings generated automatically

insert into documents (content) values
  ('PostgreSQL is a powerful, open source object-relational database system. It has over 35 years of active development and a proven architecture.'),
  ('pgvector is an open-source vector similarity search extension for Postgres. It supports exact and approximate nearest neighbor search.'),
  ('Supabase is an open source Firebase alternative. It provides a Postgres database, authentication, instant APIs, and edge functions.');
