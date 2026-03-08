import React, { useState, useRef, useEffect } from "react";
import { C } from "../theme";
import { EmptyState, Spin, Skeleton } from "./ui";
import { RAG } from "../rag";
import { callGemini } from "../gemini";

function CitationCard({ chunk, idx }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background:C.cite, border:`1px solid ${C.citeBdr}`, borderRadius:8, padding:"8px 11px", fontSize:12, marginBottom:5 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
        <span style={{ fontSize:10, padding:"1px 6px", borderRadius:6, background:C.indigoL+"22", color:C.indigoL, fontWeight:700 }}>#{idx+1}</span>
        <span style={{ fontWeight:600, color:C.citeText }}>📄 {chunk.docName}</span>
        <span style={{ fontSize:10, color:C.faint, marginLeft:"auto" }}>score: {(chunk.score*100).toFixed(0)}%</span>
        <button onClick={()=>setExpanded(e=>!e)} style={{ background:"none", border:"none", color:C.citeText, cursor:"pointer", fontSize:11, padding:"0 2px" }}>{expanded?"▲":"▼"}</button>
      </div>
      <div style={{ color:C.citeText, lineHeight:1.55 }}>
        {expanded ? chunk.text : chunk.preview + (chunk.text.length > 120 ? "…" : "")}
      </div>
    </div>
  );
}

function MetricsBar({ latency, inputTokens, outputTokens, chunkCount, onFeedback, feedback }: any) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:7, marginTop:8, fontSize:11, flexWrap:"wrap" }}>
      <span title="Response latency">⏱ <strong>{latency}ms</strong></span>
      <span style={{color:C.border}}>|</span>
      <span title="Token usage">🪙 <strong>{inputTokens + outputTokens}</strong> tok ({inputTokens} in / {outputTokens} out)</span>
      <span style={{color:C.border}}>|</span>
      <span title="Chunks retrieved">🔍 <strong>{chunkCount}</strong> chunk{chunkCount!==1?"s":""}</span>
      <div style={{flex:1}}/>
      {feedback === null ? (
        <div style={{display:"flex",gap:4}}>
          <span style={{fontSize:11,color:C.faint}}>Helpful?</span>
          <button onClick={()=>onFeedback("up")} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"0 2px",opacity:.7}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".7"}>👍</button>
          <button onClick={()=>onFeedback("down")} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"0 2px",opacity:.7}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".7"}>👎</button>
        </div>
      ) : (
        <span style={{fontSize:11,color:feedback==="up"?C.emerald:C.rose}}>{feedback==="up"?"👍 Thanks!":"👎 Noted"}</span>
      )}
    </div>
  );
}

