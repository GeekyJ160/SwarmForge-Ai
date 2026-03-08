import React, { useState, useMemo } from "react";
import { C } from "../theme";
import { Spin, Tag } from "./ui";
import { RAG } from "../rag";
import { callGemini } from "../gemini";
import { EVAL_SET } from "../data";

export function EvalPanel({ docs, queryLog }: any) {
  const [filter, setFilter]       = useState("all");
  const [evalResults, setER]      = useState<any[] | null>(null);
  const [evalRunning, setEvalRun] = useState(false);
  const [evalProgress, setEP]     = useState(0);

  const filtered = useMemo(()=>{
    if (filter==="slow")      return queryLog.filter((q:any)=>q.latency > 3000);
    if (filter==="no-chunks") return queryLog.filter((q:any)=>q.chunks?.length === 0);
    return queryLog;
  },[queryLog, filter]);

  const fmtTs = (ts:number) => new Date(ts).toLocaleTimeString();

  const runEval = async () => {
    if (!docs.length || evalRunning) return;
    setEvalRun(true); setER([]); setEP(0);
    const results = [];
    for (let i = 0; i < EVAL_SET.length; i++) {
      const eq = EVAL_SET[i];
      const t0 = performance.now();
      try {
        const chunks = RAG.retrieveChunks(eq.question, docs, 4);
        const context = chunks.map((c:any,j:number) => `[Source ${j+1}]\n${c.text}`).join("\n\n---\n\n") || "No context found.";
        const { text } = await callGemini(`You are a document assistant. Answer using only the provided context. Be concise.`, `Context:\n${context}\n\nQuestion: ${eq.question}`);
        const latency = Math.round(performance.now() - t0);
        const answerLower = text.toLowerCase();
        const matched = eq.keywords.filter(k => answerLower.includes(k.toLowerCase()));
        const pass = matched.length > 0;
        results.push({ ...eq, answer:text.slice(0,200), latency, chunks:chunks.length, pass, matched });
      } catch (e: any) {
        results.push({ ...eq, answer:`Error: ${e.message}`, latency:0, chunks:0, pass:false, matched:[] });
      }
      setEP(i+1); setER([...results]);
    }
    setEvalRun(false);
  };

  const passCount = evalResults?.filter(r=>r.pass).length || 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.white }}>
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>🧪 Eval & Logs</div>
        <div style={{ fontSize:12, color:C.muted }}>{queryLog.length} queries logged this session</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:C.text }}>Evaluation Harness</div>
              <div style={{ fontSize:11, color:C.muted }}>{EVAL_SET.length} fixed Q&A pairs · keyword-match scoring</div>
            </div>
            <button onClick={runEval} disabled={evalRunning || !docs.length}
              style={{ padding:"7px 14px", background:evalRunning||!docs.length?C.surface:`linear-gradient(135deg,${C.violet},${C.indigo})`, border:"none", borderRadius:8, color:evalRunning||!docs.length?C.faint:"white", fontSize:12, fontWeight:700, cursor:evalRunning||!docs.length?"default":"pointer", display:"flex", alignItems:"center", gap:6 }}>
              {evalRunning ? <><Spin s={12} c={C.violet}/> Running {evalProgress}/{EVAL_SET.length}…</> : "▶ Run Eval"}
            </button>
          </div>
          {evalRunning && (
            <div style={{ height:4, background:C.surface, borderRadius:2, marginBottom:10, overflow:"hidden" }}>
              <div style={{ height:"100%", background:`linear-gradient(90deg,${C.violet},${C.indigoL})`, width:`${(evalProgress/EVAL_SET.length)*100}%`, transition:"width .3s ease", borderRadius:2 }}/>
            </div>
          )}
          {evalResults && evalResults.length > 0 && !evalRunning && (
            <div style={{ marginBottom:8, padding:"8px 12px", background:passCount===EVAL_SET.length?C.emerald+"0f":passCount>EVAL_SET.length/2?C.amber+"0f":C.rose+"0f", border:`1px solid ${passCount===EVAL_SET.length?C.emerald:passCount>EVAL_SET.length/2?C.amber:C.rose}33`, borderRadius:8 }}>
              <span style={{ fontWeight:700, fontSize:13, color:passCount===EVAL_SET.length?C.emerald:passCount>EVAL_SET.length/2?C.amber:C.rose }}>
                {passCount === EVAL_SET.length ? "✅" : passCount > EVAL_SET.length/2 ? "⚠️" : "❌"} {passCount}/{EVAL_SET.length} passed
              </span>
            </div>
          )}
          {evalResults?.map((r,i)=>(
            <div key={r.id} style={{ padding:"8px 0", borderBottom:i<evalResults.length-1?`1px solid ${C.border}`:"none" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{r.pass?"✅":"❌"}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:3 }}>Q{r.id}: {r.question}</div>
                  <div style={{ fontSize:11, color:C.muted, lineHeight:1.5, marginBottom:4 }}>{r.answer}{r.answer.length===200?"…":""}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {r.pass ? <Tag color={C.emerald}>matched: {r.matched.join(", ")}</Tag> : <Tag color={C.rose}>no keywords matched</Tag>}
                    <Tag color={C.teal}>{r.latency}ms</Tag>
                    <Tag color={C.indigo}>{r.chunks} chunks</Tag>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!docs.length && <div style={{ fontSize:12, color:C.faint, textAlign:"center", padding:"8px 0" }}>Load at least one document to run eval</div>}
        </div>

        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.text }}>Query Log</div>
            <div style={{ display:"flex", gap:5 }}>
              {[["all","All"],["slow","⏱ Slow"],["no-chunks","🔍 No chunks"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)} style={{ padding:"4px 9px", borderRadius:6, border:`1px solid ${filter===v?C.indigo:C.border}`, background:filter===v?C.indigo+"0f":C.white, color:filter===v?C.indigo:C.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>{l}</button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"20px 0", color:C.faint, fontSize:13 }}>
              {queryLog.length === 0 ? "No queries yet — ask a question to see logs." : "No queries match this filter."}
            </div>
          ) : [...filtered].reverse().map((entry:any)=>(
            <div key={entry.id} style={{ padding:"10px 12px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:5 }}>
                <span style={{ fontSize:10, color:C.faint, whiteSpace:"nowrap", marginTop:2 }}>{fmtTs(entry.timestamp)}</span>
                <div style={{ flex:1, fontSize:13, fontWeight:600, color:C.text, lineHeight:1.4 }}>{entry.question}</div>
              </div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:6 }}>
                {entry.content?.slice(0,150)}{entry.content?.length>150?"…":""}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Tag color={entry.latency>3000?C.rose:entry.latency>1500?C.amber:C.emerald}>⏱ {entry.latency}ms</Tag>
                <Tag color={C.indigo}>🪙 {(entry.inputTokens||0)+(entry.outputTokens||0)} tok</Tag>
                <Tag color={entry.chunks?.length===0?C.rose:C.teal}>🔍 {entry.chunks?.length||0} chunks</Tag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
