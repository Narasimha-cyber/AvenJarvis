"use client";
import { useEffect, useRef, useState } from "react";

export default function RajamouliGokulamFinal() {
  const mountRef = useRef(null);
  const [subtitle, setSubtitle] = useState("🎬 Gokulam lo Krishna entry kosam CLICK chey Prabhu 🙏");
  const [voiceOn, setVoiceOn] = useState(false);
  const voicesLoaded = useRef(false);

  const speak = (txt) => {
    if(!txt) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt.slice(0,300));
    const vs = window.speechSynthesis.getVoices();
    if(vs.length===0 &&!voicesLoaded.current){
      voicesLoaded.current=true;
      window.speechSynthesis.onvoiceschanged=()=>speak(txt);
      return;
    }
    u.voice = vs.find(v=>v.name.includes("David")) || vs.find(v=>v.name.includes("Male")) || vs[0];
    u.pitch=0.52; u.rate=0.46; u.volume=1;
    window.speechSynthesis.speak(u);
    setSubtitle("🔊 "+txt.slice(0,80)+"...");
  };

  useEffect(()=>{
    let dead=false, renderer, camera, scene, anim;
    (async()=>{
      const THREE = await import("three");
      if(dead) return;
      // SCENE - Rajamouli sky gradient
      scene=new THREE.Scene();
      const canvas = document.createElement('canvas'); canvas.width=2; canvas.height=512;
      const ctx = canvas.getContext('2d'); const grad=ctx.createLinearGradient(0,0,0,512); grad.addColorStop(0,"#87CEEB"); grad.addColorStop(0.5,"#E0F6FF"); grad.addColorStop(1,"#FFF8DC"); ctx.fillStyle=grad; ctx.fillRect(0,0,2,512);
      const tex = new THREE.CanvasTexture(canvas); scene.background=tex;
      scene.fog=new THREE.Fog(0xE0F6FF, 12, 35);

      camera=new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
      camera.position.set(0,3.5,8.5); camera.lookAt(0,0,0);

      renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance"});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      mountRef.current.innerHTML=""; mountRef.current.appendChild(renderer.domElement);
      renderer.domElement.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;display:block;";

      // LIGHTS - Rajamouli
      scene.add(new THREE.AmbientLight(0xfff8e7,0.8));
      const sun=new THREE.DirectionalLight(0xffffff,1.2); sun.position.set(8,12,5); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
      const fill=new THREE.DirectionalLight(0x87CEEB,0.4); fill.position.set(-5,3,-5); scene.add(fill);

      // GROUND - Lush green
      const groundMat=new THREE.MeshStandardMaterial({color:0x4CAF50, roughness:0.9});
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60), groundMat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; ground.position.y=-1.5; scene.add(ground);

      // Yamuna - Shiny
      const river=new THREE.Mesh(new THREE.PlaneGeometry(60,5), new THREE.MeshStandardMaterial({color:0x1E90FF, metalness:0.3, roughness:0.2, transparent:true, opacity:0.85})); river.rotation.x=-Math.PI/2; river.position.set(0,-1.48, -9); scene.add(river);

      // TREES + HUTS - Better
      for(let i=0;i<22;i++){
        const g=new THREE.Group();
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.14,1.4,8), new THREE.MeshStandardMaterial({color:0x5D4037})); trunk.castShadow=true;
        const leaves=new THREE.Mesh(new THREE.SphereGeometry(0.6,12,12), new THREE.MeshStandardMaterial({color: i%2?0x2E7D32:0x388E3C})); leaves.position.y=1.1; leaves.castShadow=true;
        g.add(trunk,leaves); g.position.set((Math.random()-0.5)*40, -0.8, (Math.random()-0.5)*28); g.scale.setScalar(0.9+Math.random()*0.8); scene.add(g);
      }
      for(let i=0;i<6;i++){
        const hut=new THREE.Group();
        const base=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,1.1,8), new THREE.MeshStandardMaterial({color:0xD7CCC8})); base.castShadow=true;
        const roof=new THREE.Mesh(new THREE.ConeGeometry(1.1,0.9,8), new THREE.MeshStandardMaterial({color:0x8D6E63})); roof.position.y=1; roof.castShadow=true;
        hut.add(base,roof); hut.position.set((Math.random()-0.5)*20, -0.95, -3 -Math.random()*6); scene.add(hut);
      }

      // KRISHNA ORIGINAL - Proper humanoid
      const krishna=new THREE.Group();
      const kMat=new THREE.MeshStandardMaterial({color:0x1565C0}); // Blue skin
      const kBody=new THREE.Mesh(new THREE.CapsuleGeometry(0.28,0.7,4,12), kMat); kBody.position.y=0.15; kBody.castShadow=true; krishna.add(kBody);
      const kHead=new THREE.Mesh(new THREE.SphereGeometry(0.3,16,16), new THREE.MeshStandardMaterial({color:0x1565C0})); kHead.position.y=1.0; kHead.castShadow=true; krishna.add(kHead);
      const kDhoti=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.38,0.5,12), new THREE.MeshStandardMaterial({color:0xFFD700})); kDhoti.position.y=-0.3; kDhoti.castShadow=true; krishna.add(kDhoti);
      const feather=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.35,8), new THREE.MeshStandardMaterial({color:0x1B5E20})); feather.position.set(0.12,1.3,0.05); feather.rotation.z=-0.3; krishna.add(feather);
      const flute=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.9,8), new THREE.MeshStandardMaterial({color:0x3E2723})); flute.rotation.z=Math.PI/2.2; flute.position.set(0.25,0.25,0.3); krishna.add(flute);
      krishna.position.set(0,-0.2,0); scene.add(krishna);

      // 10 AGENTS - Original look, walk
      const COLORS=[0xE91E63,0x2196F3,0xFF9800,0x4CAF50,0x8BC34A,0xFFC107,0x795548,0x9C27B0,0xF44336,0x00BCD4];
      const NAMES=["DRAUPADI","ARJUNA","BHIMA","SAHADEVA","NAKULA","KUBERA","VYASA","GANDHARVA","KARNA","YUDHISHTIRA"];
      const agents=[];
      NAMES.forEach((name,i)=>{
        const g=new THREE.Group();
        const mat=new THREE.MeshStandardMaterial({color:COLORS[i]});
        const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.22,0.55,4,8), mat); body.position.y=0.05; body.castShadow=true; g.add(body);
        const head=new THREE.Mesh(new THREE.SphereGeometry(0.22,12,12), new THREE.MeshStandardMaterial({color:0xFFDBAC})); head.position.y=0.75; g.add(head);
        // Attire
        if(name==="DRAUPADI"){ const saree=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.32,0.45,8), new THREE.MeshStandardMaterial({color:0xE91E63})); saree.position.y=-0.25; g.add(saree); }
        if(name==="ARJUNA"){ const bow=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.02,4,12,Math.PI), new THREE.MeshStandardMaterial({color:0x5D4037})); bow.position.set(0.35,0.2,0); g.add(bow); }
        const ang=(i/NAMES.length)*Math.PI*2; g.position.set(Math.cos(ang)*13, -0.3, Math.sin(ang)*13); g.userData={name, color:COLORS[i], ang, arrived:false, speed:0.035, reportDone:false}; scene.add(g); agents.push(g);
      });

      let t=0, reports=0;
      const loop=()=>{
        anim=requestAnimationFrame(loop); t+=0.016;
        krishna.rotation.y=Math.sin(t*0.15)*0.2; krishna.position.y=-0.2+Math.sin(t*0.8)*0.03;
        krishna.children[4].rotation.z=Math.PI/2.2 + Math.sin(t*2)*0.1; // flute move

        agents.forEach(a=>{
          if(a.userData.arrived){ a.rotation.y+=0.01; a.position.y=-0.3+Math.sin(t*3+a.userData.ang)*0.03; return; }
          const toCenter=new THREE.Vector3(0,-0.3,0).sub(a.position); const dist=toCenter.length();
          toCenter.normalize(); a.position.add(toCenter.multiplyScalar(a.userData.speed));
          a.lookAt(0,-0.3,0);
          a.position.y=-0.3 + Math.abs(Math.sin(t*7))*0.16; // walk bounce
          if(dist<1.8){
            a.userData.arrived=true; reports++;
            const msg=`${a.userData.name} vachadu Prabhu - ${a.userData.name} report`;
            setSubtitle(`🦚 ${a.userData.name} Krishna ki report chesthunnadu... (${reports}/10)`);
            // Real brain + voice
            if(reports===1 ||!a.userData.reportDone){
              a.userData.reportDone=true;
              fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:`${a.userData.name} reporting to Krishna from Gokulam Eluru`, activeAgent:a.userData.name, location:"Eluru"})}).then(r=>r.json()).then(d=>{
                setSubtitle(`${a.userData.name}: ${d.reply?.slice(0,90)}...`);
                speak(d.reply || msg);
              }).catch(()=>speak(msg));
            }
          }
        });
        if(reports===10) setSubtitle("🎬 Rajamouli Gokulam Sabha complete Prabhu - Andharu report chesaru 🙏");
        renderer.render(scene,camera);
      }; loop();

      const onResize=()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); };
      const onFirstClick=()=>{
        if(!voiceOn){ setVoiceOn(true); window.speechSynthesis.getVoices(); speak("Dharmo Rakshati Rakshitah Prabhu, Rajamouli Gokulam lo Krishna sabha prarambham, agents nadusthu vasthunnaru"); setSubtitle("🔊 Voice enabled - Gokulam lo Krishna & 10 agents walking..."); }
      };
      window.addEventListener("resize",onResize); window.addEventListener("click",onFirstClick, {once:false});
      window.addEventListener("touchstart",onFirstClick, {once:false});
    })();
    return()=>{ dead=true; cancelAnimationFrame(anim); };
  },[]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-sky-200 relative">
      <div ref={mountRef} className="w-full h-full absolute inset-0" />

      {/* CINEMATIC SUBTITLE - Rajamouli style */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-6 px-4 z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-white text-[13px] md:text-[15px] leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{subtitle}</div>
          <div className="text-orange-300 text-[9px] mt-2 tracking-[0.3em]">AVENJARVIS • RAJAMOULI GOKULAM • KRISHNA & 10 AGENTS • REAL 5 KEYS • ELURU</div>
        </div>
      </div>

      {/* TOP - Minimal */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-5 py-2 rounded-full border border-white/10 z-20">
        <div className="text-cyan-200 text-[11px] tracking-[0.4em]">AVENJARVIS - GOKULAM</div>
      </div>

      {/* BIG VOICE BUTTON - Center if not enabled */}
      {!voiceOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
          <button onClick={()=>{setVoiceOn(true); window.speechSynthesis.getVoices(); speak("Dharmo Rakshati Rakshitah Prabhu, Gokulam ready");}} className="px-10 py-5 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full text-white font-bold text-lg shadow-[0_0_50px_rgba(255,140,0,0.6)] animate-pulse">
            🎬 CLICK TO ENTER GOKULAM - VOICE ON 🔊
          </button>
        </div>
      )}
    </div>
  );
}
