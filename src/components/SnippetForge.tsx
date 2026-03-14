import React, { useState } from "react";
import { C } from "../theme";
import { Spin } from "./ui";
import { callGemini } from "../gemini";

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "HTML/CSS", 
  "React", "Node.js", "SQL", "Bash", "Go", "Rust", "C++", "Java"
];

export function SnippetForge({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setGeneratedCode("");
    try {
      const sys = `You are an expert programmer. Generate a concise, high-quality code snippet in ${language} that fulfills the user's request. 
      Return ONLY the raw code. Do not include markdown code blocks (like \`\`\`python), explanations, or any other text. Just the code.`;
      
      const { text } = await callGemini(sys, prompt);
      
      // Clean up markdown blocks if the model still includes them
      let cleanText = text.trim();
      if (cleanText.startsWith("\`\`\`")) {
        const lines = cleanText.split('\n');
        if (lines.length > 1) {
          cleanText = lines.slice(1, lines[lines.length - 1].startsWith("\`\`\`") ? -1 : undefined).join('\n');
        }
      }
      
      setGeneratedCode(cleanText);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      {/* Work Area */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", padding:16, gap:16 }}>
        
        {/* Left: Input */}
        <div style={{ width: 340, display:"flex", flexDirection:"column", background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.02)", flexShrink: 0 }}>
          <div style={{ padding:"10px 14px", background:C.surface, borderBottom:`1px solid ${C.border}`, fontWeight:600, fontSize:12, color:C.text }}>
            Describe your snippet
          </div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Language</label>
              <select 
                value={language} 
                onChange={e=>setLanguage(e.target.value)} 
                style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", background: C.bg, color: C.text, cursor: "pointer" }}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</label>
              <textarea 
                value={prompt} 
                onChange={e=>setPrompt(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                placeholder="e.g., 'A function to debounce API calls' or 'A React hook for local storage'"
                style={{ flex:1, border:`1px solid ${C.border}`, borderRadius: 8, resize:"none", padding:12, fontSize:13, outline:"none", color:C.text, lineHeight:1.5, background: C.bg, fontFamily: "inherit" }}
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              style={{ padding:"12px", background:`linear-gradient(135deg,${C.cyan},${C.indigo})`, color:"white", border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:(loading || !prompt.trim())?"default":"pointer", opacity:(loading || !prompt.trim())?0.6:1, transition:"all .2s", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: "auto" }}
            >
              {loading ? <><Spin s={14} c="white"/> Generating...</> : "✨ Generate Snippet"}
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.ideBg, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
          <div style={{ padding:"10px 14px", background:C.idePanel, borderBottom:`1px solid ${C.ideBorder}`, fontWeight:600, fontSize:12, color:C.ideText, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Generated Code</span>
              {language && <span style={{ fontSize: 10, padding: "2px 6px", background: C.ideFaint, borderRadius: 4, color: C.ideCyan }}>{language}</span>}
            </div>
            <button 
              onClick={handleCopy} 
              disabled={!generatedCode} 
              style={{ background: copied ? C.emerald : "transparent", border: `1px solid ${copied ? C.emerald : C.ideBorder}`, color: copied ? "white" : C.ideText, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: generatedCode ? "pointer" : "default", opacity: generatedCode ? 1 : 0.5, transition: "all .2s", fontWeight: 600 }}
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
          <div style={{ flex:1, padding:16, overflowY:"auto", fontSize:13, fontFamily:"'SF Mono','Fira Code',monospace", color:C.ideText, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
            {error ? <span style={{color:C.rose}}>⚠️ {error}</span> : generatedCode || <span style={{color:C.ideMuted}}>Your snippet will appear here...</span>}
          </div>
        </div>
        
      </div>
    </div>
  );
}
