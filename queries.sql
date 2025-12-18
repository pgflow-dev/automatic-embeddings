-- Verification queries for automatic embeddings example

-- Check documents table
select id, left(content, 50) as content_preview, created_at
from documents
order by created_at desc;

-- Check generated chunks with embedding preview
select
  dc.id,
  dc.document_id,
  left(dc.content, 40) as content_preview,
  dc.embedding[1:3] as embedding_preview
from document_chunks dc
order by dc.document_id, dc.id;

-- Check pgflow run status
select
  run_id,
  flow_slug,
  status,
  started_at,
  remaining_steps
from pgflow.runs
order by started_at desc
limit 5;

-- Check step execution
select
  r.run_id,
  s.step_slug,
  s.status,
  s.attempts
from pgflow.step_states s
join pgflow.runs r on r.run_id = s.run_id
where r.flow_slug = 'generateEmbeddings'
order by r.started_at desc, s.step_slug
limit 20;
