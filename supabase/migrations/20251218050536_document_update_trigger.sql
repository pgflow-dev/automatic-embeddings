-- Part 2: Keeping Embeddings Fresh - Update trigger
-- This migration adds an UPDATE trigger to regenerate embeddings when content changes
-- The flow will create new chunks and delete old ones that are no longer present

create or replace function trigger_update_embedding_flow()
returns trigger as $$
begin
  perform pgflow.start_flow(
    flow_slug => 'updateEmbeddings',
    input => jsonb_build_object(
      'documentId', new_documents.id,
      'content', new_documents.content
    )
  )
  from new_documents;

  return null;
end;
$$ language plpgsql;

create trigger documents_update_trigger
after update on documents
referencing new table as new_documents
for each statement
execute function trigger_update_embedding_flow();
