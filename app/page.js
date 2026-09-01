"use client";
import { useEffect, useRef, useState } from "react";

export default function GokulamBahubaliFinal() {
  const mountRef = useRef(null);
  const [sub, setSub] = useState("🎬 CLICK ANYWHERE - BAHUBALI GOKULAM START");
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(()=>{
    let dead=false, renderer, scene, camera, anim, krishna;
    (async()=>{
      const THREE = await import("three");
      if(dead) return;

      // SCENE - Bahubali sky
      scene=new THREE.Scene();
      scene.fog=new THREE.FogExp2(0x87CEEB, 0.025);
      const canvasBg=document.createElement('canvas'); canvasBg.width=2; canvasBg.height=512;
      const ctx=canvasBg.getContext('2d'); const g=ctx.createLinearGradient(0,0,0,512);
      g.addColorStop(0,"#0D47A1"); g.addColorStop(0.3,"#42A5F5"); g.addColorStop(0.7,"#E3F2FD"); g.addColorStop(1,"#FFF8E1");
      ctx.fillStyle=g; ctx.fillRect(0,0,2,512);
      scene.background=new THREE.CanvasTexture(canvasBg);

      camera=new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 200);
      camera.position.set(0,3,10);

      renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance"});
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
      renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      mountRef.current.innerHTML=""; mountRef.current.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style,{position:"absolute",top:"0",left:"0",width:"100%",height:"100%",display:"block"});

      // LIGHTS - Bahubali
      scene.add(new THREE.AmbientLight(0xFFF8E7,0.85));
      const sun=new THREE.DirectionalLight(0xFFEB3B,1.6); sun.position.set(15,20,10); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.far=50; scene.add(sun);
      const rim=new THREE.DirectionalLight(0xFF9800,0.6); rim.position.set(-10,5,-10); scene.add(rim);

      // GROUND - Textured
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100,32,32), new THREE.MeshStandardMaterial({color:0x2E7D32, roughness:0.8, metalness:0.1}));
      ground.rotation.x=-Math.PI/2; ground.position.y=-1.5; ground.receiveShadow=true; scene.add(ground);
      // Grass details
      for(let i=0;i<300;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,4), new THREE.MeshStandardMaterial({color:0x388E3C})); b.position.set((Math.random()-0.5)*80,-1.48,(Math.random()-0.5)*80); scene.add(b); }

      // RIVER - Shiny water
      const water=new THREE.Mesh(new THREE.PlaneGeometry(100,12,20,4), new THREE.MeshPhysicalMaterial({color:0x0288D1, transparent:true, opacity:0.85, roughness:0.05, metalness:0.3, emissive:0x01579B, emissiveIntensity:0.2}));
      water.rotation.x=-Math.PI/2; water.position.set(0,-1.45,-18); scene.add(water);

      // TREES - Better
      for(let i=0;i<30;i++){
        const tr=new THREE.Group();
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.18,1.6,8), new THREE.MeshStandardMaterial({color:0x3E2723})); trunk.castShadow=true; trunk.position.y=0.1;
        const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(0.7,1), new THREE.MeshStandardMaterial({color: i%3==0?0x1B5E20:0x2E7D32:0x43A047, roughness:0.7})); leaves.position.y=1.2; leaves.castShadow=true;
        tr.add(trunk,leaves); tr.position.set((Math.random()-0.5)*70,-0.7,(Math.random()-0.5)*50); tr.scale.setScalar(0.8+Math.random()*0.7); scene.add(tr);
      }

      // HUTS + TEMPLE
      for(let i=0;i<8;i++){ const hut=new THREE.Group(); const b=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1,1.2,8), new THREE.MeshStandardMaterial({color:0xD7CCC8})); b.castShadow=true; const roof=new THREE.Mesh(new THREE.ConeGeometry(1.3,1,8), new THREE.MeshStandardMaterial({color:0x8D6E63})); roof.position.y=1.1; roof.castShadow=true; hut.add(b,roof); hut.position.set((Math.random()-0.5)*30,-0.9,-4-Math.random()*12); scene.add(hut); }

      // KRISHNA - Bahubali style - Blue SSS + Gold silk
      krishna=new THREE.Group();
      const bodyMat=new THREE.MeshPhysicalMaterial({color:0x0D47A1, roughness:0.25, clearcoat:1, clearcoatRoughness:0.15, emissive:0x1565C0, emissiveIntensity:0.18});
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.36,0.85,8,16), bodyMat); body.position.y=0.2; body.castShadow=true; krishna.add(body);
      const head=new THREE.Mesh(new THREE.SphereGeometry(0.38,24,24), new THREE.MeshPhysicalMaterial({color:0x1565C0, roughness:0.2, clearcoat:1})); head.position.y=1.15; head.castShadow=true; krishna.add(head);
      const dhoti=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.5,0.7,24), new THREE.MeshPhysicalMaterial({color:0xFFD700, roughness:0.15, metalness:0.25, sheen:1, sheenColor:0xFFEB3B})); dhoti.position.y=-0.32; dhoti.castShadow=true; krishna.add(dhoti);
      const featherG=new THREE.Group(); const feather=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.5,12), new THREE.MeshStandardMaterial({color:0x1B5E20, emissive:0x2E7D32, emissiveIntensity:0.4})); featherG.add(feather); const eye=new THREE.Mesh(new THREE.SphereGeometry(0.11,12,12), new THREE.MeshPhysicalMaterial({color:0x00BCD4, emissive:0x0288D1, emissiveIntensity:0.8, transparent:true, opacity:0.9})); eye.position.y=0.32; featherG.add(eye); featherG.position.set(0.16,1.52,0.1); featherG.rotation.z=-0.35; krishna.add(featherG);
      const flute=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,1.25,12), new THREE.MeshStandardMaterial({color:0x3E2723, roughness:0.35})); flute.rotation.z=Math.PI/2.15; flute.position.set(0.38,0.32,0.42); flute.castShadow=true; krishna.add(flute);
      const prabha=new THREE.PointLight(0xFFD700, 3, 5); prabha.position.set(0,1.2,-0.4); krishna.add(prabha);
      const aura=new THREE.Mesh(new THREE.SphereGeometry(0.9,16,16), new THREE.MeshBasicMaterial({color:0xFFD700, transparent:true, opacity:0.12, side:THREE.BackSide})); aura.position.y=0.4; krishna.add(aura);
      krishna.position.set(0,-0.2,0); scene.add(krishna);

      // 10 AGENTS - Walk from fog
      const COLORS=[0xE91E63,0x2196F3,0xFF9800,0x4CAF50,0x8BC34A,0xFFC107,0x795548,0x9C27B0,0xF44336,0x00BCD4];
      const NAMES=["DRAUPADI","ARJUNA","BHIMA","SAHADEVA","NAKULA","KUBERA","VYASA","GANDHARVA","KARNA","YUDHISHTIRA"];
      const agents=[];
      NAMES.forEach((name,i)=>{
        const g=new THREE.Group();
        const mat=new THREE.MeshStandardMaterial({color:COLORS[i], roughness:0.5});
        const b=new THREE.Mesh(new THREE.CapsuleGeometry(0.26,0.65,6,12), mat); b.position.y=0.1; b.castShadow=true; g.add(b);
        const h=new THREE.Mesh(new THREE.SphereGeometry(0.26,16,16), new THREE.MeshStandardMaterial({color:0xFFDBAC})); h.position.y=0.88; g.add(h);
        if(name==="DRAUPADI"){ const s=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.38,0.55,12), new THREE.MeshPhysicalMaterial({color:0xE91E63, sheen:1})); s.position.y=-0.25; g.add(s); }
        const ang=(i/NAMES.length)*Math.PI*2; g.position.set(Math.cos(ang)*18, -0.3, Math.sin(ang)*18); g.userData={name, ang, arrived:false, speed:0.05+Math.random()*0.02}; scene.add(g); agents.push(g);
      });

      // SPARKLES - Divine particles
      const sparkGeo=new THREE.BufferGeometry(); const sparkCount=150; const pos=new Float32Array(sparkCount*3); for(let i=0;i<sparkCount*3;i++) pos[i]=(Math.random()-0.5)*30; sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      const sparks=new THREE.Points(sparkGeo, new THREE.PointsMaterial({color:0xFFD700, size:0.08, transparent:true, opacity:0.8})); scene.add(sparks);

      let t=0;
      const loop=()=>{
        if(dead) return;
        anim=requestAnimationFrame(loop); t+=0.016;
        if(krishna){ krishna.rotation.y=Math.sin(t*0.18)*0.18; krishna.position.y=-0.2+Math.sin(t*0.9)*0.04; krishna.children[5].rotation.y=t*0.5; }
        sparks.rotation.y=t*0.05; sparks.position.y=Math.sin(t*0.3)*0.3;
        water.position.x=Math.sin(t*0.2)*0.1;
        water.material.emissiveIntensity=0.2+Math.sin(t)*0.1;
        agents.forEach(a=>{
          if(a.userData.arrived) return;
          const dir=new THREE.Vector3(0,-0.3,0).sub(a.position); const dist=dir.length(); dir.normalize(); a.position.add(dir.multiplyScalar(a.userData.speed));
          a.lookAt(0,-0.3,0); a.position.y=-0.3+Math.abs(Math.sin(t*9+a.userData.ang))*0.2;
          if(dist<2.2){ a.userData.arrived=true; setCount(c=>c+1); const msg=`${a.userData.name} vachadu Prabhu!`; setSub(`🦚 ${msg} - ${a.userData.name} Krishna ki report (${count+1}/10)`);
            fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:`${a.userData.name} reporting`, activeAgent:a.userData.name})}).then(r=>r.json()).then(d=>{
              setSub(`${a.userData.name}: ${d.reply?.slice(0,100)}`); const u=new SpeechSynthesisUtterance(d.reply?.slice(0,250)||msg); u.pitch=0.5; u.rate=0.42; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
            }).catch(()=>{ const u=new SpeechSynthesisUtterance(msg); window.speechSynthesis.speak(u); });
          }
        });
        // Cinematic camera
        if(started){ camera.position.x=Math.sin(t*0.1)*0.6; camera.lookAt(0,0.2,0); }
        renderer.render(scene,camera);
      }; loop();

      const onResize=()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); };
      const onClick=()=>{ if(!started){ setStarted(true); setSub("🔥 BAHUBALI GOKULAM START - Fog nunchi veerulu vasthunnaru..."); window.speechSynthesis.getVoices(); const u=new SpeechSynthesisUtterance("Dharmo Rakshati Rakshitah Prabhu, Bahubali Gokulam lo Krishna sabha prarambham"); u.pitch=0.5; u.rate=0.4; window.speechSynthesis.speak(u); } };
      addEventListener("resize",onResize); addEventListener("click",onClick); addEventListener("touchstart",onClick);
    })();
    return()=>{ dead=true; cancelAnimationFrame(anim); };
  },[started, count]);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <div ref={mountRef} className="w-full h-full absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent pt-14 pb-7 px-3 pointer-events-none">
        <div className="text-center text-white text-[13px] md:text-[15px] drop-shadow-[0_2px_20px_black]">{sub}</div>
        <div className="text-center text-amber-300 text-[8px] mt-2 tracking-[0.5em]">AVENJARVIS • BAHUBALI GOKULAM • 100X VFX • NO BLACK SCREEN • {count}/10 REPORTED</div>
      </div>
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-amber-200 text-[10px] tracking-[0.8em]">RAJAMOULI PRESENTS</div>
          <h1 className="text-white text-6xl font-black tracking-tighter drop-shadow-[0_0_40px_gold]">GOKULAM</h1>
          <button onClick={()=>setStarted(true)} className="mt-8 px-12 py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-black font-black text-lg shadow-[0_0_60px_orange]">🎬 CLICK TO ENTER GOKULAM 🔊</button>
          <div className="text-white/70 text-[10px] mt-4 text-center">Direct GitHub - No extra package - Only THREE.js<br/>Black screen fix + 30 trees + River + Fog + Sparkles</div>
        </div>
      )}
    </div>
  );
}
