# Automatic Embeddings

Generate vector embeddings automatically when documents are inserted using database triggers and pgflow.

Check [Full Tutorial](https://pgflow.dev/tutorials/rag/automatic-embeddings/) or [pgflow Documentation](https://pgflow.dev)

## What This Demonstrates

- Database triggers starting pgflow workflows on INSERT
- Parallel chunk processing with `.array()` and `.map()`
- OpenAI embeddings via AI SDK (using `npm:` specifiers for Deno)
- pgvector for storing and searching embeddings

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [OpenAI API key](https://platform.openai.com/api-keys)
- Docker running

## Quick Start

```bash
git clone https://github.com/pgflow-dev/automatic-embeddings.git
cd automatic-embeddings

# Start Supabase
npx supabase start
npx supabase migrations up

# Set up environment
cp supabase/functions/.env.example supabase/functions/.env
# Edit supabase/functions/.env and add your OPENAI_API_KEY

# Start edge functions
npx supabase functions serve --no-verify-jwt
```

In another terminal, start the worker (this triggers flow compilation):

```bash
curl http://localhost:54321/functions/v1/generate-embeddings-worker
```

## Try It

> **Important:** Run these commands only after the worker is started (after the curl command above). The flow must be compiled before the trigger can execute, and it happens automatically when worker starts. You must call curl line only once - worker function will be registered and pgflow will use pg_cron to respawn it automatically.

Insert a document - embeddings generate automatically:

```sql
insert into documents (content) values (
  'PostgreSQL is a powerful database. It supports pgvector for similarity search.'
);
```

Or load the example data:

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres -f example-data.sql
```

Verify embeddings were generated:

```sql
select id, left(content, 50) as content_preview, vector_dims(embedding) as dims
from document_chunks;

--  id |               content_preview               | dims
-- ----+---------------------------------------------+------
--   1 | PostgreSQL is a powerful database.          | 1536
--   2 | It supports pgvector for similarity search. | 1536
-- (2 rows)

```

## How It Works

```mermaid
flowchart TD
    A[INSERT into documents] --> B[Trigger fires]
    B --> C[Split content into chunks]
    C --> D[Generate embeddings]
    D --> E[Save chunks with vectors]

    D -. "Parallel processing via .map()" .-> D
```

## Project Structure

```
supabase/
├── flows/
│   └── generate-embeddings.ts    # Flow definition
├── tasks/
│   ├── splitChunks.ts            # Split text into sentences
│   ├── generateEmbedding.ts      # Call OpenAI API
│   └── saveChunks.ts             # Save to database
├── functions/
│   ├── generate-embeddings-worker/
│   └── .env.example
└── migrations/
    ├── ..._enable_pgvector_and_schema.sql
    └── ..._document_embedding_trigger.sql
```

## Troubleshooting

**Worker returns error on curl**

- Make sure `supabase functions serve --no-verify-jwt` is running

**Embeddings not generating**

- Check your `OPENAI_API_KEY` in `supabase/functions/.env`
- Check pgflow runs: `select * from pgflow.runs order by started_at desc limit 5;`

**Flow not found**

- Restart edge functions and curl the worker again to recompile

## Learn More

- [Full Tutorial](https://pgflow.dev/tutorials/rag/automatic-embeddings/)
- [pgflow Documentation](https://pgflow.dev)
