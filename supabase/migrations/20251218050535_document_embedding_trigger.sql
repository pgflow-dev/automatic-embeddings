create or replace function trigger_embedding_flow()
returns trigger as $$
begin
  perform pgflow.start_flow(
    flow_slug => 'generateEmbeddings',
    input => jsonb_build_object(
      'documentId', new_documents.id,
      'content', new_documents.content
    )
  )
  from new_documents;

  return null;
end;
$$ language plpgsql;

create trigger documents_embedding_trigger
  after insert on documents
  referencing new table as new_documents
  for each statement
  execute function trigger_embedding_flow();
