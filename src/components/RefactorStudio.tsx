import React, { useState } from "react";
import { C } from "../theme";
import { Spin } from "./ui";
import { callGemini } from "../gemini";

export function RefactorStudio({ onBack }: { onBack: () => void }) {
  const [original, setOriginal] = useState("");
  const [refactored, setRefactored] = useState("");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRefactor = async () => {
    if (!original.trim() || !instruction.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const sys = `You are an expert software engineer. Refactor the provided code according to the user's instructions.
      Return ONLY the raw refactored code. Do not include markdown code blocks (like \`\`\`javascript), explanations, or any other text. Just the code.`;
      const prompt = `Instruction: ${instruction}\n\nOriginal Code:\n${original}`;
      
      const { text } = await callGemini(sys, prompt);
      
      // Clean up markdown blocks if the model still includes them
      let cleanText = text.trim();
      if (cleanText.startsWith("\`\`\`")) {
        const lines = cleanText.split('\n');
        if (lines.length > 1) {
          cleanText = lines.slice(1, lines[lines.length - 1].startsWith("\`\`\`") ? -1 : undefined).join('\n');
        }
      }
      
      setRefactored(cleanText);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      {/* Work Area */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", padding:16, gap:16 }}>
        {/* Left: Original */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.02)" }}>
          <div style={{ padding:"10px 14px", background:C.surface, borderBottom:`1px solid ${C.border}`, fontWeight:600, fontSize:12, color:C.text }}>Original Code</div>
          <textarea 
            value={original} 
            onChange={e=>setOriginal(e.target.value)}
            placeholder="Paste your code here..."
            style={{ flex:1, border:"none", resize:"none", padding:14, fontSize:13, fontFamily:"'SF Mono','Fira Code',monospace", outline:"none", color:C.text, lineHeight:1.5 }}
          />
        </div>

        {/* Right: Refactored */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.ideBg, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
          <div style={{ padding:"10px 14px", background:C.idePanel, borderBottom:`1px solid ${C.ideBorder}`, fontWeight:600, fontSize:12, color:C.ideText, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>Refactored Code</span>
            {loading && <Spin s={12} c={C.ideAccent} />}
          </div>
          <div style={{ flex:1, padding:14, overflowY:"auto", fontSize:13, fontFamily:"'SF Mono','Fira Code',monospace", color:C.ideText, lineHeight:1.5, whiteSpace:"pre-wrap" }}>
            {error ? <span style={{color:C.rose}}>{error}</span> : refactored || <span style={{color:C.ideMuted}}>Refactored output will appear here...</span>}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div style={{ padding:"16px", background:C.white, borderTop:`1px solid ${C.border}`, display:"flex", gap:12, alignItems:"center", flexShrink: 0 }}>
        <input 
          value={instruction}
          onChange={e=>setInstruction(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") handleRefactor(); }}
          placeholder="e.g., 'Convert to TypeScript', 'Optimize performance', 'Add error handling'"
          style={{ flex:1, padding:"12px 16px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, outline:"none", background:C.surface, color:C.text }}
        />
        <button 
          onClick={handleRefactor}
          disabled={loading || !original.trim() || !instruction.trim()}
          style={{ padding:"12px 24px", background:`linear-gradient(135deg,${C.emerald},${C.teal})`, color:"white", border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:(loading || !original.trim() || !instruction.trim())?"default":"pointer", opacity:(loading || !original.trim() || !instruction.trim())?0.6:1, transition:"all .2s" }}
        >
          {loading ? "Refactoring..." : "✨ Refactor"}
        </button>
      </div>
    </div>
  );
}
