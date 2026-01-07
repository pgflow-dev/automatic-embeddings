# Automatic Embeddings

Generate vector embeddings automatically when documents are inserted or updated using database triggers and pgflow.

Check [Full Tutorial](https://pgflow.dev/tutorials/rag/automatic-embeddings/) or [pgflow Documentation](https://pgflow.dev)

**This repository uses pgflow 0.12.0** - migrations and code are pinned to this version. See [Update pgflow](https://pgflow.dev/deploy/update-pgflow/) for upgrading to newer versions.

> **Part 2 Now Available:** This repo now demonstrates keeping embeddings fresh on UPDATE - see "How It Works" below.

## What This Demonstrates

- Database triggers starting pgflow workflows on INSERT and UPDATE
- Parallel chunk processing with `.array()` and `.map()`
- OpenAI embeddings via AI SDK (using `npm:` specifiers for Deno)
- pgvector for storing and searching embeddings
- Automatic cleanup of stale embeddings when content changes (Part 2)

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

## Try Update (Part 2)

Update the document - embeddings regenerate automatically and old chunks are cleaned up:

```sql
-- Check current chunks (should show 2 chunks)
select id, left(content, 50) as content_preview
from document_chunks
where document_id = 1;

-- Update the content
update documents
set content = 'PostgreSQL is a powerful database. It supports pgvector for similarity search. It also has great extensions.'
where id = 1;

-- Wait a moment for the flow to complete, then check again
-- You should see 3 new chunks (the old 2 were deleted)
select id, left(content, 50) as content_preview
from document_chunks
where document_id = 1;

-- Check that the old chunks (IDs 1, 2) are gone
-- New chunks should have higher IDs (3, 4, 5 or similar)
```

The `UpdateEmbeddings` flow:
1. Splits the updated content into new chunks
2. Generates embeddings in parallel
3. Saves new chunks (returns their IDs: 3, 4, 5)
4. Deletes old chunks NOT in the new ID list (deletes IDs 1, 2)

## How It Works

```mermaid
flowchart TD
    subgraph Insert_Flow["INSERT Flow (Part 1)"]
        A1[INSERT into documents] --> B1[Trigger fires]
        B1 --> C1[Split content into chunks]
        C1 --> D1[Generate embeddings]
        D1 --> E1[Save chunks with vectors]
    end

    subgraph Update_Flow["UPDATE Flow (Part 2)"]
        A2[UPDATE documents content] --> B2[Trigger fires]
        B2 --> C2[Split new content into chunks]
        C2 --> D2[Generate new embeddings]
        D2 --> E2[Save new chunks]
        E2 --> F2[Delete stale chunks]
    end

    D1 -. "Parallel processing via .map()" .-> D1
    D2 -. "Parallel processing via .map()" .-> D2
```

**Part 1 (INSERT):** When a document is inserted, the trigger starts `GenerateEmbeddings` flow which chunks, embeds, and saves.

**Part 2 (UPDATE):** When content is updated, the trigger starts `UpdateEmbeddings` flow which:
1. Generates new chunks and embeddings
2. Saves them to the database
3. Returns the new chunk IDs
4. Deletes old chunks that are NOT in the new ID list

This approach keeps embeddings in sync without drift - content changes always trigger fresh embeddings.

## Project Structure

```
supabase/
├── flows/
│   ├── generate-embeddings.ts    # INSERT flow (Part 1)
│   ├── update-embeddings.ts      # UPDATE flow (Part 2)
│   └── index.ts                  # Flow exports
├── tasks/
│   ├── splitChunks.ts            # Split text into sentences
│   ├── generateEmbedding.ts      # Call OpenAI API
│   ├── saveChunks.ts             # Save to database (returns IDs)
│   ├── deleteOldChunks.ts        # Clean up stale embeddings (Part 2)
│   └── index.ts                  # Task exports
├── functions/
│   ├── generate-embeddings-worker/
│   └── .env.example
└── migrations/
    ├── ..._enable_pgvector_and_schema.sql
    ├── ..._document_embedding_trigger.sql       # INSERT trigger (Part 1)
    └── ..._document_update_trigger.sql          # UPDATE trigger (Part 2)
```

> **Note:** If you modify flow definitions in this repo, see [pgflow Version Flows](https://pgflow.dev/build/version-flows/) for guidance on creating new flow versions without breaking existing deployments.

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

---

**Note:** This repo was updated for [pgflow 0.12.0](https://pgflow.dev/news/pgflow-0-12-0-simpler-handler-signatures-for-flow-composition/) which changed handler signatures. For the pre-0.12.0 version, see [commit 0583cfd](https://github.com/pgflow-dev/automatic-embeddings/tree/0583cfd).
