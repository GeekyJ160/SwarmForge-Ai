import React, { useState, useRef, useEffect } from "react";
import { C as ThemeC } from "../theme";
import { Spin } from "./ui";
import { callGemini } from "../gemini";

const THEMES = {
  dark: {
    name: "Dark (Default)",
    bg:       "#080a14",
    panel:    "#0d0f1e",
    sidebar:  "#070910",
    border:   "#181b30",
    text:     "#c8d0ec",
    muted:    "#404870",
    faint:    "#232748",
    accent:   "#4f46e5",
    green:    "#22c55e",
    amber:    "#f97316",
    cyan:     "#38bdf8",
    violet:   "#a78bfa",
    rose:     "#fb7185",
    active:   "#161928",
    hover:    "#12152a",
    orange:   "#fb923c",
  },
  light: {
    name: "Light",
    bg:       "#f8fafc",
    panel:    "#ffffff",
    sidebar:  "#f1f5f9",
    border:   "#e2e8f0",
    text:     "#0f172a",
    muted:    "#64748b",
    faint:    "#e2e8f0",
    accent:   "#3b82f6",
    green:    "#16a34a",
    amber:    "#ea580c",
    cyan:     "#0284c7",
    violet:   "#7c3aed",
    rose:     "#e11d48",
    active:   "#e2e8f0",
    hover:    "#f1f5f9",
    orange:   "#f97316",
  },
  dracula: {
    name: "Dracula",
    bg:       "#282a36",
    panel:    "#21222c",
    sidebar:  "#1e1f29",
    border:   "#44475a",
    text:     "#f8f8f2",
    muted:    "#6272a4",
    faint:    "#44475a",
    accent:   "#ff79c6",
    green:    "#50fa7b",
    amber:    "#ffb86c",
    cyan:     "#8be9fd",
    violet:   "#bd93f9",
    rose:     "#ff5555",
    active:   "#44475a",
    hover:    "#44475a88",
    orange:   "#ffb86c",
  }
};

