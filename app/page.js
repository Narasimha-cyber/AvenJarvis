"use client";
import { useEffect, useRef, useState } from "react";

const AGENT_DATA = [
  {char:"DRAUPADI", icon:"👸", color:0xff1493, role:"SHOPPING", attire:"Pink silk saree, long hair, jewelry", msg:"Prabhu sarees and gold offers"},
  {char:"ARJUNA", icon:"🏹", color:0x1e90ff, role:"CODING", attire:"Warrior armor, bow Gandiva on back", msg:"Prabhu coding battle ready"},
  {char:"BHIMA", icon:"🍯", color:0xff8c00, role:"FOOD", attire:"Big body, mace, laddu", msg:"Prabhu tasty food ready"},
  {char:"SAHADEVA", icon:"🗺️", color:0x2e8b57, role:"TRAVEL", attire:"Travel bag, map, sadhu look", msg:"Prabhu Eluru travel ready"},
  {char:"NAKULA", icon:"🌿", color:0x32cd32, role:"HEALTH", attire:"Ayurveda leaves, white dhoti", msg:"Prabhu health tips ready"},
  {char:"KUBERA", icon:"💰", color:0xffd700, role:"MONEY", attire:"Golden crown, money bag", msg:"Prabhu wealth ready"},
  {char:"VYASA", icon:"📚", color:0xf5f5dc, role:"STUDY", attire:"Rishi beard, palm leaves", msg:"Prabhu vedam ready"},
  {char:"GANDHARVA", icon:"🎵", color:0xff00ff, role:"MUSIC", attire:"Veena, musical", msg:"Prabhu music ready"},
  {char:"KARNA", icon:"⚔️", color:0xdc143c, role:"FIGHT", attire:"Golden armor Kavacha", msg:"Prabhu fight ready"},
  {char:"YUDHISHTIRA", icon:"🕊️", color:0xfffacd, role:"PEACE", attire:"White royal, calm", msg:"Prabhu peace ready"},
];

