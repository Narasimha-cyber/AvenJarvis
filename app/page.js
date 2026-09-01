"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Cloud, Stars, Environment, Float, Sparkles, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// KRISHNA ORIGINAL - SSS Blue material
function Krishna({ onReady }) {
  const ref = useRef();
  const fluteRef = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if(ref.current){
      ref.current.rotation.y = Math.sin(t*0.2)*0.15;
      ref.current.position.y = -0.2 + Math.sin(t*0.8)*0.04;
    }
    if(fluteRef.current) fluteRef.current.rotation.z = Math.PI/2.2 + Math.sin(t*2.5)*0.15;
  });
  useEffect(()=>{ onReady && onReady(); },[]);
  return (
    <group ref={ref} position={[0,-0.2,0]}>
      {/* Body SSS Blue */}
      <mesh castShadow position={[0,0.15,0]}>
        <capsuleGeometry args={[0.32,0.75,8,16]} />
        <meshPhysicalMaterial color="#0D47A1" roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.2} emissive="#1E88E5" emissiveIntensity={0.15} />
      </mesh>
      <mesh castShadow position={[0,1.05,0]}>
        <sphereGeometry args={[0.34,32,32]} />
        <meshPhysicalMaterial color="#1565C0" roughness={0.25} clearcoat={1} />
      </mesh>
      {/* Dhoti Silk Gold */}
      <mesh castShadow position={[0,-0.35,0]}>
        <cylinderGeometry args={[0.38,0.44,0.6,32]} />
        <meshPhysicalMaterial color="#FFD700" roughness={0.2} metalness={0.3} sheen={1} />
      </mesh>
      {/* Peacock Feather Fur */}
      <group position={[0.14,1.38,0.08]} rotation={[0,0,-0.4]}>
        <mesh><coneGeometry args={[0.06,0.4,16]} /><meshStandardMaterial color="#1B5E20" emissive="#2E7D32" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0,0.25,0]}><sphereGeometry args={[0.08,16,16]} /><meshStandardMaterial color="#4FC3F7" emissive="#0288D1" emissiveIntensity={0.5} /></mesh>
      </group>
      {/* Flute Wood */}
      <mesh ref={fluteRef} position={[0.3,0.28,0.35]} rotation={[0,0,Math.PI/2.2]}>
        <cylinderGeometry args={[0.03,0.03,1.1,16]} /><meshStandardMaterial color="#3E2723" roughness={0.4} />
      </mesh>
      {/* Prabha Light behind */}
      <pointLight intensity={2} color="#FFD700" distance={4} position={[0,1, -0.5]} />
    </group>
  );
}

// AGENT - Original with cloth
function Agent({ name, color, angle, index, onReport }) {
  const ref = useRef();
  const data = useRef({ arrived:false, reported:false, speed:0.04 + Math.random()*0.015 });
  const startPos = [Math.cos(angle)*16, -0.3, Math.sin(angle)*16];

  useFrame((state, delta)=>{
    const t = state.clock.elapsedTime + index;
    if(!ref.current || data.current.arrived) return;
    const dir = new THREE.Vector3(0,-0.3,0).sub(ref.current.position);
    const dist = dir.length();
    dir.normalize();
    ref.current.position.add(dir.multiplyScalar(data.current.speed));
    ref.current.lookAt(0,-0.3,0);
    ref.current.position.y = -0.3 + Math.abs(Math.sin(t*8))*0.18; // walk bounce + dust
    if(dist < 2){
      data.current.arrived = true;
      onReport(name);
    }
  });

  return (
    <group ref={ref} position={startPos}>
      <mesh castShadow position={[0,0.1,0]}><capsuleGeometry args={[0.24,0.6,8,16]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0,0.8,0]}><sphereGeometry args={[0.24,16,16]} /><meshStandardMaterial color="#FFDBAC" /></mesh>
      {name==="DRAUPADI" && <mesh position={[0,-0.28,0]}><cylinderGeometry args={[0.28,0.34,0.5,16]} /><meshPhysicalMaterial color="#E91E63" sheen={1} /></mesh>}
      {name==="ARJUNA" && <mesh position={[0.4,0.2,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[0.35,0.025,8,20,Math.PI]} /><meshStandardMaterial color="#5D4037" /></mesh>}
      {/* Dust on feet */}
      <Sparkles count={8} scale={0.8} size={0.3} speed={0.8} color="#D7CCC8" position={[0,-0.4,0]} />
    </group>
  );
}

