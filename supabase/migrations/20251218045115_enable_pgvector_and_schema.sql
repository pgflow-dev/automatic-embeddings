create extension if not exists vector with schema extensions;

create table documents (
  id bigserial primary key,
  content text not null,
  created_at timestamptz default now()
);

create table document_chunks (
  id bigserial primary key,
  document_id bigint references documents(id) on delete cascade,
  content text not null,
  embedding extensions.vector(1536)
);

-- Index for fast similarity search
create index on document_chunks using hnsw (embedding extensions.vector_cosine_ops);
