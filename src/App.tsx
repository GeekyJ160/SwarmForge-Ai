import React, { useState, useCallback } from "react";
import { C } from "./theme";
import { RAG } from "./rag";
import { SAMPLE_DOC } from "./data";
import { HomeScreen } from "./components/HomeScreen";
import { DocPanel } from "./components/DocPanel";
import { ChatView } from "./components/ChatView";
import { EvalPanel } from "./components/EvalPanel";
import { SwarmForgeIDE } from "./components/SwarmForgeIDE";
import { RefactorStudio } from "./components/RefactorStudio";

export default function SwarmForgeAI() {
  const [screen, setScreen] = useState("home");
  const [docs, setDocs]     = useState<any[]>([]);
  const [queryLog, setQL]   = useState<any[]>([]);
  const [activeTab, setTab] = useState("chat");
  const [toasts, setToasts] = useState<any[]>([]);

  const toast = useCallback((msg: string, type="ok")=>{
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3500);
  },[]);

  const addDoc = useCallback((name: string, text: string) => {
    try {
      const doc = RAG.ingestDoc(name, text);
      setDocs(d => [...d, doc]);
      toast(`✓ "${name}" added — ${doc.chunkCount} chunks indexed`);
    } catch(e: any) {
      toast(`Failed to index "${name}": ${e.message}`, "err");
    }
  }, [toast]);

  const deleteDoc = useCallback((id: number) => {
    setDocs(d => d.filter(x => x.id !== id));
    toast("Document removed", "warn");
  }, [toast]);

  const loadSample = useCallback(() => addDoc("swarmforge-docs.md", SAMPLE_DOC), [addDoc]);
  const logQuery = useCallback((entry: any) => setQL(l => [...l, entry]), []);

  const handleNavigate = (id: string) => {
    if (id === "eval") { setTab("eval"); setScreen("askdocs"); }
    else if (id === "swarmide") setScreen("swarmide");
    else if (id === "refactor") setScreen("refactor");
    else setScreen(id);
  };

  const GLOBAL_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
    @keyframes amd-spin { to { transform:rotate(360deg); } }
    @keyframes amd-shimmer { 0% {background-position:200%}100% {background-position:-200%} }
    @keyframes amd-slide { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes amd-toast { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes amd-pulse { from{opacity:.4;transform:scale(.9)} to{opacity:1;transform:scale(1.1)} }
    @keyframes sf-spark { 0% {opacity:0;transform:scale(0) translate(0,0)} 50%{opacity:1} 100% {opacity:0;transform:scale(1.5) translate(var(--tx),var(--ty))} }
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:#d8daf0;border-radius:2px}
    .ide-scroll::-webkit-scrollbar-thumb{background:#181b30;border-radius:2px}
    textarea,input{outline:none;font-family:inherit;} button{font-family:inherit;}
    .sf-brand { font-family: 'Syne', system-ui, sans-serif; }
  `;

  const ToastLayer = ({ top }: { top: number }) => (
    <div style={{ position:"fixed", top, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", gap:7, zIndex:9999, pointerEvents:"none", alignItems:"center" }}>
      {toasts.map(n=>(
        <div key={n.id} style={{ padding:"9px 22px", borderRadius:20, fontSize:13, fontWeight:600, whiteSpace:"nowrap", background:n.type==="err"?C.rose:n.type==="warn"?C.amber:C.emerald, color:"white", boxShadow:"0 6px 24px rgba(0,0,0,.18)", animation:"amd-toast .3s ease" }}>{n.msg}</div>
      ))}
    </div>
  );

  // HOME
  if (screen === "home") {
    return (
      <div style={{ height:"100vh", width:"100%", fontFamily:"'Segoe UI',system-ui,sans-serif", overflow:"hidden" }}>
        <style>{GLOBAL_STYLES}</style>
        <HomeScreen onNavigate={handleNavigate}/>
        <ToastLayer top={20}/>
      </div>
    );
  }

  // SWARMFORGE IDE
  if (screen === "swarmide") {
    return (
      <div style={{ height:"100vh", width:"100%", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
        <style>{GLOBAL_STYLES}</style>
        {/* Back nav bar */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 12px", height:36, background:C.ideSidebar, borderBottom:`1px solid ${C.ideBorder}`, flexShrink:0, zIndex:10 }}>
          <button onClick={()=>setScreen("home")} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:7, border:`1px solid ${C.ideBorder}`, background:C.ideFaint, color:C.ideMuted, fontSize:11, fontWeight:600, cursor:"pointer" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.ideAccent; e.currentTarget.style.color=C.ideAccent; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.ideBorder; e.currentTarget.style.color=C.ideMuted; }}>
            ← Home
          </button>
          <span style={{ color:C.ideBorder, fontSize:14 }}>|</span>
          <span style={{ fontSize:11, color:C.ideMuted }}>Swarm IDE · Agent Swarm v1.0</span>
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <SwarmForgeIDE/>
        </div>
        <ToastLayer top={44}/>
      </div>
    );
  }

  // REFACTOR STUDIO
  if (screen === "refactor") {
    return (
      <div style={{ height:"100vh", width:"100%", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 12px", height:44, background:C.white, borderBottom:`1px solid ${C.border}`, flexShrink:0, zIndex:10 }}>
          <button onClick={()=>setScreen("home")} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.muted, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.amber; e.currentTarget.style.color=C.amber; e.currentTarget.style.background=C.amber+"0f"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted; e.currentTarget.style.background=C.surface; }}>
            ← Home
          </button>
          <span style={{ color:C.border, fontSize:16 }}>|</span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:`linear-gradient(135deg,${C.indigo},${C.amber})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>♻️</div>
            <span style={{ fontWeight:800, fontSize:14, color:C.text }}>Refactor Forge</span>
            <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:C.amber+"18", color:C.amber, border:`1px solid ${C.amber}33`, fontWeight:700, letterSpacing:.4 }}>CODE</span>
          </div>
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <RefactorStudio onBack={() => setScreen("home")} />
        </div>
        <ToastLayer top={52}/>
      </div>
    );
  }

  // ASK MY DOCS
  return (
    <div style={{ height:"100vh", width:"100%", display:"flex", flexDirection:"column", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", overflow:"hidden", color:C.text }}>
      <style>{GLOBAL_STYLES}</style>
      
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, flexShrink:0, boxShadow:"0 1px 6px rgba(0,0,0,.05)" }}>
        <div style={{ display:"flex", alignItems:"center", padding:"0 12px", height:46, gap:8, minWidth:0 }}>
          <button onClick={()=>setScreen("home")} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.muted, fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0, transition:"all .15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.indigo; e.currentTarget.style.color=C.indigo; e.currentTarget.style.background=C.indigo+"0f"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted; e.currentTarget.style.background=C.surface; }}>
            ← Home
          </button>
          <span style={{ color:C.border, fontSize:16, flexShrink:0 }}>|</span>
          <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:`linear-gradient(135deg,${C.indigo},#1d4ed8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, boxShadow:`0 0 10px ${C.indigo}44` }}>🔍</div>
            <span style={{ fontWeight:800, fontSize:14, color:C.text, whiteSpace:"nowrap" }}>Ask My Docs</span>
            <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:C.indigo+"18", color:C.indigo, border:`1px solid ${C.indigo}33`, fontWeight:700, letterSpacing:.4 }}>RAG</span>
          </div>
          <div style={{flex:1}}/>
          <span style={{ fontSize:11, color:docs.length?C.emerald:C.faint, fontWeight:600, display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:docs.length?C.emerald:C.faint, display:"inline-block" }}/>
            {docs.length ? `${docs.length} doc${docs.length!==1?"s":""}` : "No docs"}
          </span>
        </div>

        <div style={{ display:"flex", borderTop:`1px solid ${C.border}` }}>
          {[["chat","💬 Chat"],["eval","🧪 Eval & Logs"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 16px", background:"transparent", border:"none", cursor:"pointer", color:activeTab===v?C.indigo:C.muted, fontWeight:activeTab===v?700:500, fontSize:13, borderBottom:activeTab===v?`2px solid ${C.indigo}`:"2px solid transparent", transition:"all .15s", position:"relative" }}>
              {l}
              {v==="eval"&&queryLog.length>0&&<span style={{ position:"absolute", top:5, right:6, minWidth:14, height:14, borderRadius:7, background:C.indigo, color:"white", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>{queryLog.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "chat" && (
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          <div style={{ width:260, flexShrink:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <DocPanel docs={docs} onAdd={addDoc} onDelete={deleteDoc} onLoadSample={loadSample}/>
          </div>
          <div style={{ width:1, background:C.border, flexShrink:0 }}/>
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <ChatView docs={docs} queryLog={queryLog} onLogQuery={logQuery}/>
          </div>
        </div>
      )}

      {activeTab === "eval" && (
        <div style={{ flex:1, overflow:"hidden" }}>
          <EvalPanel docs={docs} queryLog={queryLog}/>
        </div>
      )}

      <ToastLayer top={60}/>
    </div>
  );
}