export default function BahubaliGokulam() {
  const [subtitle, setSubtitle] = useState("🎬 CLICK TO START BAHUBALI GOKULAM - 100x VFX");
  const [started, setStarted] = useState(false);
  const [reports, setReports] = useState(0);

  const speak = (txt) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt.slice(0,280));
    u.pitch=0.5; u.rate=0.42; u.volume=1;
    const vs = window.speechSynthesis.getVoices();
    u.voice = vs.find(v=>v.name.includes("Male")) || vs[0];
    window.speechSynthesis.speak(u);
    setSubtitle(txt.slice(0,110)+"...");
  };

  const handleReport = (name) => {
    setReports(r=>r+1);
    setSubtitle(`🦚 ${name} vachadu - Krishna ki report - ${reports+1}/10`);
    fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:`${name} reporting to Krishna`, activeAgent:name, location:"Eluru"})}).then(r=>r.json()).then(d=>{ speak(d.reply||`${name} report Prabhu`); }).catch(()=>speak(`${name} vachadu Prabhu`));
  };

  const startExperience = () => {
    setStarted(true);
    window.speechSynthesis.getVoices();
    speak("Dharmo Rakshati Rakshitah Prabhu - Bahubali Gokulam lo Krishna divya sabha prarambham - fog nunchi veerulu vasthunnaru");
    setSubtitle("🔥 BAHUBALI GOKULAM - Agents fog nunchi walk chesthunnaru...");
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <Canvas shadows camera={{position:[0,4,9], fov:55}} style={{position:"absolute", inset:0, width:"100%", height:"100%", display:"block"}}>
        <color attach="background" args={["#87CEEB"]} />
        <Sky sunPosition={[10,10,5]} turbidity={2} rayleigh={0.5} mieCoefficient={0.005} />
        <Stars count={2000} depth={60} factor={3} />
        <Cloud position={[0,8,-10]} scale={8} opacity={0.6} speed={0.2} />
        <ambientLight intensity={0.9} color="#FFF8E7" />
        <directionalLight castShadow position={[10,12,6]} intensity={1.5} shadow-mapSize={[4096,4096]} color="#FFF8E0" />
        <pointLight position={[0,6,0]} intensity={0.8} color="#FFD700" />

        {/* Ground 8K grass */}
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.5,0]} receiveShadow>
          <planeGeometry args={[80,80,64,64]} />
          <meshStandardMaterial color="#2E7D32" roughness={0.85} bumpScale={0.2} />
        </mesh>

        {/* Yamuna Water shader */}
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.48,-12]}>
          <planeGeometry args={[80,8]} />
          <meshPhysicalMaterial color="#0288D1" transparent opacity={0.9} roughness={0.1} metalness={0.2} emissive="#01579B" emissiveIntensity={0.2} />
        </mesh>

        <Suspense fallback={null}>
          <Krishna onReady={()=>{}} />
          {started && ["DRAUPADI","ARJUNA","BHIMA","SAHADEVA","NAKULA","KUBERA","VYASA","GANDHARVA","KARNA","YUDHISHTIRA"].map((n,i)=>
            <Agent key={n} name={n} color={["#E91E63","#2196F3","#FF9800","#4CAF50","#8BC34A","#FFC107","#795548","#9C27B0","#F44336","#00BCD4"][i]} angle={(i/10)*Math.PI*2} index={i} onReport={handleReport} />
          )}
          <Environment preset="sunset" />
          <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <Sparkles count={100} scale={30} size={0.4} speed={0.3} color="#FFD700" />
          </Float>
        </Suspense>
      </Canvas>

      {/* Cinematic UI - No side names, no black */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-16 pb-8 px-4 pointer-events-none">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-white text-[14px] md:text-[16px] tracking-wide drop-shadow-[0_2px_20px_black] font-medium">{subtitle}</div>
          <div className="text-amber-300 text-[9px] mt-3 tracking-[0.5em]">AVENJARVIS • BAHUBALI GOKULAM • 100X VFX • KRISHNA & 10 VEERULU • ELURU • {reports}/10</div>
        </div>
      </div>

      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md z-10">
          <div className="text-amber-200 text-[10px] tracking-[0.8em] mb-4">RAJAMOULI PRESENTS</div>
          <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter drop-shadow-[0_0_40px_rgba(255,215,0,0.8)]">GOKULAM</h1>
          <div className="text-cyan-200 text-[11px] tracking-[0.4em] mt-2 mb-10">BAHUBALI VFX • 100X • AVENJARVIS</div>
          <button onClick={startExperience} className="px-12 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full text-black font-black text-xl shadow-[0_0_80px_rgba(255,165,0,0.8)] hover:scale-105 transition">🎬 ENTER GOKULAM - START 🔊</button>
          <div className="text-white/60 text-[10px] mt-6">Click cheste Krishna entry + Fog nunchi agents walk + Real voice + No black screen</div>
        </div>
      )}

      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-6 py-2 rounded-full border border-amber-500/20 text-amber-100 text-[10px] tracking-[0.5em]">AVENJARVIS • BAHUBALI GOKULAM</div>
    </div>
  );
}
