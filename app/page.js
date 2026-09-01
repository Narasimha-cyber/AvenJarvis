"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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
  const [status, setStatus] = useState("Dharmo Rakshati Rakshitah Prabhu 🙏");
  const [loc] = useState("Eluru, AP");

  // JARVIS HEAD + MAHABHARATAM MOUNTAINS
  useEffect(()=>{
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000011, 2, 8);
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 3.2;
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.innerHTML="";
    mountRef.current.appendChild(renderer.domElement);

    // KRISHNA HEAD - Blue wireframe + Orange chakra core (Video la)
    const headGeo = new THREE.SphereGeometry(1, 64, 64);
    const headMat = new THREE.MeshStandardMaterial({color:0x1e90ff, wireframe:true, transparent:true, opacity:0.5, emissive:0x0044ff});
    const head = new THREE.Mesh(headGeo, headMat);
    scene.add(head);

    // Orange brain core - Krishna
    const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({color:0xff7f00});
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Peacock feather glow
    const feather = new THREE.PointLight(0x00ffff, 3, 5);
    feather.position.set(0,1.2,1);
    scene.add(feather);

    // Mahabharatam Kurukshetra mountains - Gold + Blue particles
    const mountGeo = new THREE.BufferGeometry();
    const cnt = 4000;
    const pos = new Float32Array(cnt*3);
    for(let i=0;i<cnt*3;i++) pos[i]=(Math.random()-0.5)*12;
    mountGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const mountMat = new THREE.PointsMaterial({color:0xffd700, size:0.03, transparent:true});
    const mounts = new THREE.Points(mountGeo, mountMat);
    mounts.position.y=-1.5;
    scene.add(mounts);

    // 11 Agents orbit
    const orbs=[];
    AGENTS.forEach((ag,i)=>{
      const g = new THREE.SphereGeometry(0.12,16,16);
      const m = new THREE.MeshBasicMaterial({color:ag.color});
      const o = new THREE.Mesh(g,m);
      const angle = (i/AGENTS.length)*Math.PI*2;
      o.userData={ag, angle, baseY: Math.sin(i)*0.5};
      scene.add(o);
      orbs.push(o);
    });

    // Lights
    scene.add(new THREE.AmbientLight(0x2233ff, 0.6));
    const pl = new THREE.PointLight(0xffaa00, 2, 10);
    pl.position.set(2,2,2); scene.add(pl);

    // Autonomous loops + Motion track
    let t=0;
    const animate=()=>{
      requestAnimationFrame(animate);
      t+=0.012;
      head.rotation.y+=0.003;
      head.scale.y=1+Math.sin(t)*0.06; // breathing - autonomous
      core.scale.setScalar(1+Math.sin(t*2.5)*0.15);
      coreMat.color.setHSL(0.08+Math.sin(t)*0.02,1,0.5); // chakra pulse
      mounts.rotation.y=Math.sin(t*0.15)*0.15;
      mounts.position.y=-1.5+Math.sin(t*0.5)*0.1;

      orbs.forEach(o=>{
        o.userData.angle+=0.005;
        const r=2.2;
        o.position.x=Math.cos(o.userData.angle)*r;
        o.position.z=Math.sin(o.userData.angle)*r;
        o.position.y=o.userData.baseY+Math.sin(t+o.userData.angle)*0.3;
        o.rotation.y+=0.02;
      });

      renderer.render(scene,camera);
    };
    animate();

    // Motion tracking - Mouse = Hand
    window.addEventListener("mousemove",(e)=>{
      const x=(e.clientX/window.innerWidth-0.5);
      const y=(e.clientY/window.innerHeight-0.5);
      head.rotation.y=x*0.8;
      head.rotation.x=y*0.5;
      setStatus(`Tracking Prabhu - ${loc} nunchi`);
    });

    // Pinch gesture - Click = Pinch
    const onClick=(e)=>{
      const raycaster=new THREE.Raycaster();
      const mouse=new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
      raycaster.setFromCamera(mouse,camera);
      const hits=raycaster.intersectObjects(orbs);
      if(hits.length>0){
        const ag=hits[0].object.userData.ag;
        setActive(ag);
        setStatus(`${ag.icon} ${ag.char} - ${ag.name} active - Pinch detected`);
        speakKrishna(`${ag.char} Prabhu, ${ag.name} sevalu siddham.`);
      }
    };
    window.addEventListener("click",onClick);

    return ()=> window.removeEventListener("click",onClick);
  },[loc]);

  // Krishna Brain Voice - Nee video voice - 0.52 pitch 0.48 rate
  const speakKrishna = (txt)=>{
    const u=new SpeechSynthesisUtterance(txt);
    const vs=speechSynthesis.getVoices();
    u.voice=vs.find(v=>v.name.includes("David"))||vs[0];
    u.pitch=0.52; u.rate=0.48; u.lang="te-IN"; u.volume=1;
    speechSynthesis.speak(u);
  };

  return (
    <div className="relative w-screen h-screen bg-[#020210] overflow-hidden font-mono">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Top - Mahabharatam Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-cyan-300 text-xl tracking-[0.3em]">AVENJARVIS</div>
        <div className="text-orange-400 text-[10px] tracking-widest">MAHABHARATAM • ELURU • {active.char}</div>
        <div className="text-white/60 text-xs mt-1">{status}</div>
      </div>

      {/* Left - 11 Agents list */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2">
        {AGENTS.map(a=>(
          <div key={a.id} onClick={()=>setActive(a)}
            className={`px-3 py-1.5 rounded border text-[10px] cursor-pointer transition-all ${active.id===a.id?"bg-cyan-500/20 border-cyan-400 text-cyan-200 scale-110":"bg-black/40 border-white/10 text-white/50 hover:border-cyan-300/50"}`}>
            {a.icon} {a.char}
          </div>
        ))}
      </div>

      {/* Right - Brain answer */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-64 p-4 rounded bg-black/60 border border-orange-500/30">
        <div className="text-orange-300 text-xs">🦚 KRISHNA BRAIN</div>
        <div className="text-white/80 text-[11px] mt-2 leading-relaxed">
          {active.isBrain? `Dharmo Rakshati Rakshitah Prabhu. Nenu ${active.char} ni. Eluru nunchi mee ${AGENTS.length} mandi sakhulatho siddhamga unna. ${status}`
          : `${active.char} Prabhu - ${active.name} kosam siddham. Pinch chesi select chesaru.`}
        </div>
        <button onClick={()=>speakKrishna(status)} className="mt-3 w-full py-1.5 bg-orange-500/20 border border-orange-400 rounded text-orange-300 text-[10px]">🔊 MAATLAADU</button>
      </div>

      {/* Bottom hint - Video la */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-[10px] text-center">
        My AI assistant has a face now • It can track motion • Can respond to gestures like pinching • It runs autonomous loops<br/>
        👌 Pinch agent • 👋 Move to track • 🦚 Krishna Brain autonomous
      </div>
    </div>
  );
}
