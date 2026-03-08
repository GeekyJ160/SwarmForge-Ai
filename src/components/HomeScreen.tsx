import React from "react";
import { C } from "../theme";

export function HomeScreen({ onNavigate }: any) {
  const TOOLS = [
    { id:"askdocs", icon:"🔍", label:"Ask My Docs", desc:"RAG-powered Q&A over your documents",      tag:"RAG", color:C.indigo },
    { id:"swarmide",  icon:"⚡", label:"Swarm IDE",  desc:"AI agent swarm code editor & preview",     tag:"IDE", color:C.amber },
    { id:"refactor",icon:"♻️", label:"Refactor Forge", desc:"AI-powered code refactoring and optimization", tag:"CODE", color:C.emerald },
    { id:"eval",    icon:"🧪", label:"Eval & Logs", desc:"Replay queries, score answers, view logs", tag:"OPS", color:C.teal },
  ];

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:`radial-gradient(ellipse at 40% 30%, ${C.indigo}12 0%, ${C.bg} 65%)`, padding:"0 20px" }}>
      <div style={{ textAlign:"center", marginBottom:40, animation:"amd-slide .5s ease both" }}>
        <div style={{ position:"relative", width:80, height:80, margin:"0 auto 16px" }}>
          <div style={{ width:80, height:80, borderRadius:22, background:`linear-gradient(135deg,#1e1b4b,#3730a3,#1d4ed8)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 40px #3730a344, 0 0 0 1px #4f46e522`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,transparent 40%,#f9731622 100%)" }}/>
            <span style={{ fontSize:38, position:"relative", zIndex:1 }}>⚡</span>
            <div style={{ position:"absolute", top:8, right:10, width:6, height:6, borderRadius:"50%", background:"#f97316", boxShadow:"0 0 10px #f97316, 0 0 20px #f97316" }}/>
            <div style={{ position:"absolute", bottom:14, left:10, width:4, height:4, borderRadius:"50%", background:"#fb923c", boxShadow:"0 0 8px #fb923c" }}/>
          </div>
        </div>
        <div className="sf-brand" style={{ fontWeight:900, fontSize:30, letterSpacing:-1.5, color:C.text }}>
          <span style={{ color:C.indigo }}>Swarm</span><span style={{ color:C.amber }}>Forge</span> <span style={{ color:C.text, fontWeight:700 }}>AI</span>
        </div>
        <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>Choose a tool to get started</div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", maxWidth:340 }}>
        {TOOLS.map((t, i) => (
          <button key={t.id} onClick={()=>onNavigate(t.id)}
            style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:C.white, border:`1.5px solid ${C.border}`, borderRadius:14, cursor:"pointer", textAlign:"left", transition:"all .18s", boxShadow:"0 2px 8px rgba(0,0,0,.05)", animation:`amd-slide .4s ${i*.07}s both` }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=t.color; e.currentTarget.style.boxShadow=`0 4px 20px ${t.color}22`; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.05)"; e.currentTarget.style.transform="translateY(0)"; }}>
            <div style={{ width:42, height:42, borderRadius:11, background:`${t.color}15`, border:`1px solid ${t.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{t.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{t.label}</span>
                <span style={{ fontSize:9, padding:"2px 6px", borderRadius:6, background:t.color+"18", color:t.color, fontWeight:700, border:`1px solid ${t.color}33` }}>{t.tag}</span>
              </div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.4 }}>{t.desc}</div>
            </div>
            <span style={{ color:C.faint, fontSize:16, flexShrink:0 }}>›</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop:28, fontSize:11, color:C.faint, textAlign:"center" }}>SwarmForge AI · Agent Swarm v1.0 · All tools run in-browser</div>
    </div>
  );
}
