export const RAG = (() => {
  function chunkText(text: string, chunkSize = 400, overlap = 80) {
    const sentences = text.split(/(?<=[.!?\n])\s+/);
    const chunks: string[] = [];
    let current = "";
    let overlapBuf = "";
    for (const sent of sentences) {
      if ((current + " " + sent).length > chunkSize && current.length > 0) {
        chunks.push((overlapBuf + current).trim());
        overlapBuf = current.slice(-overlap) + " ";
        current = sent;
      } else {
        current += (current ? " " : "") + sent;
      }
    }
    if (current.trim()) chunks.push((overlapBuf + current).trim());
    return chunks.filter(c => c.length > 30);
  }

  function tokenize(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  }

  function buildTFIDF(chunks: string[]) {
    const tf = chunks.map(c => {
      const tokens = tokenize(c);
      const freq: Record<string, number> = {};
      tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
      const total = tokens.length || 1;
      Object.keys(freq).forEach(k => { freq[k] /= total; });
      return freq;
    });
    const df: Record<string, number> = {};
    tf.forEach(freqMap => { Object.keys(freqMap).forEach(t => { df[t] = (df[t] || 0) + 1; }); });
    const N = chunks.length;
    const idf: Record<string, number> = {};
    Object.keys(df).forEach(t => { idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1; });
    const vectors = tf.map(freqMap => {
      const vec: Record<string, number> = {};
      Object.keys(freqMap).forEach(t => { vec[t] = freqMap[t] * (idf[t] || 1); });
      return vec;
    });
    return { vectors, idf };
  }

  function cosineSim(a: Record<string, number>, b: Record<string, number>) {
    let dot = 0, normA = 0, normB = 0;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    keys.forEach(k => {
      const va = a[k] || 0, vb = b[k] || 0;
      dot += va * vb; normA += va * va; normB += vb * vb;
    });
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  function ingestDoc(docName: string, rawText: string) {
    const chunks = chunkText(rawText);
    const { vectors, idf } = buildTFIDF(chunks);
    return { id: Date.now() + Math.random(), name: docName, rawText, chunks, vectors, idf, size: rawText.length, chunkCount: chunks.length, addedAt: Date.now() };
  }

  function retrieveChunks(question: string, docs: any[], topK = 4) {
    if (!docs.length) return [];
    const qTokens = tokenize(question);
    const results: any[] = [];
    docs.forEach(doc => {
      const qVec: Record<string, number> = {};
      const freq: Record<string, number> = {};
      qTokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
      const total = qTokens.length || 1;
      qTokens.forEach(t => { qVec[t] = (freq[t] / total) * (doc.idf[t] || 0.1); });
      doc.chunks.forEach((chunk: string, idx: number) => {
        const score = cosineSim(qVec, doc.vectors[idx] || {});
        results.push({ docName: doc.name, docId: doc.id, chunkIdx: idx, text: chunk, preview: chunk.slice(0, 120), score });
      });
    });
    return results.sort((a, b) => b.score - a.score).slice(0, topK).filter(r => r.score > 0.01);
  }

  return { ingestDoc, retrieveChunks, chunkText };
})();