export function ChatView({ docs, queryLog, onLogQuery }: any) {
  const [messages, setMsgs] = useState<any[]>([]);
  const [input, setInput]   = useState("");
  const [loading, setLoad]  = useState(false);
  const [feedback, setFB]   = useState<Record<string, string>>({});
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ chatRef.current?.scrollTo({top:99999,behavior:"smooth"}); },[messages,loading]);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput(""); setLoad(true);
    setMsgs(m => [...m, { id:Date.now(), role:"user", content:question }]);
    const t0 = performance.now();
    try {
      const chunks = RAG.retrieveChunks(question, docs, 4);
      const context = chunks.length
        ? chunks.map((c:any,i:number) => `[Source ${i+1} — ${c.docName}]\n${c.text}`).join("\n\n---\n\n")
        : "No relevant document context found.";
      const sys = `You are a precise document assistant. Answer the user's question using ONLY the provided context.\n- Be concise and accurate.\n- If the context doesn't contain the answer, say so clearly — do not hallucinate.\n- Reference sources naturally (e.g. "According to the documentation…").\n- Do not repeat context verbatim; synthesize it.`;
      const prompt = `Context from knowledge base:\n\n${context}\n\n---\nQuestion: ${question}`;
      
      const { text, inputTokens, outputTokens } = await callGemini(sys, prompt);
      
      const latency = Math.round(performance.now() - t0);
      const entry = { id: Date.now(), role: "assistant", content: text, chunks, latency, inputTokens, outputTokens, timestamp: Date.now(), question };
      setMsgs(m => [...m, entry]);
      onLogQuery(entry);
    } catch (e: any) {
      setMsgs(m => [...m, { id: Date.now(), role:"error", content: `⚠️ Request failed: ${e.message}.` }]);
    }
    setLoad(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"16px 14px", display:"flex", flexDirection:"column", gap:16 }}>
        {messages.length === 0 && !loading && (
          <EmptyState icon="💬" title="Ask anything about your docs"
            body={docs.length
              ? `${docs.reduce((a:number,d:any)=>a+d.chunkCount,0)} chunks loaded across ${docs.length} doc${docs.length!==1?"s":""}. Start asking questions.`
              : "Load a document on the left first, then ask questions here."}/>
        )}

        {messages.map(m => (
          <div key={m.id}>
            {m.role === "user" && (
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <div style={{ maxWidth:"80%", background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`, color:"white", borderRadius:"14px 3px 14px 14px", padding:"11px 15px", fontSize:13, lineHeight:1.6, boxShadow:`0 3px 12px ${C.indigo}33` }}>
                  {m.content}
                </div>
              </div>
            )}
            {m.role === "assistant" && (
              <div>
                <div style={{ display:"flex", gap:9 }}>
                  <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`linear-gradient(135deg,${C.teal},${C.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🤖</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:"4px 14px 14px 14px", padding:"12px 15px", fontSize:13, lineHeight:1.7, color:C.text, boxShadow:"0 1px 5px rgba(0,0,0,.05)", whiteSpace:"pre-wrap" }}>
                      {m.content}
                    </div>
                    {m.chunks?.length > 0 && (
                      <div style={{ marginTop:8 }}>
                        <div style={{ fontSize:11, color:C.faint, fontWeight:700, letterSpacing:.5, textTransform:"uppercase", marginBottom:5 }}>Sources</div>
                        {m.chunks.map((c:any,i:number) => <CitationCard key={i} chunk={c} idx={i}/>)}
                      </div>
                    )}
                    {m.chunks?.length === 0 && (
                      <div style={{ marginTop:6, fontSize:11, color:C.amber, background:C.amber+"10", border:`1px solid ${C.amber}33`, borderRadius:6, padding:"5px 10px" }}>
                        ⚠️ No matching chunks found — answer may be less grounded
                      </div>
                    )}
                    <MetricsBar latency={m.latency} inputTokens={m.inputTokens} outputTokens={m.outputTokens} chunkCount={m.chunks?.length||0} feedback={feedback[m.id]??null} onFeedback={(v:string) => setFB(f=>({...f,[m.id]:v}))}/>
                  </div>
                </div>
              </div>
            )}
            {m.role === "error" && (
              <div style={{ background:C.rose+"0e", border:`1px solid ${C.rose}44`, borderRadius:10, padding:"11px 15px", fontSize:13, color:C.rose, lineHeight:1.6 }}>
                {m.content}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display:"flex", gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`${C.indigo}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🤖</div>
            <div style={{ flex:1, background:C.white, border:`1px solid ${C.border}`, borderRadius:"4px 14px 14px 14px", padding:"14px 15px", boxShadow:"0 1px 5px rgba(0,0,0,.05)" }}>
              <Skeleton h={12} mb={8}/><Skeleton h={12} w="85%" mb={8}/><Skeleton h={12} w="60%"/>
            </div>
          </div>
        )}
        <div style={{height:4}}/>
      </div>

      <div style={{ padding:"10px 14px 14px", borderTop:`1px solid ${C.border}`, background:C.white, flexShrink:0 }}>
        <div style={{ display:"flex", gap:8, background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"8px 10px", transition:"border-color .2s" }}
          onFocusCapture={e=>e.currentTarget.style.borderColor=C.indigo}
          onBlurCapture={e=>e.currentTarget.style.borderColor=C.border}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask();} }}
            disabled={loading}
            placeholder={docs.length ? "Ask a question about your documents…" : "Load a document first, then ask questions here…"}
            rows={2}
            style={{ flex:1, background:"none", border:"none", resize:"none", color:C.text, fontSize:13, lineHeight:1.5, outline:"none", fontFamily:"inherit" }}/>
          <button onClick={ask} disabled={loading || !input.trim() || !docs.length}
            style={{ alignSelf:"flex-end", width:36, height:36, borderRadius:9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
              background: input.trim() && docs.length && !loading ? `linear-gradient(135deg,${C.indigo},${C.indigoL})` : C.surface,
              color: input.trim() && docs.length && !loading ? "white" : C.faint, transition:"all .2s", flexShrink:0 }}>
            {loading ? <Spin s={14} c={C.indigo}/> : "→"}
          </button>
        </div>
        <div style={{ fontSize:10.5, color:C.faint, textAlign:"center", marginTop:6 }}>Enter to send · Shift+Enter for newline · Answers are grounded in your docs</div>
      </div>
    </div>
  );
}