export default function RajamouliGokulam() {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("🎬 Rajamouli Gokulam - Krishna entry...");
  const [reports, setReports] = useState([]);
  const [reply, setReply] = useState("Gokulam lo Krishna flute vasthundi Prabhu...");
  const [active, setActive] = useState({char:"KRISHNA"});
  const unlocked = useRef(false);
  const krishnaRef = useRef(null);

  const speak = (txt) => {
    if(!unlocked.current ||!txt) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt.slice(0,320));
    const vs = speechSynthesis.getVoices();
    u.voice = vs.find(v=>v.name.includes("David")) || vs[0];
    u.pitch=0.52; u.rate=0.46; u.lang="te-IN";
    speechSynthesis.speak(u);
  };

  const askRealBrain = async (msg, agent) => {
    setActive(agent); setStatus(`🔍 ${agent.char} real 5 keys tho aduguthunnadu...`);
    try{
      const res = await fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:agent.char, location:"Eluru, AP"})});
      const data = await res.json();
      setReply(data.reply); setStatus(`${agent.icon||"🦚"} ${agent.char} - Real: ${data.status}`);
      speak(data.reply);
      return data.reply;
    }catch{ setReply("Brain offline Prabhu"); }
  };

  useEffect(()=>{
    let dead=false, renderer, camera, scene, animId, agents=[];
    (async()=>{
      const THREE = await import("three");
      if(dead) return;
      scene=new THREE.Scene(); scene.background=new THREE.Color(0x87CEEB);
      scene.fog=new THREE.Fog(0xcfe8ff, 10, 28);
      camera=new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 1000); camera.position.set(0,3.2,9); camera.lookAt(0,0,0);
      renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth, innerHeight);
      renderer.shadowMap.enabled=true;
      mountRef.current.innerHTML=""; mountRef.current.appendChild(renderer.domElement);

      // GOKULAM WORLD - Rajamouli level
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshStandardMaterial({color:0x6bbf59}));
      ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; ground.position.y=-1.2; scene.add(ground);
      // Yamuna River - blue strip
      const river=new THREE.Mesh(new THREE.PlaneGeometry(40,4), new THREE.MeshStandardMaterial({color:0x1e90ff, transparent:true, opacity:0.7}));
      river.rotation.x=-Math.PI/2; river.position.set(0,-1.15, -6); scene.add(river);
      // Trees
      for(let i=0;i<18;i++){ const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,1.2,6), new THREE.MeshStandardMaterial({color:0x8B4513})); const leaves=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,8), new THREE.MeshStandardMaterial({color:0x228B22})); const g=new THREE.Group(); trunk.position.y=0; leaves.position.y=0.9; g.add(trunk,leaves); g.position.set((Math.random()-0.5)*30, -0.6, (Math.random()-0.5)*20); g.scale.setScalar(0.8+Math.random()*0.7); scene.add(g); }
      // Huts
      for(let i=0;i<5;i++){ const hut=new THREE.Group(); const base=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,1,6), new THREE.MeshStandardMaterial({color:0xd2b48c})); const roof=new THREE.Mesh(new THREE.ConeGeometry(0.9,0.8,6), new THREE.MeshStandardMaterial({color:0x8B4513})); roof.position.y=0.9; hut.add(base,roof); hut.position.set((Math.random()-0.5)*18, -0.7, (Math.random()-0.5)*8-4); scene.add(hut); }
      // Cows
      for(let i=0;i<4;i++){ const cow=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,8), new THREE.MeshStandardMaterial({color:0xffffff})); cow.position.set((Math.random()-0.5)*10, -0.8, (Math.random()-0.5)*6); scene.add(cow); }

      scene.add(new THREE.AmbientLight(0xfff8dc,0.9)); const sun=new THREE.DirectionalLight(0xffffff,1.1); sun.position.set(6,10,4); sun.castShadow=true; scene.add(sun);

      // ORIGINAL KRISHNA - Flute, peacock feather, blue skin
      const krishnaGroup=new THREE.Group();
      const kBody=new THREE.Mesh(new THREE.SphereGeometry(0.32,16,16), new THREE.MeshStandardMaterial({color:0x1e90ff})); kBody.scale.y=1.6; kBody.position.y=0.2; krishnaGroup.add(kBody);
      const kHead=new THREE.Mesh(new THREE.SphereGeometry(0.28,16,16), new THREE.MeshStandardMaterial({color:0x1e90ff})); kHead.position.y=1.1; krishnaGroup.add(kHead);
      const feather=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.4,6), new THREE.MeshStandardMaterial({color:0x004400})); feather.position.set(0.15,1.35,0); feather.rotation.z=-0.4; krishnaGroup.add(feather);
      const flute=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.7,6), new THREE.MeshStandardMaterial({color:0x8B4513})); flute.rotation.z=Math.PI/2; flute.position.set(0.2,0.35,0.25); krishnaGroup.add(flute);
      krishnaGroup.position.set(0,-0.2,0); scene.add(krishnaGroup); krishnaRef.current=krishnaGroup;

      // AGENTS ORIGINAL - Walk
      AGENT_DATA.forEach((ag,i)=>{
        const g=new THREE.Group();
        const bodyColor=new THREE.MeshStandardMaterial({color:ag.color});
        const b=new THREE.Mesh(new THREE.SphereGeometry(0.26,12,12), bodyColor); b.scale.y=1.4; b.position.y=0.1; g.add(b);
        const h=new THREE.Mesh(new THREE.SphereGeometry(0.22,12,12), new THREE.MeshStandardMaterial({color:0xffdbac})); h.position.y=0.85; g.add(h);
        // Attire marker
        const attire=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,6), new THREE.MeshStandardMaterial({color:ag.color})); attire.position.set(0.25,0.3,0.15); g.add(attire);
        const angle=(i/AGENT_DATA.length)*Math.PI*2 + Math.random()*0.3;
        g.position.set(Math.cos(angle)*11, -0.3, Math.sin(angle)*11);
        g.userData={...ag, angle, arrived:false, speed:0.03+Math.random()*0.02};
        scene.add(g); agents.push(g);
      });

      setStatus("🦚 Krishna Gokulam centre lo - 10 agents walking - Rajamouli entry...");

      let t=0;
      const loop=()=>{
        animId=requestAnimationFrame(loop); t+=0.016;
        krishnaGroup.rotation.y=Math.sin(t*0.2)*0.15; krishnaGroup.position.y=-0.2+Math.sin(t)*0.04;
        agents.forEach(a=>{
          if(a.userData.arrived){ a.rotation.y+=0.008; a.position.y=-0.3+Math.sin(t*3+a.userData.angle)*0.04; return; }
          const dir=new THREE.Vector3(0, -0.3, 0).sub(a.position).normalize();
          a.position.add(dir.multiplyScalar(a.userData.speed));
          a.lookAt(0,-0.3,0);
          a.position.y=-0.3 + Math.abs(Math.sin(t*6))*0.18; // walk bob
          if(a.position.length()<1.6){
            a.userData.arrived=true;
            const rep = {...a.userData, time:new Date().toLocaleTimeString()};
            setReports(prev=>{ if(prev.find(p=>p.char===rep.char)) return prev; return [...prev, rep]; });
            setActive(rep); setStatus(`${rep.icon} ${rep.char} reached Krishna - Reporting: ${rep.msg}`);
            // REAL BRAIN CALL ON ARRIVAL
            askRealBrain(`${rep.char} ${rep.msg} - give real info for Eluru`, rep);
          }
        });
        renderer.render(scene,camera);
      }; loop();

      const onResize=()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); };
      const onClick=()=>{ if(!unlocked.current){ unlocked.current=true; speechSynthesis.getVoices(); speak("Dharmo Rakshati Rakshitah Prabhu, Gokulam Rajamouli style lo ready, Krishna sabha prarambham"); setStatus("Voice unlocked - Rajamouli Gokulam ready Prabhu 🙏"); } };
      const onMove=(e)=>{ krishnaGroup.rotation.y=(e.clientX/innerWidth-0.5)*0.6; };
      addEventListener("resize",onResize); addEventListener("mousemove",onMove); addEventListener("click",onClick);
    })();
    return()=>{ dead=true; cancelAnimationFrame(animId); };
  },[]);

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-sky-300 font-mono">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full border border-cyan-400/50 text-center z-10 pointer-events-none">
        <div className="text-cyan-200 tracking-[0.3em] text-sm">AVENJARVIS - RAJAMOULI GOKULAM</div>
        <div className="text-orange-300 text-[10px] mt-1">{status}</div>
      </div>
      <div className="absolute left-3 top-20 bottom-20 w-24 overflow-y-auto space-y-1 z-10">
        {AGENT_DATA.map(a=>(
          <div key={a.char} onClick={()=>askRealBrain(a.char+" real info", a)} className={`px-2 py-1.5 rounded border text-[9px] cursor-pointer ${active.char===a.char?"bg-cyan-500/40 border-cyan-300 text-white":"bg-black/50 border-white/10 text-white/60"}`}>{a.icon} {a.char}<br/><span className="text-[7px]">{a.role}</span></div>
        ))}
      </div>
      <div className="absolute right-3 top-20 w-96 max-h-[75vh] bg-white/95 backdrop-blur p-4 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] border-2 border-orange-200 z-10 overflow-y-auto">
        <div className="text-orange-700 font-bold text-sm flex items-center gap-2">🦚 KRISHNA SABHA - GOKULAM REPORTS <span className="text-[10px] bg-green-100 px-2 py-0.5 rounded-full">REAL 5 KEYS</span></div>
        <div className="text-[9px] text-gray-500 mt-1">Rajamouli style - Each agent walks & reports real world info from Eluru</div>
        <div className="mt-3 space-y-2">
          {reports.map(r=>(
            <div key={r.char} className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-cyan-50 border-l-4 border-orange-500 shadow-sm">
              <div className="font-bold text-[11px] text-gray-800">{r.icon} {r.char} ({r.role}) - {r.time}</div>
              <div className="text-[10px] text-gray-600 mt-1">{r.msg} - {r.attire}</div>
              <button onClick={()=>askRealBrain(r.msg+" real info", r)} className="mt-2 px-2 py-1 bg-orange-500 text-white rounded text-[9px]">Get Real Info 5 Keys</button>
            </div>
          ))}
          {reports.length===0 && <div className="text-gray-400 text-[11px] py-8 text-center">🌾 Agents Gokulam nunchi nadusthu vasthunnaru...<br/>Watch their walk Prabhu</div>}
        </div>
        <div className="mt-4 p-3 bg-black text-white rounded-xl">
          <div className="text-cyan-300 text-[11px]">🦚 {active.char} Live Reply - Real World</div>
          <div className="text-[11px] mt-2 leading-relaxed max-h-40 overflow-y-auto text-white/90">{reply}</div>
          <div className="flex gap-2 mt-3">
            <button onClick={()=>{unlocked.current=true; speak(reply);}} className="flex-1 py-2 bg-orange-500 rounded text-[10px] font-bold">🔊 SPEAK 0.52</button>
            <button onClick={()=>askRealBrain("Eluru real weather and news", {char:"KRISHNA", icon:"🦚"})} className="flex-1 py-2 bg-cyan-600 rounded text-[10px]">🌦️ REAL INFO</button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-1 rounded-full text-[9px] text-black/60 text-center z-10">🎬 Rajamouli Perfection • Gokulam • Yamuna River • Cows • Huts • Peacocks • Krishna Flute • 10 Agents Walk & Report • Real 5 Keys • Motion Track • Voice 0.52</div>
    </div>
  );
}
