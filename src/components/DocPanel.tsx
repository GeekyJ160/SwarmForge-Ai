import React, { useState, useRef } from "react";
import { C } from "../theme";
import { IconBtn, EmptyState, Tag } from "./ui";

export function DocPanel({ docs, onAdd, onDelete, onLoadSample }: any) {
  const [text, setText]     = useState("");
  const [name, setName]     = useState("");
  const [pasting, setPaste] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!text.trim()) return;
    onAdd(name.trim() || "document.md", text);
    setText(""); setName(""); setPaste(false);
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: any) => { setText(ev.target.result); setName(file.name); setPaste(true); };
    reader.readAsText(file);
    e.target.value = "";
  };

  const fmt = (bytes: number) => bytes > 1024 ? `${(bytes/1024).toFixed(1)} KB` : `${bytes} B`;
  const fmtAge = (ts: number) => { const s = (Date.now()-ts)/1000; if(s<60) return "just now"; if(s<3600) return `${Math.floor(s/60)}m ago`; return `${Math.floor(s/3600)}h ago`; };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.white, borderRight:`1px solid ${C.border}` }}>
      <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, letterSpacing:-.2 }}>📚 My Docs</div>
          <div style={{ display:"flex", gap:6 }}>
            <input ref={fileRef} type="file" accept=".md,.txt,.html,.json" onChange={handleFile} style={{display:"none"}}/>
            <IconBtn icon="📎" label="Upload" onClick={()=>fileRef.current?.click()}/>
            <IconBtn icon="✏️" label="Paste" onClick={()=>setPaste(p=>!p)} active={pasting}/>
          </div>
        </div>
        {!docs.length && !pasting && (
          <button onClick={onLoadSample} style={{ width:"100%", padding:"7px 0", background:`${C.indigo}0f`, border:`1px dashed ${C.indigo}55`, borderRadius:8, color:C.indigo, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            ✨ Load sample doc to try it out
          </button>
        )}
      </div>

      {pasting && (
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`, flexShrink:0, background:C.surface }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Document name (e.g. pricing.md)"
            style={{ width:"100%", background:C.white, border:`1px solid ${C.border}`, borderRadius:7, padding:"6px 10px", fontSize:12, color:C.text, marginBottom:7, boxSizing:"border-box", outline:"none" }}/>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} placeholder="Paste markdown, HTML, plain text, or a FAQ…"
            style={{ width:"100%", background:C.white, border:`1px solid ${C.border}`, borderRadius:7, padding:"8px 10px", fontSize:12, color:C.text, resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.55 }}/>
          <div style={{ display:"flex", gap:6, marginTop:7 }}>
            <button onClick={submit} style={{ flex:1, padding:"8px 0", background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`, border:"none", borderRadius:7, color:"white", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              + Add to Knowledge Base
            </button>
            <button onClick={()=>{setPaste(false);setText("");setName("");}} style={{ padding:"8px 12px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, fontSize:12, cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
        {docs.length === 0 && !pasting ? (
          <EmptyState icon="📄" title="No documents yet"
            body="Upload a .md, .txt, or .html file — or paste text — to build your knowledge base."
            action={<button onClick={()=>setPaste(true)} style={{ padding:"8px 20px", background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`, border:"none", borderRadius:8, color:"white", fontSize:12, fontWeight:700, cursor:"pointer" }}>Paste a document</button>}/>
        ) : docs.map((doc: any) => (
          <div key={doc.id} style={{ margin:"4px 10px", padding:"10px 12px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, transition:"all .12s" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
              <span style={{ fontSize:18, flexShrink:0, marginTop:1 }}>
                {doc.name.endsWith(".md") ? "📝" : doc.name.endsWith(".html") ? "🌐" : doc.name.endsWith(".json") ? "📋" : "📄"}
              </span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{doc.name}</div>
                <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                  <Tag color={C.indigo}>{doc.chunkCount} chunks</Tag>
                  <Tag color={C.teal}>{fmt(doc.size)}</Tag>
                  <span style={{ fontSize:10, color:C.faint }}>{fmtAge(doc.addedAt)}</span>
                </div>
              </div>
              <button onClick={()=>onDelete(doc.id)} title="Remove document"
                style={{ background:"none", border:"none", color:C.faint, cursor:"pointer", fontSize:16, flexShrink:0, lineHeight:1, padding:"0 2px" }}
                onMouseEnter={e=>e.currentTarget.style.color=C.rose} onMouseLeave={e=>e.currentTarget.style.color=C.faint}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {docs.length > 0 && (
        <div style={{ padding:"10px 14px", borderTop:`1px solid ${C.border}`, flexShrink:0, background:C.surface }}>
          <div style={{ fontSize:11, color:C.muted }}>
            <strong style={{color:C.text}}>{docs.length}</strong> doc{docs.length!==1?"s":" "} ·{" "}
            <strong style={{color:C.text}}>{docs.reduce((a:number,d:any)=>a+d.chunkCount,0)}</strong> chunks ·{" "}
            <strong style={{color:C.text}}>{(docs.reduce((a:number,d:any)=>a+d.size,0)/1024).toFixed(1)} KB</strong> total
          </div>
        </div>
      )}
    </div>
  );
}
