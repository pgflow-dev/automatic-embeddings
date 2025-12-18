export async function splitChunks(content: string) {
  // Split on sentence boundaries while preserving context
  const chunks = content
    .split(/(?<=[.!?])\s+/)
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk) => chunk.trim());

  return chunks;
}
