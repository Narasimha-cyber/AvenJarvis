"use client";
import { useEffect, useRef, useState } from "react";

const AGENTS = [
  { id:6, name:"BRAIN", char:"KRISHNA", icon:"🦚", color:0xff8c00, isBrain:true },
  { id:1, name:"SHOPPING", char:"DRAUPADI", icon:"👸", color:0xff69b4 },
  { id:2, name:"CODING", char:"ARJUNA", icon:"🏹", color:0x00aaff },
  { id:3, name:"FOOD", char:"BHIMA", icon:"🍯", color:0xffaa00 },
  { id:4, name:"TRAVEL", char:"SAHADEVA", icon:"🗺️", color:0x00ffaa },
  { id:5, name:"HEALTH", char:"NAKULA", icon:"🌿", color:0x55ff55 },
  { id:7, name:"MONEY", char:"KUBERA", icon:"💰", color:0xffff00 },
  { id:8, name:"STUDY", char:"VYASA", icon:"📚", color:0xffffff },
  { id:9, name:"MUSIC", char:"GANDHARVA", icon:"🎵", color:0xff00ff },
  { id:10, name:"FIGHT", char:"KARNA", icon:"⚔️", color:0xff0000 },
  { id:11, name:"PEACE", char:"YUDHISHTIRA", icon:"🕊️", color:0xaaffff },
];

