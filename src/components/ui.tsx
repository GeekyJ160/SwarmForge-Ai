import React from "react";
import { C } from "../theme";

export function Spin({ s = 14, c = C.indigo }) {
  return <span style={{ display:"inline-block", width:s, height:s, border:`2.5px solid ${c}22`, borderTopColor:c, borderRadius:"50%", animation:"amd-spin .7s linear infinite", flexShrink:0 }}/>;
}

export function Skeleton({ h = 14, w = "100%", r = 6, mb = 0 }) {
  return <div style={{ height:h, width:w, borderRadius:r, background:`linear-gradient(90deg,${C.surface} 25%,${C.border} 50%,${C.surface} 75%)`, backgroundSize:"200% 100%", animation:"amd-shimmer 1.4s infinite", marginBottom:mb }}/>;
}

export function Tag({ children, color = C.indigo }: { children: React.ReactNode, color?: string }) {
  return <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:color+"18", color, border:`1px solid ${color}33`, fontWeight:700, letterSpacing:.4 }}>{children}</span>;
}

export function IconBtn({ icon, label, onClick, active, danger, size = "sm" }: any) {
  const pad = size === "sm" ? "5px 10px" : "7px 14px";
  const fz  = size === "sm" ? 11 : 13;
  return (
    <button onClick={onClick} title={label} style={{
      display:"flex", alignItems:"center", gap:5, padding:pad, borderRadius:7,
      border:`1px solid ${active ? C.indigo : danger ? C.rose+"44" : C.border}`,
      background: active ? C.indigo+"0f" : danger ? C.rose+"08" : C.white,
      color: active ? C.indigo : danger ? C.rose : C.muted,
      cursor:"pointer", fontSize:fz, fontWeight:600, transition:"all .15s", whiteSpace:"nowrap",
    }}>{icon} {label}</button>
  );
}

export function EmptyState({ icon, title, body, action }: any) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"40px 24px", gap:12 }}>
      <div style={{ fontSize:44, marginBottom:4 }}>{icon}</div>
      <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{title}</div>
      <div style={{ fontSize:13, color:C.muted, maxWidth:280, lineHeight:1.65 }}>{body}</div>
      {action}
    </div>
  );
}
