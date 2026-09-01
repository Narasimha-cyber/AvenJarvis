"use client";
import { useEffect, useRef, useState } from "react";

const AGENTS = {
  KRISHNA: { icon:"🦚", color:"#ff8c00", dharma:"Krishna Eluru" },
  DRAUPADI: { icon:"👸", color:"#ff69b4", dharma:"Shopping queen" },
  ARJUNA: { icon:"🏹", color:"#00aaff", dharma:"Coding warrior" },
  BHIMA: { icon:"🍯", color:"#ffaa00", dharma:"Food" },
  SAHADEVA: { icon:"🗺️", color:"#00ffaa", dharma:"Travel" },
  NAKULA: { icon:"🌿", color:"#55ff55", dharma:"Health" },
  KUBERA: { icon:"💰", color:"#ffff00", dharma:"Money" },
  VYASA: { icon:"📚", color:"#ffffff", dharma:"Study" },
  GANDHARVA: { icon:"🎵", color:"#ff00ff", dharma:"Music" },
  KARNA: { icon:"⚔️", color:"#ff0000", dharma:"Fighter" },
  YUDHISHTIRA: { icon:"🕊️", color:"#aaffff", dharma:"Peace" },
};

const VOICE = { pitch:0.52, rate:0.48, lang:"te-IN" };

export default function AvenJarvisSingle() {
  const mountRef = useRef(null);
  const [active, setActive] = useState("KRISHNA");
  const [status, setStatus] = useState("Dharmo Rakshati Rakshitah Prabhu 🙏");
  const [reply, setReply] = useState("Eluru nunchi siddham Prabhu... Jarvis face loading...");
  const [input, setInput] = useState("");

  useEffect(()=>{
    let cancelled=false;
    const load = async ()=>{
      const THREE = await import("three");
      if(cancelled ||!mountRef.current) return;
      const scene=new THREE.Scene(); scene.fog=new THREE.Fog(0x020210,2,8);
      const camera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,1000); camera.position.z=3.2;
      const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setSize(window.innerWidth,window.innerHeight);
      mountRef.current.innerHTML=""; mountRef.current.appendChild(renderer.domElement);
      const head=new THREE.Mesh(new THREE.SphereGeometry(1,64,64), new THREE.MeshStandardMaterial({color:0x1e90ff,wireframe:true,transparent:true,opacity:0.5,emissive:0x0044ff})); scene.add(head);
      const core=new THREE.Mesh(new THREE.SphereGeometry(0.35,32,32), new THREE.MeshBasicMaterial({color:0xff7f00})); scene.add(core);
      const mGeo=new THREE.BufferGeometry(); const cnt=3000; const pos=new Float32Array(cnt*3); for(let i=0;i<cnt*3;i++) pos[i]=(Math.random()-0.5)*12; mGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const mounts=new THREE.Points(mGeo,new THREE.PointsMaterial({color:0xffd700,size:0.03})); mounts.position.y=-1.5; scene.add(mounts);
      scene.add(new THREE.AmbientLight(0x2233ff,0.6));
      const orbs=[]; Object.keys(AGENTS).forEach((k,i)=>{ const col=new THREE.Color(AGENTS[k].color); const o=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,16), new THREE.MeshBasicMaterial({color:col})); o.userData={key:k, angle:(i/11)*Math.PI*2, baseY:Math.sin(i)*0.5}; scene.add(o); orbs.push(o); });
      let t=0; const anim=()=>{ if(cancelled) return; requestAnimationFrame(anim); t+=0.012; head.rotation.y+=0.003; head.scale.y=1+Math.sin(t)*0.06; core.scale.setScalar(1+Math.sin(t*2.5)*0.15); mounts.rotation.y=Math.sin(t*0.15)*0.15; orbs.forEach(o=>{o.userData.angle+=0.005; const r=2.2; o.position.x=Math.cos(o.userData.angle)*r; o.position.z=Math.sin(o.userData.angle)*r; o.position.y=o.userData.baseY+Math.sin(t+o.userData.angle)*0.3;}); renderer.render(scene,camera); }; anim();
      const onMove=(e)=>{ head.rotation.y=(e.clientX/window.innerWidth-0.5)*0.8; };
      const onClick=(e)=>{ const ray=new THREE.Raycaster(); const mouse=new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1); ray.setFromCamera(mouse,camera); const hits=ray.intersectObjects(orbs); if(hits.length>0){ const k=hits[0].object.userData.key; setActive(k); setStatus(`${AGENTS[k].icon} ${k} - PINCH DETECTED`); handleBrain("",k); } };
      window.addEventListener("mousemove",onMove); window.addEventListener("click",onClick);
    };
    load();
    return ()=>{ cancelled=true; };
  },[]);

  const handleBrain = async (msg, agentKey = active)=>{
    const ag=AGENTS[agentKey]; setActive(agentKey); const userMsg=msg||`${agentKey} gurinchi`;
    setStatus(`${ag.icon} ${agentKey} alochisthunnadu... Real info loading...`);
    try{
      const res=await fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:userMsg, activeAgent:agentKey, location:"Eluru, AP"})});
      const data=await res.json();
      setReply(data.reply); setStatus(`${ag.icon} ${agentKey} - REAL INFO - ${data.status}`);
      const u=new SpeechSynthesisUtterance(data.reply.slice(0,300)); u.pitch=VOICE.pitch; u.rate=VOICE.rate; u.lang=VOICE.lang; speechSynthesis.speak(u);
    }catch{ setReply("Dharmo Rakshati Rakshitah Prabhu - Brain connect avvaledu"); }
  };

  const ag=AGENTS[active];
  return (
    <div className="relative w-screen h-screen bg-[#020210] overflow-hidden font-mono">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-cyan-300 text-xl tracking-[0.3em]">AVENJARVIS</div>
        <div className="text-orange-400 text-[10px]">MAHABHARATAM • BUILD FIXED • {active} • REAL BRAIN</div>
        <div className="text-white/60 text-xs mt-1">{status}</div>
      </div>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 space-y-1">
        {Object.keys(AGENTS).map(k=>(
          <div key={k} onClick={()=>handleBrain("",k)} className={`px-2.5 py-1 rounded border text-[10px] cursor-pointer ${active===k?"bg-cyan-500/30 border-cyan-400 text-cyan-100 scale-110":"bg-black/50 border-white/10 text-white/50"}`}>{AGENTS[k].icon} {k}</div>
        ))}
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[320px] p-4 rounded bg-black/70 border border-orange-500/30">
        <div className="text-orange-300 text-xs">🦚 {active} BRAIN - REAL</div>
        <div className="text-white/80 text-[11px] mt-2 min-h-[80px]">{reply}</div>
        <div className="flex gap-2 mt-3">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Prabhu adagandi..." className="flex-1 bg-black/60 border border-white/20 rounded px-2 py-1.5 text-[11px] text-white outline-none" onKeyDown={e=>e.key==="Enter"&&(handleBrain(input),setInput(""))}/>
          <button onClick={()=>{handleBrain(input); setInput("");}} className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 text-[10px]">SEND</button>
        </div>
      </div>
    </div>
  );
}
