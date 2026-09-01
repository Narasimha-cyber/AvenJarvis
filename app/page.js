"use client";
import { useEffect, useRef, useState } from "react";

const AGENTS = [
  { id:6, char:"KRISHNA", icon:"🦚", color:0xff8c00 },
  { id:1, char:"DRAUPADI", icon:"👸", color:0xff69b4 },
  { id:2, char:"ARJUNA", icon:"🏹", color:0x00aaff },
  { id:3, char:"BHIMA", icon:"🍯", color:0xffaa00 },
  { id:4, char:"SAHADEVA", icon:"🗺️", color:0x00ffaa },
  { id:5, char:"NAKULA", icon:"🌿", color:0x55ff55 },
  { id:7, char:"KUBERA", icon:"💰", color:0xffff00 },
  { id:8, char:"VYASA", icon:"📚", color:0xffffff },
  { id:9, char:"GANDHARVA", icon:"🎵", color:0xff00ff },
  { id:10, char:"KARNA", icon:"⚔️", color:0xff0000 },
  { id:11, char:"YUDHISHTIRA", icon:"🕊️", color:0xaaffff },
];

export default function AvenJarvisVideoRef() {
  const mountRef = useRef(null);
  const [active, setActive] = useState(AGENTS[0]);
  const [status, setStatus] = useState("Click anywhere to enable voice 🙏 - Dharmo Rakshati Rakshitah");
  const [reply, setReply] = useState("Video reference la loading Prabhu...");
  const [input, setInput] = useState("");
  const unlocked = useRef(false);

  const speak = (txt) => {
    if(!txt ||!unlocked.current) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt.slice(0,280));
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find(v=>v.name.includes("David")) || voices[0];
    u.pitch=0.52; u.rate=0.48; u.lang="te-IN";
    speechSynthesis.speak(u);
  };

  const ask = async (msg, ag=active) => {
    setActive(ag); setStatus(`${ag.icon} ${ag.char} - Real brain calling...`);
    try{
      const res = await fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:ag.char, location:"Eluru, AP"})});
      const data = await res.json();
      setReply(data.reply); setStatus(`${ag.icon} ${ag.char} - ${data.status}`);
      speak(data.reply);
    }catch(e){ setReply("Network error Prabhu - /api/brain check chey"); }
  };

  useEffect(()=>{
    let cancel=false; let renderer,camera,scene,animId;
    (async()=>{
      const THREE = await import("three");
      if(cancel ||!mountRef.current) return;
      scene=new THREE.Scene(); scene.fog=new THREE.Fog(0x020210,3,9);
      camera=new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 1000); camera.position.set(0,0.1,2.8);
      renderer=new THREE.WebGLRenderer({antialias:true, alpha:true}); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.innerHTML=""; mountRef.current.appendChild(renderer.domElement);

      // VIDEO REF HEAD - Capsule like human
      const headGroup=new THREE.Group();
      // Body wireframe
      const bodyGeo=new THREE.CapsuleGeometry(0.55,0.9,4,32);
      const bodyMat=new THREE.MeshBasicMaterial({color:0x00aaff, wireframe:true, transparent:true, opacity:0.35});
      const body=new THREE.Mesh(bodyGeo, bodyMat); body.position.y=-0.15; headGroup.add(body);
      // Orange face core - like video
      const faceGeo=new THREE.SphereGeometry(0.38,32,32);
      const faceMat=new THREE.MeshBasicMaterial({color:0xff8c00});
      const face=new THREE.Mesh(faceGeo, faceMat); face.position.set(0,0.35,0.15); headGroup.add(face);
      // Chest glow
      const chest=new THREE.Mesh(new THREE.SphereGeometry(0.18,16,16), new THREE.MeshBasicMaterial({color:0xffaa00, transparent:true, opacity:0.8})); chest.position.set(0,-0.3,0.2); headGroup.add(chest);
      scene.add(headGroup);

      // GOLD+BLUE MOUNTAINS - particles like video
      const mountGeo=new THREE.BufferGeometry(); const c=6000; const p=new Float32Array(c*3); const col=new Float32Array(c*3);
      for(let i=0;i<c;i++){
        const x=(Math.random()-0.5)*10; const z=(Math.random()-0.5)*6-2; const y=Math.sin(x)*0.8 + Math.random()*0.8 -1.2;
        p[i*3]=x; p[i*3+1]=y; p[i*3+2]=z;
        const isGold=Math.random()>0.4; col[i*3]=isGold?1:0; col[i*3+1]=isGold?0.84:0.6; col[i*3+2]=isGold?0:1;
      }
      mountGeo.setAttribute('position', new THREE.BufferAttribute(p,3));
      mountGeo.setAttribute('color', new THREE.BufferAttribute(col,3));
      const mountMat=new THREE.PointsMaterial({size:0.04, vertexColors:true, transparent:true});
      const mountains=new THREE.Points(mountGeo, mountMat); scene.add(mountains);

      scene.add(new THREE.AmbientLight(0x2233ff,0.7));
      const pl=new THREE.PointLight(0x00ffff,2,5); pl.position.set(0,1,1); scene.add(pl);

      let t=0;
      const loop=()=>{ animId=requestAnimationFrame(loop); t+=0.01;
        headGroup.rotation.y=Math.sin(t*0.3)*0.15;
        face.scale.setScalar(1+Math.sin(t*2.2)*0.12);
        face.material.color.setHSL(0.08+Math.sin(t)*0.02,1,0.55);
        mountains.rotation.y=Math.sin(t*0.1)*0.08;
        renderer.render(scene,camera);
      }; loop();

      const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
      const onMove=(e)=>{ const x=(e.clientX/window.innerWidth-0.5); headGroup.rotation.y=x*0.8; setStatus(`Tracking Prabhu - Eluru - ${active.char}`); };
      const onFirstClick=()=>{
        if(!unlocked.current){ unlocked.current=true; speechSynthesis.getVoices(); speak("Dharmo Rakshati Rakshitah Prabhu, AvenJarvis video reference la siddham"); setStatus("Voice enabled - Pinch to select agent"); }
      };
      window.addEventListener("resize",onResize); window.addEventListener("mousemove",onMove); window.addEventListener("click",onFirstClick);
    })();
    return()=>{ cancel=true; cancelAnimationFrame(animId); };
  },[active]);

  return (
    <div className="relative w-screen h-screen bg-[#020210] overflow-hidden font-mono">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="text-cyan-300 text-xl tracking-[0.4em]">AVENJARVIS</div>
        <div className="text-orange-400 text-[10px]">MAHABHARATAM • VIDEO REF • {active.char} • ELURU</div>
        <div className="text-white/60 text-[11px] mt-1">{status}</div>
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-1.5">
        {AGENTS.map(a=>(
          <div key={a.char} onClick={()=>ask(a.char+" help",a)} className={`px-3 py-1.5 rounded border text-[10px] cursor-pointer ${active.char===a.char?"bg-cyan-500/30 border-cyan-400 text-cyan-100":"bg-black/40 border-white/10 text-white/50"}`}>{a.icon} {a.char}</div>
        ))}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-80 p-4 rounded-xl bg-black/70 border border-orange-500/30 backdrop-blur">
        <div className="text-orange-300 text-xs">🦚 {active.char} BRAIN - REAL 5 KEYS</div>
        <div className="text-white/80 text-[11px] mt-3 leading-relaxed max-h-[180px] overflow-y-auto">{reply}</div>
        <div className="flex gap-2 mt-3"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask(input)} placeholder="Prabhu adagandi..." className="flex-1 bg-black/60 border border-white/20 rounded px-2 py-2 text-[11px] outline-none" /><button onClick={()=>ask(input)} className="px-3 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 text-[10px]">SEND</button></div>
        <button onClick={()=>speak(reply)} className="mt-2 w-full py-2 bg-orange-500/20 border border-orange-400 rounded text-orange-300 text-[10px]">🔊 MAATLAADU - Video voice 0.52/0.48</button>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-[10px] text-center">My AI assistant has a face now • It can track motion • Can respond to gestures like pinching • It runs autonomous loops<br/>👋 Move = Track • 👌 Click = Pinch • 🦚 Autonomous breathing</div>
    </div>
  );
}
