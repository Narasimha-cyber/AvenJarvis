"use client";
import { useEffect, useRef, useState } from "react";

const AGENTS_WALK = [
  {char:"DRAUPADI", icon:"👸", color:0xff69b4, role:"Shopping", msg:"Prabhu shopping offers ready"},
  {char:"ARJUNA", icon:"🏹", color:0x00aaff, role:"Coding", msg:"Prabhu code ready"},
  {char:"BHIMA", icon:"🍯", color:0xffaa00, role:"Food", msg:"Prabhu food ready"},
  {char:"SAHADEVA", icon:"🗺️", color:0x00ffaa, role:"Travel", msg:"Prabhu travel plan ready"},
  {char:"NAKULA", icon:"🌿", color:0x55ff55, role:"Health", msg:"Prabhu health tips ready"},
  {char:"KUBERA", icon:"💰", color:0xffff00, role:"Money", msg:"Prabhu money plan ready"},
  {char:"VYASA", icon:"📚", color:0xffffff, role:"Study", msg:"Prabhu study ready"},
  {char:"GANDHARVA", icon:"🎵", color:0xff00ff, role:"Music", msg:"Prabhu music ready"},
  {char:"KARNA", icon:"⚔️", color:0xff0000, role:"Fight", msg:"Prabhu fight tips ready"},
  {char:"YUDHISHTIRA", icon:"🕊️", color:0xaaffff, role:"Peace", msg:"Prabhu peace mantra ready"},
];

export default function GokulamMahabharatam() {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("Gokulam loading Prabhu... Krishna vasthunnadu 🦚");
  const [reports, setReports] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(()=>{
    let dead=false; let renderer, camera, scene, anim, groupKrishna, agents=[];
    (async()=>{
      const THREE = await import("three");
      if(dead) return;
      scene=new THREE.Scene(); scene.background=new THREE.Color(0x87CEEB); // Gokulam sky
      scene.fog=new THREE.Fog(0x87CEEB, 8, 20);
      camera=new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000); camera.position.set(0,2.5,7);
      camera.lookAt(0,0,0);
      renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current.innerHTML=""; mountRef.current.appendChild(renderer.domElement);

      // GOKULAM GROUND - Green
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,30), new THREE.MeshStandardMaterial({color:0x7CFC00}));
      ground.rotation.x=-Math.PI/2; ground.position.y=-1; scene.add(ground);
      // Huts + Trees simple
      for(let i=0;i<6;i++){ const hut=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.2,6), new THREE.MeshStandardMaterial({color:0x8B4513})); hut.position.set((Math.random()-0.5)*12, -0.2, (Math.random()-0.5)*8 -3); scene.add(hut); }
      scene.add(new THREE.AmbientLight(0xffffff,0.9)); const sun=new THREE.DirectionalLight(0xfff8dc,1); sun.position.set(5,8,3); scene.add(sun);

      // KRISHNA CENTRAL MODEL - Simple humanoid
      const makeHuman = (color, scale=1) => {
        const g=new THREE.Group();
        const body=new THREE.Mesh(new THREE.CapsuleGeometry?new THREE.CapsuleGeometry(0.2*scale,0.6*scale,4,8):new THREE.SphereGeometry(0.25*scale), new THREE.MeshStandardMaterial({color}));
        body.position.y=0.3*scale; g.add(body);
        const head=new THREE.Mesh(new THREE.SphereGeometry(0.22*scale,16,16), new THREE.MeshStandardMaterial({color:0xffdbac})); head.position.y=0.9*scale; g.add(head);
        return g;
      };
      // Krishna - Blue
      groupKrishna = makeHuman(0x1e90ff,1.2); groupKrishna.position.set(0,0,0); scene.add(groupKrishna);
      setStatus("🦚 Krishna Gokulam lo vachadu - Agents nadusthu vasthunnaru...");

      // AGENTS - Start far, walk to Krishna
      AGENTS_WALK.forEach((ag,i)=>{
        const human=makeHuman(ag.color,1);
        const angle=(i/AGENTS_WALK.length)*Math.PI*2;
        human.position.set(Math.cos(angle)*8, 0, Math.sin(angle)*8);
        human.userData={...ag, angle, target: new THREE.Vector3(0,0,0), speed:0.02+Math.random()*0.01, arrived:false};
        scene.add(human); agents.push(human);
      });

      let t=0;
      const loop=()=>{
        anim=requestAnimationFrame(loop); t+=0.02;
        groupKrishna.rotation.y=Math.sin(t*0.3)*0.2; groupKrishna.position.y=Math.sin(t)*0.05;
        agents.forEach(h=>{
          if(h.userData.arrived) { h.rotation.y+=0.01; h.position.y=Math.sin(t*2+h.userData.angle)*0.05; return; }
          // Walk to Krishna
          const dir=new THREE.Vector3().subVectors(h.userData.target, h.position).normalize();
          h.position.add(dir.multiplyScalar(h.userData.speed));
          h.lookAt(0,0,0);
          // Bobbing walk
          h.position.y=Math.abs(Math.sin(t*5))*0.15;
          if(h.position.length()<1.2){ h.userData.arrived=true; setReports(prev=>{ if(!prev.find(p=>p.char===h.userData.char)) return [...prev, h.userData]; return prev; }); setActive(h.userData); setStatus(`${h.userData.icon} ${h.userData.char} vachadu - ${h.userData.msg} - Krishna ki report chesthunnadu`); }
        });
        renderer.render(scene,camera);
      }; loop();

      const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
      window.addEventListener("resize",onResize);
    })();
    return()=>{ dead=true; cancelAnimationFrame(anim); };
  },[]);

  return (
    <div className="w-screen h-screen bg-sky-200 relative overflow-hidden font-mono">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center bg-black/60 px-6 py-2 rounded-full backdrop-blur z-10">
        <div className="text-cyan-100 text-sm tracking-widest">AVENJARVIS - GOKULAM</div>
        <div className="text-orange-300 text-[10px]">{status}</div>
      </div>
      <div className="absolute right-3 top-20 w-72 bg-white/90 p-3 rounded-xl shadow-2xl z-10">
        <div className="text-orange-600 font-bold text-xs">🦚 KRISHNA SABHA - REPORTS</div>
        <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
          {reports.map(r=>(
            <div key={r.char} className="p-2 bg-sky-50 border-l-4 border-orange-400 rounded text-[11px]"><span className="font-bold">{r.icon} {r.char}</span> ({r.role}): {r.msg}</div>
          ))}
          {reports.length===0 && <div className="text-gray-400 text-[10px]">Agents naduchukuntu vasthunnaru Prabhu...</div>}
        </div>
        {active && <div className="mt-3 p-2 bg-cyan-100 rounded text-[10px]">Current: {active.icon} {active.char} reporting to Krishna</div>}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-black/50 text-[9px] bg-white/70 px-3 py-1 rounded-full z-10">Gokulam theme • Krishna centre • Agents walk & report • Clean village</div>
    </div>
  );
}