export default function AvenJarvisMahabharatam() {
  const mountRef = useRef(null);
  const [active, setActive] = useState(AGENTS[0]);
  const [status, setStatus] = useState("Dharmo Rakshati Rakshitah Prabhu 🙏 Click to enable voice");
  const [reply, setReply] = useState("Eluru nunchi siddham Prabhu...");
  const voiceUnlocked = useRef(false);

  const speakKrishna = (txt) => {
    if(!txt) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt.slice(0,250));
    const vs = window.speechSynthesis.getVoices();
    u.voice = vs.find(v=>v.name.includes("Male")) || vs.find(v=>v.name.includes("David")) || vs[0];
    u.pitch = 0.52; u.rate = 0.48; u.lang="te-IN"; u.volume=1;
    window.speechSynthesis.speak(u);
  };

  const askReal = async (msg, agent=active) => {
    setActive(agent);
    setStatus(`${agent.icon} ${agent.char} - Real 5 keys tho alochisthunnadu...`);
    try{
      const res = await fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:agent.char, location:"Eluru, AP"})});
      const data = await res.json();
      setReply(data.reply);
      setStatus(`${agent.icon} ${agent.char} - ${data.status}`);
      speakKrishna(data.reply);
    }catch{ setReply("Brain error Prabhu"); }
  };

  useEffect(()=>{
    let cancelled=false; let renderer, scene, camera, animationId;
    const init = async () => {
      const THREE = await import("three");
      if(cancelled ||!mountRef.current) return;

      scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x000011, 2, 8);
      camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
      camera.position.z = 3.5;
      renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.innerHTML=""; mountRef.current.appendChild(renderer.domElement);

      // BLUE WIREFRAME HEAD - Reference la
      const head = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), new THREE.MeshStandardMaterial({color:0x1e90ff, wireframe:true, transparent:true, opacity:0.45, emissive:0x0044ff}));
      scene.add(head);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), new THREE.MeshBasicMaterial({color:0xff7f00}));
      scene.add(core);
      const light = new THREE.PointLight(0x00ffff, 2, 5); light.position.set(0,1.2,1); scene.add(light);
      scene.add(new THREE.AmbientLight(0x2233ff, 0.6));
      const pl = new THREE.PointLight(0xffaa00, 2, 10); pl.position.set(2,2,2); scene.add(pl);

      // STARS
      const mGeo = new THREE.BufferGeometry(); const cnt=4000; const pos=new Float32Array(cnt*3); for(let i=0;i<cnt*3;i++) pos[i]=(Math.random()-0.5)*12; mGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      const mounts = new THREE.Points(mGeo, new THREE.PointsMaterial({color:0xffd700, size:0.03})); mounts.position.y=-1.5; scene.add(mounts);

      // 11 ORBS - Small perfect spheres
      const orbs=[]; AGENTS.forEach((ag,i)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(0.13,16,16), new THREE.MeshBasicMaterial({color:ag.color})); o.userData={ag, angle:(i/AGENTS.length)*Math.PI*2, baseY: Math.sin(i)*0.4}; scene.add(o); orbs.push(o); });

      let t=0;
      const animate = () => {
        animationId=requestAnimationFrame(animate); t+=0.012;
        head.rotation.y+=0.003; head.scale.y=1+Math.sin(t)*0.05;
        core.scale.setScalar(1+Math.sin(t*2.5)*0.15);
        mounts.rotation.y=Math.sin(t*0.15)*0.12;
        orbs.forEach(o=>{ o.userData.angle+=0.004; const r=2.2; o.position.x=Math.cos(o.userData.angle)*r; o.position.z=Math.sin(o.userData.angle)*r; o.position.y=o.userData.baseY+Math.sin(t+o.userData.angle)*0.3; });
        renderer.render(scene,camera);
      }; animate();

      const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
      const onMove=(e)=>{ head.rotation.y=(e.clientX/window.innerWidth-0.5)*0.8; head.rotation.x=(e.clientY/window.innerHeight-0.5)*0.4; };
      const onClick=(e)=>{
        // VOICE UNLOCK - First click
        if(!voiceUnlocked.current){ voiceUnlocked.current=true; window.speechSynthesis.getVoices(); speakKrishna("Dharmo Rakshati Rakshitah Prabhu, AvenJarvis siddham"); setStatus("Voice enabled Prabhu 🙏"); }
        const ray=new THREE.Raycaster(); const mouse=new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
        ray.setFromCamera(mouse,camera); const hits=ray.intersectObjects(orbs); if(hits.length>0){ const ag=hits[0].object.userData.ag; askReal(ag.char+" gurinchi",ag); }
      };
      window.addEventListener("resize",onResize); window.addEventListener("mousemove",onMove); window.addEventListener("click",onClick);
    };
    init();
    return ()=>{ cancelled=true; cancelAnimationFrame(animationId); window.removeEventListener("resize",()=>{}); };
  },[]);

  return (
    <div className="relative w-screen h-screen bg-[#020210] overflow-hidden font-mono">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="text-cyan-300 text-xl tracking-[0.3em]">AVENJARVIS</div>
        <div className="text-orange-400 text-[10px] tracking-widest">MAHABHARATAM • ELURU • {active.char} • 5 KEYS REAL</div>
        <div className="text-white/60 text-xs mt-1">{status}</div>
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2">
        {AGENTS.map(a=>(
          <div key={a.id} onClick={()=>askReal(a.char+" gurinchi",a)} className={`px-3 py-1.5 rounded border text-[10px] cursor-pointer transition-all ${active.id===a.id?"bg-cyan-500/20 border-cyan-400 text-cyan-200 scale-110":"bg-black/40 border-white/10 text-white/50 hover:border-cyan-300/50"}`}>{a.icon} {a.char}</div>
        ))}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-72 p-4 rounded bg-black/60 border border-orange-500/30">
        <div className="text-orange-300 text-xs">🦚 KRISHNA BRAIN - REAL</div>
        <div className="text-white/80 text-[11px] mt-2 leading-relaxed max-h-[200px] overflow-y-auto">{reply}</div>
        <button onClick={()=>speakKrishna(reply)} className="mt-3 w-full py-2 bg-orange-500/20 border border-orange-400 rounded text-orange-300 text-[10px]">🔊 MAATLAADU - Voice 0.52</button>
        <div className="text-[9px] text-white/30 mt-2">First click anywhere to enable voice (browser rule)</div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-[10px] text-center pointer-events-none">My AI assistant has a face now • Track motion • Pinch agent • Autonomous loops • 5 keys real info</div>
    </div>
  );
}