const FONTS = [
  { name: "SF Mono / Fira Code", value: "'SF Mono','Fira Code','Cascadia Code',monospace" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { name: "Consolas", value: "Consolas, monospace" },
  { name: "Ubuntu Mono", value: "'Ubuntu Mono', monospace" },
];

const QUICK_PROMPTS = [
  { icon:"📊", label:"Dashboard" },
  { icon:"🏠", label:"Landing Page" },
  { icon:"🔐", label:"Auth Form" },
  { icon:"🛒", label:"E-Commerce" },
];

export function SwarmForgeIDE() {
  const [showSettings, setShowSettings] = useState(false);
  const [ideTheme, setIdeTheme] = useState<keyof typeof THEMES>("dark");
  const [ideFont, setIdeFont] = useState(FONTS[0].value);
  const [ideFontSize, setIdeFontSize] = useState(13);

  const T = THEMES[ideTheme];
  const C = {
    ...ThemeC,
    ideBg: T.bg,
    idePanel: T.panel,
    ideSidebar: T.sidebar,
    ideBorder: T.border,
    ideText: T.text,
    ideMuted: T.muted,
    ideFaint: T.faint,
    ideAccent: T.accent,
    ideGreen: T.green,
    ideAmber: T.amber,
    ideCyan: T.cyan,
    ideViolet: T.violet,
    ideRose: T.rose,
    ideActive: T.active,
    ideHover: T.hover,
    ideOrange: T.orange,
  };

  const IDE_FILES = [
    { name:"index.html", icon:"🌐", color:C.ideCyan,   lang:"html" },
    { name:"styles.css", icon:"🎨", color:"#f472b6",   lang:"css"  },
    { name:"app.js",     icon:"⚡", color:C.ideAmber,  lang:"js"   },
    { name:"README.md",  icon:"📝", color:C.ideMuted,  lang:"md"   },
  ];

  const AGENTS = [
    { name:"Architect", icon:"🏛️", color:C.ideViolet },
    { name:"Engineer",  icon:"🔧", color:C.ideCyan    },
    { name:"Designer",  icon:"🎨", color:"#f472b6"    },
    { name:"Creative",  icon:"💡", color:C.ideAmber   },
    { name:"Tester",    icon:"🧪", color:C.ideGreen   },
  ];

  const [activeFile, setActiveFile]   = useState("index.html");
  const [activeTab, setActiveTab]     = useState("code"); // code | preview
  const [swarmOn, setSwarmOn]         = useState(true);
  const [prompt, setPrompt]           = useState("");
  const [chatMsgs, setChatMsgs]       = useState([
    { role:"system", text:"⚡ SwarmForge Agent Swarm is online.\nTell the swarm what to build." }
  ]);
  const [loading, setLoading]         = useState(false);
  const [generatedCode, setGenCode]   = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const filteredFiles = IDE_FILES.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(()=>{ chatRef.current?.scrollTo({top:99999,behavior:"smooth"}); },[chatMsgs,loading]);

  const sendPrompt = async () => {
    if (!prompt.trim() || loading) return;
    const msg = prompt.trim();
    setPrompt(""); setLoading(true);
    setChatMsgs(m=>[...m, { role:"user", text:msg }]);

    try {
      const sys = `You are SwarmForge's 5-agent swarm (Architect, Engineer, Designer, Creative, Tester). The user wants to build a web app component.
Respond in this format:
**🏛️ Architect**: [brief plan - 1 sentence]
**🔧 Engineer**: [key implementation notes - 1 sentence]  
**🎨 Designer**: [styling approach - 1 sentence]
**💡 Creative**: [unique enhancement - 1 sentence]
**🧪 Tester**: [test consideration - 1 sentence]

Then write a complete, beautiful HTML file with embedded CSS and JS that implements the request. Make it visually impressive with a dark theme.`;
      const { text } = await callGemini(sys, msg);

      // Extract code block if present
      const codeMatch = text.match(/```html([\s\S]*?)```/i) || text.match(/<!DOCTYPE[\s\S]*/i);
      if (codeMatch) {
        setGenCode(codeMatch[1]?.trim() || codeMatch[0]);
      }
      setChatMsgs(m=>[...m, { role:"swarm", text }]);
    } catch(e: any) {
      setChatMsgs(m=>[...m, { role:"error", text:`⚠️ Swarm error: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.ideBg, color:C.ideText, fontFamily:ideFont }}>

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex", alignItems:"center", padding:"0 12px", height:48, background:C.idePanel, borderBottom:`1px solid ${C.ideBorder}`, gap:8, flexShrink:0 }}>
        {/* URL bar */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, background:C.ideBg, border:`1px solid ${C.ideBorder}`, borderRadius:8, padding:"6px 12px", maxWidth:240 }}>
          <span style={{ color:C.ideMuted, fontSize:12 }}>/</span>
          <span style={{ fontSize:11, color:C.ideMuted }}>index.html</span>
        </div>
        {/* Controls */}
        <button style={{ padding:"5px 10px", background:C.ideFaint, border:`1px solid ${C.ideBorder}`, borderRadius:7, color:C.ideMuted, fontSize:13, cursor:"pointer" }}>↻</button>
        <button style={{ padding:"5px 10px", background:C.ideFaint, border:`1px solid ${C.ideBorder}`, borderRadius:7, color:C.ideMuted, fontSize:13, cursor:"pointer" }}>⬇</button>
        <button style={{ padding:"5px 14px", background:"white", border:"none", borderRadius:8, color:C.ideBg, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:.2 }}>Publish</button>
        <button style={{ padding:"5px 10px", background:"none", border:"none", color:C.ideMuted, fontSize:16, cursor:"pointer" }}>✕</button>
      </div>

      {/* ── APP BAR ── */}
      <div style={{ display:"flex", alignItems:"center", padding:"0 14px", height:44, background:C.idePanel, borderBottom:`1px solid ${C.ideBorder}`, gap:10, flexShrink:0 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,#1e1b4b,#3730a3,#1d4ed8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, position:"relative", boxShadow:`0 0 12px ${C.ideAccent}44` }}>
            <span>⚡</span>
            <div style={{ position:"absolute", top:4, right:4, width:4, height:4, borderRadius:"50%", background:C.ideAmber, boxShadow:`0 0 6px ${C.ideAmber}` }}/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:13, letterSpacing:-.3, lineHeight:1 }}>
              <span style={{ color:"#818cf8" }}>Swarm</span><span style={{ color:C.ideAmber }}>Forge</span>
            </div>
            <div style={{ fontSize:9, color:C.ideMuted, letterSpacing:.5, textTransform:"uppercase" }}>SWARM v1.0</div>
          </div>
        </div>

        {/* Code / Preview tabs */}
        <button onClick={()=>setActiveTab("code")} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:8, background:activeTab==="code"?C.ideAccent:"transparent", border:`1px solid ${activeTab==="code"?C.ideAccent:C.ideBorder}`, color:activeTab==="code"?"white":C.ideMuted, fontSize:12, fontWeight:700, cursor:"pointer" }}>
          🔗 Code
        </button>
        <button onClick={()=>setActiveTab("preview")} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:8, background:"transparent", border:`1px solid ${C.ideBorder}`, color:activeTab==="preview"?C.ideCyan:C.ideMuted, fontSize:12, fontWeight:600, cursor:"pointer" }}>
          👁 Preview
        </button>

        <div style={{flex:1}}/>

        {/* Swarm toggle */}
        <button onClick={()=>setSwarmOn(s=>!s)} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 14px", borderRadius:8, border:`1.5px solid ${swarmOn?C.ideGreen:C.ideBorder}`, background:swarmOn?C.ideGreen+"15":"transparent", color:swarmOn?C.ideGreen:C.ideMuted, fontSize:12, fontWeight:700, cursor:"pointer" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:swarmOn?C.ideGreen:C.ideMuted, display:"inline-block", boxShadow:swarmOn?`0 0 6px ${C.ideGreen}`:"none" }}/>
          Swarm {swarmOn?"ON":"OFF"}
        </button>
        <button onClick={()=>setShowSettings(true)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:8, border:`1px solid ${C.ideBorder}`, background:"transparent", color:C.ideMuted, fontSize:14, cursor:"pointer" }}>
          ⚙️
        </button>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width:200, flexShrink:0, background:C.ideSidebar, borderRight:`1px solid ${C.ideBorder}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Explorer header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:`1px solid ${C.ideBorder}` }}>
            <span style={{ fontSize:10, fontWeight:700, color:C.ideMuted, letterSpacing:1.2, textTransform:"uppercase" }}>Explorer</span>
            <button style={{ background:"none", border:"none", color:C.ideAccent, fontSize:18, cursor:"pointer", lineHeight:1, padding:0 }}>+</button>
          </div>

          {/* Search bar */}
          <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.ideBorder}` }}>
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.ideBorder}`, background: C.ideBg, color: C.ideText, fontSize: 11, outline: "none" }}
            />
          </div>

          {/* File list */}
          <div style={{ flex:1, padding:"6px 0", overflowY:"auto" }}>
            {filteredFiles.map(f => (
              <button key={f.name} onClick={()=>setActiveFile(f.name)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"7px 14px", background:activeFile===f.name?C.ideActive:"transparent", border:"none", cursor:"pointer", textAlign:"left", borderLeft:activeFile===f.name?`2px solid ${C.ideAccent}`:"2px solid transparent", transition:"all .1s" }}
                onMouseEnter={e=>{ if(activeFile!==f.name) e.currentTarget.style.background=C.ideHover; }}
                onMouseLeave={e=>{ if(activeFile!==f.name) e.currentTarget.style.background="transparent"; }}>
                <span style={{ fontSize:14, flexShrink:0 }}>{f.icon}</span>
                <span style={{ fontSize:12, color:activeFile===f.name?"white":f.color, fontWeight:activeFile===f.name?600:400, fontFamily:ideFont }}>{f.name}</span>
              </button>
            ))}
          </div>

          {/* Agents online */}
          <div style={{ borderTop:`1px solid ${C.ideBorder}`, padding:"8px 0 6px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:C.ideMuted, letterSpacing:1.2, textTransform:"uppercase", padding:"0 14px 6px" }}>Agents Online</div>
            {AGENTS.map(a => (
              <div key={a.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:13 }}>{a.icon}</span>
                  <span style={{ fontSize:12, color:a.color, fontWeight:600 }}>{a.name}</span>
                </div>
                <span style={{ width:7, height:7, borderRadius:"50%", background:swarmOn?C.ideGreen:C.ideMuted, display:"inline-block", flexShrink:0, boxShadow:swarmOn?`0 0 5px ${C.ideGreen}`:"none" }}/>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER: Code Editor ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", borderRight:`1px solid ${C.ideBorder}` }}>
          {/* Editor tab bar */}
          <div style={{ display:"flex", alignItems:"center", background:C.idePanel, borderBottom:`1px solid ${C.ideBorder}`, flexShrink:0, overflowX:"auto" }}>
            {IDE_FILES.map(f => (
              <button key={f.name} onClick={()=>setActiveFile(f.name)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:activeFile===f.name?C.ideBg:"transparent", border:"none", borderRight:`1px solid ${C.ideBorder}`, borderBottom:activeFile===f.name?`1.5px solid ${C.ideAccent}`:"1.5px solid transparent", color:activeFile===f.name?"white":C.ideMuted, cursor:"pointer", fontSize:12, whiteSpace:"nowrap", transition:"all .1s" }}>
                <span style={{ fontSize:12 }}>{f.icon}</span>
                <span style={{ fontFamily:ideFont, color:activeFile===f.name?f.color:C.ideMuted }}>{f.name}</span>
              </button>
            ))}
          </div>

          {/* Code area */}
          <div style={{ flex:1, overflow:"auto", padding:"16px 20px", background:C.ideBg }}>
            {activeTab === "preview" && generatedCode ? (
              <div style={{ width:"100%", height:"100%", background:"white", borderRadius:8, overflow:"hidden" }}>
                <iframe srcDoc={generatedCode} style={{ width:"100%", height:"100%", border:"none" }} title="preview"/>
              </div>
            ) : (
              <pre style={{ margin:0, fontSize:ideFontSize, lineHeight:1.75, color:C.ideText, fontFamily:ideFont }}>
                {generatedCode ? (
                  <code style={{ color:C.ideText }}>{generatedCode.slice(0,2000)}{generatedCode.length>2000?"…":""}</code>
                ) : (
                  <span>
                    <span style={{color:C.ideMuted}}>{"<!-- "}</span>
                    <span style={{color:C.ideAccent}}>SwarmForge</span>
                    <span style={{color:C.ideMuted}}>{" — ask the swarm to build something → "}</span>{"\n\n"}
                    <span style={{color:C.ideMuted}}>{"<!DOCTYPE html>"}{"\n"}</span>
                    <span style={{color:"#fb7185"}}>{"<html"}</span>
                    <span style={{color:C.ideCyan}}>{" lang"}</span>
                    <span style={{color:"white"}}>{"="}</span>
                    <span style={{color:C.ideGreen}}>{'"en"'}</span>
                    <span style={{color:"#fb7185"}}>{">"}</span>{"\n"}
                    <span style={{color:"#fb7185"}}>{"  <head>"}</span>{"\n"}
                    <span style={{color:C.ideMuted}}>{"    <!-- Generated by SwarmForge Agent Swarm -->"}</span>{"\n"}
                    <span style={{color:"#fb7185"}}>{"  </head>"}</span>{"\n"}
                    <span style={{color:"#fb7185"}}>{"  <body>"}</span>{"\n"}
                    <span style={{color:C.ideMuted}}>{"    <!-- Your component will appear here -->"}</span>{"\n"}
                    <span style={{color:"#fb7185"}}>{"  </body>"}</span>{"\n"}
                    <span style={{color:"#fb7185"}}>{"</html>"}</span>
                  </span>
                )}
              </pre>
            )}
          </div>
        </div>

        {/* ── RIGHT: Swarm Chat ── */}
        <div style={{ width:300, flexShrink:0, display:"flex", flexDirection:"column", background:C.idePanel, overflow:"hidden" }}>

          {/* Swarm header */}
          <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${C.ideBorder}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.ideViolet},${C.ideAccent})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🧠</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>
                  <span style={{ color:"#818cf8" }}>Swarm</span><span style={{ color:"#f97316" }}>Forge</span> <span style={{ color:"white" }}>Agents</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:swarmOn?C.ideGreen:C.ideMuted, display:"inline-block", boxShadow:swarmOn?`0 0 5px ${C.ideGreen}`:"none" }}/>
                  <span style={{ fontSize:11, color:swarmOn?C.ideGreen:C.ideMuted, fontWeight:600 }}>{swarmOn?"5 specialists online":"Swarm offline"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"12px 12px 0" }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ marginBottom:10 }}>
                {m.role === "system" && (
                  <div style={{ background:C.ideAccent+"18", border:`1px solid ${C.ideAccent}33`, borderRadius:10, padding:"10px 12px", fontSize:12, color:C.ideText, lineHeight:1.6, whiteSpace:"pre-line" }}>
                    {m.text}
                  </div>
                )}
                {m.role === "user" && (
                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <div style={{ maxWidth:"85%", background:`linear-gradient(135deg,${C.ideAccent},${C.ideCyan})`, borderRadius:"10px 2px 10px 10px", padding:"8px 12px", fontSize:12, color:"white", lineHeight:1.5 }}>
                      {m.text}
                    </div>
                  </div>
                )}
                {m.role === "swarm" && (
                  <div style={{ background:C.ideFaint+"88", border:`1px solid ${C.ideBorder}`, borderRadius:"2px 10px 10px 10px", padding:"10px 12px", fontSize:11.5, color:C.ideText, lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                    {m.text.slice(0, 600)}{m.text.length > 600 ? "…" : ""}
                  </div>
                )}
                {m.role === "error" && (
                  <div style={{ background:C.ideRose+"15", border:`1px solid ${C.ideRose}44`, borderRadius:8, padding:"8px 12px", fontSize:12, color:C.ideRose }}>
                    {m.text}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <div style={{ flex:1, background:C.ideFaint+"55", border:`1px solid ${C.ideBorder}`, borderRadius:"2px 10px 10px 10px", padding:"10px 12px" }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:7 }}>
                    {AGENTS.map((a,i)=>(
                      <span key={i} style={{ fontSize:13, animation:`amd-pulse ${.3+i*.12}s ease-in-out infinite alternate` }}>{a.icon}</span>
                    ))}
                  </div>
                  <div style={{ height:8, background:C.ideBorder, borderRadius:4, marginBottom:6, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:`linear-gradient(90deg,${C.ideAccent},${C.ideCyan})`, width:"60%", animation:"amd-shimmer 1.2s infinite", backgroundSize:"200% 100%" }}/>
                  </div>
                  <div style={{ height:8, background:C.ideBorder, borderRadius:4, width:"75%", overflow:"hidden" }}>
                    <div style={{ height:"100%", background:`linear-gradient(90deg,${C.ideViolet},${C.ideAccent})`, width:"40%", animation:"amd-shimmer 1.5s infinite", backgroundSize:"200% 100%" }}/>
                  </div>
                </div>
              </div>
            )}
            <div style={{height:4}}/>
          </div>

          {/* Quick prompts */}
          <div style={{ padding:"8px 12px 0", flexShrink:0 }}>
            <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:6 }}>
              {QUICK_PROMPTS.map(q=>(
                <button key={q.label} onClick={()=>setPrompt(q.label)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", background:C.ideFaint, border:`1px solid ${C.ideBorder}`, borderRadius:20, color:C.ideText, fontSize:11, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all .15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.ideAccent; e.currentTarget.style.color="white"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.ideBorder; e.currentTarget.style.color=C.ideText; }}>
                  <span>{q.icon}</span> {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{ padding:"8px 12px 12px", flexShrink:0 }}>
            <div style={{ display:"flex", gap:7, background:C.ideBg, border:`1px solid ${C.ideBorder}`, borderRadius:10, padding:"8px 10px", transition:"border-color .2s" }}
              onFocusCapture={e=>e.currentTarget.style.borderColor=C.ideAccent}
              onBlurCapture={e=>e.currentTarget.style.borderColor=C.ideBorder}>
              <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendPrompt();} }}
                disabled={loading}
                placeholder="Tell the swarm what to build…"
                rows={2}
                style={{ flex:1, background:"none", border:"none", resize:"none", color:"white", fontSize:12, lineHeight:1.5, outline:"none", fontFamily:"inherit" }}/>
              <button onClick={sendPrompt} disabled={loading || !prompt.trim()}
                style={{ alignSelf:"flex-end", width:32, height:32, borderRadius:8, border:"none", cursor:prompt.trim()&&!loading?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                  background: prompt.trim() && !loading ? `linear-gradient(135deg,${C.ideAccent},${C.ideCyan})` : C.ideFaint,
                  color: prompt.trim() && !loading ? "white" : C.ideMuted, transition:"all .2s", flexShrink:0 }}>
                {loading ? <Spin s={12} c={C.ideAccent}/> : "→"}
              </button>
            </div>
            <div style={{ fontSize:9.5, color:C.ideMuted, textAlign:"center", marginTop:5 }}>Enter to send · Powered by Gemini</div>
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{ display:"flex", alignItems:"center", padding:"0 14px", height:28, background:C.ideSidebar, borderTop:`1px solid ${C.ideBorder}`, flexShrink:0, gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10, color:C.ideMuted }}>⚡</span>
          <span style={{ fontSize:10, fontWeight:700, color:C.ideViolet }}>SwarmForge v1.0</span>
        </div>
        <div style={{ width:1, height:12, background:C.ideBorder }}/>
        <span style={{ fontSize:10, color:C.ideMuted, fontFamily:ideFont }}>{activeFile}</span>
        <div style={{ width:1, height:12, background:C.ideBorder }}/>
        <span style={{ fontSize:10, color:C.ideMuted }}>4 files</span>
        <div style={{flex:1}}/>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10, color:C.ideMuted }}>Swarm: 5 agents</span>
          <div style={{ width:1, height:12, background:C.ideBorder }}/>
          <span style={{ width:6, height:6, borderRadius:"50%", background:swarmOn?C.ideGreen:C.ideMuted, display:"inline-block" }}/>
          <span style={{ fontSize:10, fontWeight:700, color:swarmOn?C.ideGreen:C.ideMuted }}>
            {swarmOn?"Ready":"Offline"}
          </span>
        </div>
      </div>

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:400, background:C.idePanel, border:`1px solid ${C.ideBorder}`, borderRadius:12, padding:20, boxShadow:`0 10px 30px rgba(0,0,0,0.3)`, color:C.ideText, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:16 }}>IDE Settings</h3>
              <button onClick={()=>setShowSettings(false)} style={{ background:"none", border:"none", color:C.ideMuted, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.ideMuted, marginBottom:8 }}>Color Theme</label>
              <select value={ideTheme} onChange={e=>setIdeTheme(e.target.value as keyof typeof THEMES)} style={{ width:"100%", padding:8, borderRadius:6, background:C.ideBg, border:`1px solid ${C.ideBorder}`, color:C.ideText, outline:"none" }}>
                {Object.entries(THEMES).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.ideMuted, marginBottom:8 }}>Font Family</label>
              <select value={ideFont} onChange={e=>setIdeFont(e.target.value)} style={{ width:"100%", padding:8, borderRadius:6, background:C.ideBg, border:`1px solid ${C.ideBorder}`, color:C.ideText, outline:"none" }}>
                {FONTS.map(f => (
                  <option key={f.name} value={f.value}>{f.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.ideMuted, marginBottom:8 }}>Font Size ({ideFontSize}px)</label>
              <input type="range" min={11} max={18} step={1} value={ideFontSize} onChange={e=>setIdeFontSize(parseInt(e.target.value))} style={{ width:"100%", cursor:"pointer" }} />
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={()=>setShowSettings(false)} style={{ padding:"8px 16px", background:C.ideAccent, color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600 }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
