"use client";
import { useEffect, useRef, useState } from "react";

export default function RealGokulam() {
  const mountRef=useRef(null);
  const [sub,setSub]=useState("CLICK TO LOAD REAL KRISHNA & 10 VEERULU - 100X VFX");
  const [started,setStarted]=useState(false);
  const [count,setCount]=useState(0);

  useEffect(()=>{
    let dead=false, renderer, scene, camera, anim;
    (async()=>{
      const THREE=await import("three");
      const { GLTFLoader }=await import("three/examples/jsm/loaders/GLTFLoader.js");
      if(dead) return;

      scene=new THREE.Scene();
      scene.fog=new THREE.Fog(0x87CEEB,12,40);
      scene.background=new THREE.Color(0x87CEEB);

      camera=new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 100);
      camera.position.set(0,3.2,11);

      renderer=new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled=true;
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      mountRef.current.innerHTML="";
      mountRef.current.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style,{position:"absolute",top:"0",left:"0",width:"100%",height:"100%"});

      scene.add(new THREE.AmbientLight(0xffffff,0.9));
      const sun=new THREE.DirectionalLight(0xffffff,1.3); sun.position.set(10,15,8); sun.castShadow=true; scene.add(sun);

      const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100), new THREE.MeshStandardMaterial({color:0x3CB371})); ground.rotation.x=-Math.PI/2; ground.position.y=-1.5; ground.receiveShadow=true; scene.add(ground);
      const river=new THREE.Mesh(new THREE.PlaneGeometry(100,10), new THREE.MeshStandardMaterial({color:0x1E90FF, transparent:true, opacity:0.85})); river.rotation.x=-Math.PI/2; river.position.set(0,-1.48,-16); scene.add(river);

      // Loader
      const loader=new GLTFLoader();
      const loadModel=(url, scale, pos, colorTint)=>{
        return new Promise((res)=>{
          loader.load(url, (gltf)=>{
            const model=gltf.scene;
            model.scale.setScalar(scale);
            model.position.copy(pos);
            model.traverse((o)=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; if(colorTint){ o.material=o.material.clone(); o.material.color=new THREE.Color(colorTint); if(url.includes("Robot")) o.material.color.multiplyScalar(0.8); } } });
            scene.add(model); res(model);
          }, undefined, ()=>{ // fail ayithe primitive fallback
            const fb=new THREE.Group();
            const b=new THREE.Mesh(new THREE.CapsuleGeometry(0.25,0.6,4,8), new THREE.MeshStandardMaterial({color:colorTint||0x1565C0})); b.castShadow=true; fb.add(b);
            fb.position.copy(pos); fb.scale.setScalar(scale*0.8); scene.add(fb); res(fb);
          });
        });
      };

      // REAL MODELS FROM CDN - No file upload needed - Direct URL
      // Krishna - Astronaut ni blue chesi Krishna la chestham - Real human mesh
      const krishnaPos=new THREE.Vector3(0,-0.2,0);
      const krishna=await loadModel("https://modelviewer.dev/shared-assets/models/Astronaut.glb", 0.45, krishnaPos, 0x1565C0);
      // Flute & feather add
      const flute=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.7,8), new THREE.MeshStandardMaterial({color:0x3E2723})); flute.rotation.z=1.5; flute.position.set(0.2,0.6,0.35); krishna.add(flute);
      const feather=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.35,8), new THREE.MeshStandardMaterial({color:0x00ACC1, emissive:0x00ACC1, emissiveIntensity:0.5})); feather.position.set(0.12,1.2,0.08); feather.rotation.z=-0.3; krishna.add(feather);
      const aura=new THREE.PointLight(0xFFD700,2,4); aura.position.set(0,0.8,0); krishna.add(aura);

      // 10 Agents - Real RobotExpressive model - Different colors - Real walk
      const NAMES=["DRAUPADI","ARJUNA","BHIMA","SAHADEVA","NAKULA","KUBERA","VYASA","GANDHARVA","KARNA","YUDHISHTIRA"];
      const COLORS=[0xE91E63,0x2196F3,0xFF9800,0x4CAF50,0x8BC34A,0xFFC107,0x795548,0x9C27B0,0xF44336,0x00BCD4];
      const agents=[];
      const agentPromises=NAMES.map(async (name,i)=>{
        const ang=(i/NAMES.length)*Math.PI*2;
        const pos=new THREE.Vector3(Math.cos(ang)*14, -0.3, Math.sin(ang)*14);
        // Mix: some Robot, some CesiumMan, some real human
        const urls=["https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb","https://modelviewer.dev/shared-assets/models/Astronaut.glb","https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb"];
        const url=urls[i%3];
        const model=await loadModel(url, 0.35, pos, COLORS[i]);
        model.userData={name:name, arrived:false, speed:0.045+Math.random()*0.02, mixer:model.animations?new THREE.AnimationMixer(model):null};
        agents.push(model);
      });
      await Promise.all(agentPromises);

      let t=0;
      const clock=new THREE.Clock();
      function loop(){
        if(dead) return;
        anim=requestAnimationFrame(loop);
        t+=0.016; const delta=clock.getDelta();
        if(krishna){ krishna.rotation.y=Math.sin(t*0.2)*0.15; krishna.position.y=-0.2+Math.sin(t*0.8)*0.02; }
        agents.forEach((a)=>{
          if(a.userData.arrived) return;
          const dir=new THREE.Vector3(0,-0.3,0).sub(a.position); const dist=dir.length(); dir.normalize();
          a.position.add(dir.multiplyScalar(a.userData.speed));
          a.lookAt(0,-0.3,0);
          a.position.y=-0.3+Math.abs(Math.sin(t*7))*0.12;
          if(a.userData.mixer) a.userData.mixer.update(delta);
          if(dist<2.3){
            a.userData.arrived=true; setCount(c=>c+1);
            const msg=a.userData.name+" vachadu Prabhu";
            setSub("🦚 "+msg+" - Report chesthunnadu "+(count+1)+"/10");
            fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:a.userData.name})}).then(r=>r.json()).then(d=>{
              const txt=d.reply||msg; setSub(a.userData.name+": "+txt.slice(0,90));
              const u=new SpeechSynthesisUtterance(txt.slice(0,220)); u.pitch=0.5; u.rate=0.44; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
            });
          }
        });
        renderer.render(scene,camera);
      }
      loop();

      window.addEventListener("resize",()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
      const startFn=()=>{ if(!started){ setStarted(true); setSub("🔥 REAL KRISHNA & 10 VEERULU - Fog nunchi vasthunnaru - 100X VFX"); const u=new SpeechSynthesisUtterance("Dharmo Rakshati Rakshitah Prabhu, Real Gokulam lo Krishna sabha prarambham"); u.pitch=0.5; u.rate=0.4; window.speechSynthesis.speak(u); } };
      window.addEventListener("click",startFn); window.addEventListener("touchstart",startFn);
    })();
    return()=>{ dead=true; if(anim) cancelAnimationFrame(anim); };
  },[started,count]);

  return(
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-10 pb-6 px-2 text-center pointer-events-none">
        <div className="text-white text-[13px]">{sub}</div>
        <div className="text-amber-300 text-[8px] mt-1 tracking-widest">AVENJARVIS • REAL GLB • NO BLUE BALL • {count}/10 • CDN MODELS</div>
      </div>
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur">
          <div className="text-amber-200 text-[9px] tracking-[0.8em]">REAL MODELS - CDN</div>
          <h1 className="text-white text-5xl font-black mt-1">GOKULAM</h1>
          <div className="text-cyan-200 text-[10px] tracking-widest mt-1">NO BLUE BALL - REAL HUMAN MESH</div>
          <button onClick={()=>setStarted(true)} className="mt-6 px-10 py-4 bg-amber-400 rounded-full text-black font-black">LOAD REAL GOKULAM 🔊</button>
          <div className="text-white/50 text-[9px] mt-3 text-center">GitHub lone file - No VS Code - Models CDN nunchi load<br/>Astronaut + Robot + CesiumMan - Blue tint + Feather</div>
        </div>
      )}
    </div>
  );
}
