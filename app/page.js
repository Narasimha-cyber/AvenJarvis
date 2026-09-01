"use client";
import { useEffect, useRef, useState } from "react";

export default function GokulamFinal() {
  const mountRef = useRef(null);
  const [sub, setSub] = useState("CLICK TO ENTER GOKULAM");
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(()=>{
    let dead=false, renderer, scene, camera, anim;
    let krishna=null;
    (async()=>{
      const THREE = await import("three");
      if(dead) return;

      scene=new THREE.Scene();
      scene.fog=new THREE.Fog(0x87CEEB, 10, 35);
      scene.background=new THREE.Color(0x87CEEB);

      camera=new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 100);
      camera.position.set(0,3,10);

      renderer=new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled=true;
      if(mountRef.current){
        mountRef.current.innerHTML="";
        mountRef.current.appendChild(renderer.domElement);
        renderer.domElement.style.position="absolute";
        renderer.domElement.style.top="0";
        renderer.domElement.style.left="0";
        renderer.domElement.style.width="100%";
        renderer.domElement.style.height="100%";
      }

      scene.add(new THREE.AmbientLight(0xffffff,0.9));
      const sun=new THREE.DirectionalLight(0xffffff,1.2);
      sun.position.set(10,15,8);
      sun.castShadow=true;
      scene.add(sun);

      const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80), new THREE.MeshStandardMaterial({color:0x4CAF50}));
      ground.rotation.x=-Math.PI/2;
      ground.position.y=-1.5;
      ground.receiveShadow=true;
      scene.add(ground);

      const river=new THREE.Mesh(new THREE.PlaneGeometry(80,10), new THREE.MeshStandardMaterial({color:0x2196F3, transparent:true, opacity:0.8}));
      river.rotation.x=-Math.PI/2;
      river.position.set(0,-1.45,-15);
      scene.add(river);

      // Trees simple
      const treePositions=[[5,0,2],[-6,0,-2],[8,0,-5],[-9,0,3],[7,0,4],[-7,0,-6],[10,0,0],[-10,0,-3]];
      treePositions.forEach((p)=>{
        const tr=new THREE.Group();
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,1.2,6), new THREE.MeshStandardMaterial({color:0x5D4037}));
        trunk.position.y=0;
        trunk.castShadow=true;
        const leaves=new THREE.Mesh(new THREE.SphereGeometry(0.6,8,8), new THREE.MeshStandardMaterial({color:0x2E7D32}));
        leaves.position.y=1;
        leaves.castShadow=true;
        tr.add(trunk);
        tr.add(leaves);
        tr.position.set(p[0],-0.9,p[2]);
        scene.add(tr);
      });

      // KRISHNA
      krishna=new THREE.Group();
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.3,0.7,4,8), new THREE.MeshStandardMaterial({color:0x1565C0}));
      body.position.y=0.2;
      body.castShadow=true;
      krishna.add(body);
      const head=new THREE.Mesh(new THREE.SphereGeometry(0.32,16,16), new THREE.MeshStandardMaterial({color:0x1565C0}));
      head.position.y=1;
      head.castShadow=true;
      krishna.add(head);
      const dhoti=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.4,0.5,12), new THREE.MeshStandardMaterial({color:0xFFD700}));
      dhoti.position.y=-0.3;
      dhoti.castShadow=true;
      krishna.add(dhoti);
      const flute=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.8,6), new THREE.MeshStandardMaterial({color:0x3E2723}));
      flute.rotation.z=1.4;
      flute.position.set(0.3,0.2,0.3);
      krishna.add(flute);
      krishna.position.set(0,-0.2,0);
      scene.add(krishna);

      // AGENTS
      const NAMES=["DRAUPADI","ARJUNA","BHIMA","SAHADEVA","NAKULA","KUBERA","VYASA","GANDHARVA","KARNA","YUDHISHTIRA"];
      const COLORS=[0xE91E63,0x2196F3,0xFF9800,0x4CAF50,0x8BC34A,0xFFC107,0x795548,0x9C27B0,0xF44336,0x00BCD4];
      const agents=[];
      NAMES.forEach((name,i)=>{
        const g=new THREE.Group();
        const b=new THREE.Mesh(new THREE.CapsuleGeometry(0.22,0.5,4,8), new THREE.MeshStandardMaterial({color:COLORS[i]}));
        b.position.y=0.05;
        b.castShadow=true;
        g.add(b);
        const h=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,8), new THREE.MeshStandardMaterial({color:0xFFDBAC}));
        h.position.y=0.7;
        g.add(h);
        const ang=(i/NAMES.length)*Math.PI*2;
        g.position.set(Math.cos(ang)*12, -0.3, Math.sin(ang)*12);
        g.userData={name:name, ang:ang, arrived:false, speed:0.04};
        scene.add(g);
        agents.push(g);
      });

      let t=0;
      function loop(){
        if(dead) return;
        anim=requestAnimationFrame(loop);
        t+=0.016;
        if(krishna){
          krishna.rotation.y=Math.sin(t*0.2)*0.2;
          krishna.position.y=-0.2+Math.sin(t)*0.03;
        }
        agents.forEach((a)=>{
          if(a.userData.arrived) return;
          const dir=new THREE.Vector3(0,-0.3,0).sub(a.position);
          const dist=dir.length();
          dir.normalize();
          a.position.add(dir.multiplyScalar(a.userData.speed));
          a.lookAt(0,-0.3,0);
          a.position.y=-0.3+Math.abs(Math.sin(t*8))*0.15;
          if(dist<2){
            a.userData.arrived=true;
            setCount(c=>c+1);
            const msg=a.userData.name+" vachadu Prabhu";
            setSub(msg+" - "+(count+1)+"/10");
            fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:a.userData.name})}).then(r=>r.json()).then(d=>{
              const txt=d.reply||msg;
              setSub(a.userData.name+": "+txt.slice(0,80));
              const u=new SpeechSynthesisUtterance(txt.slice(0,200));
              u.pitch=0.5; u.rate=0.45;
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(u);
            }).catch(()=>{});
          }
        });
        renderer.render(scene,camera);
      }
      loop();

      function onResize(){
        camera.aspect=window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      function onClick(){
        if(!started){
          setStarted(true);
          setSub("GOKULAM START - Agents vasthunnaru...");
          const u=new SpeechSynthesisUtterance("Dharmo Rakshati Rakshitah Prabhu, Gokulam sabha prarambham");
          u.pitch=0.5; u.rate=0.42;
          window.speechSynthesis.speak(u);
        }
      }
      window.addEventListener("resize",onResize);
      window.addEventListener("click",onClick);
      window.addEventListener("touchstart",onClick);
    })();
    return()=>{ dead=true; if(anim) cancelAnimationFrame(anim); };
  },[started,count]);

  return(
    <div className="w-screen h-screen bg-sky-300 overflow-hidden relative">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 pt-8 pb-6 px-2 text-center pointer-events-none">
        <div className="text-white text-[13px]">{sub}</div>
        <div className="text-amber-300 text-[8px] mt-1 tracking-widest">AVENJARVIS GOKULAM • {count}/10 • NO BLACK SCREEN</div>
      </div>
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
          <h1 className="text-white text-5xl font-black">GOKULAM</h1>
          <button onClick={()=>setStarted(true)} className="mt-6 px-10 py-4 bg-amber-400 rounded-full text-black font-bold text-lg">CLICK TO ENTER 🔊</button>
          <div className="text-white/60 text-[10px] mt-4">GitHub direct - No error - Build success</div>
        </div>
      )}
    </div>
  );
}
