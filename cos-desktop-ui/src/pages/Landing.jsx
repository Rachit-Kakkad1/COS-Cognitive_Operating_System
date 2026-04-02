import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  Sparkles, Eye, ScanSearch, Cpu, Database, Rocket, 
  Lock, Zap, Plane, Mic, Code2, TrendingUp, FlaskConical, Palette, Check 
} from 'lucide-react';

// ─── 3D COGNITIVE NETWORK (NEURAL PARTICLES) ────────────────────────
function CognitiveNetwork() {
  const count = 3500;
  const pointsRef = useRef(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 14 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  const colors = useMemo(() => {
    const colorArray = new Float32Array(count * 3);
    const color1 = new THREE.Color('#B13BFF'); // Neon Purple
    const color2 = new THREE.Color('#F97316'); // Bright Orange
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      tempColor.lerpColors(color1, color2, Math.random());
      colorArray[i * 3]     = tempColor.r;
      colorArray[i * 3 + 1] = tempColor.g;
      colorArray[i * 3 + 2] = tempColor.b;
    }
    return colorArray;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particlesPosition} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors={true} transparent={true} opacity={0.6} sizeAttenuation={true} blending={THREE.NormalBlending} />
    </points>
  );
}

// ─── ADAPTIVE PERFORMANCE SECTION ─────────────────────────────
function AdaptivePerformance() {
  const [cpu, setCpu] = useState(40);
  
  useEffect(() => {
    let phase = 0;
    const interval = setInterval(() => {
      phase = (phase + 1) % 3;
      if (phase === 0) setCpu(Math.floor(Math.random() * 10) + 30);
      else if (phase === 1) setCpu(Math.floor(Math.random() * 10) + 65);
      else setCpu(Math.floor(Math.random() * 5) + 94);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getModeSpec = () => {
    if (cpu < 60) return { name: "Full Intelligence Mode", color: "bg-emerald-500", label: "Normal", text: "text-emerald-600" };
    if (cpu < 90) return { name: "Reduced Load Mode", color: "bg-orange-500", label: "Lite", text: "text-orange-600" };
    return { name: "Ultra Lite Mode Activated", color: "bg-red-500", label: "Ultra Lite ⚫", text: "text-red-600" };
  };

  const mode = getModeSpec();

  return (
    <section className="py-40 relative z-10 bg-[#EAE0D6] border-y border-[#DBC1A7] overflow-hidden shadow-inner flex">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDFB]/40 via-transparent to-[#B13BFF]/5 pointer-events-none"></div>
      
      <motion.div 
        animate={{ opacity: cpu > 90 ? 0.1 : 0.6 }} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#FFFDFB] blur-[100px] rounded-full pointer-events-none transition-opacity duration-1000"
      />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
        
        <div className="w-full lg:w-1/2 text-left">
           <span className="text-[#B13BFF] font-bold tracking-widest uppercase text-xs mb-4 block">System Architecture</span>
           <h2 className="text-5xl md:text-6xl font-black text-[#1C150E] mb-6 tracking-tight leading-[1.1]">
             Performance-Aware <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B13BFF] to-[#FF7A00]">Intelligence.</span>
           </h2>
           <p className="text-2xl text-[#5F4E3C] mb-8 font-bold leading-relaxed">
             COS adapts in real-time to your system load — delivering intelligence without slowing you down.
           </p>
           <p className="text-xl text-[#8B7355] mb-10 leading-relaxed max-w-lg font-medium">
             When your system is under pressure, COS steps back — pausing heavy AI processing and switching to a minimal footprint mode.
           </p>
           
           <div className="inline-flex items-center gap-3 bg-[#FFFDFB]/60 border border-[#DBC1A7] px-6 py-3 rounded-full relative overflow-hidden group hover:border-[#B13BFF] transition-colors shadow-sm">
             <div className="absolute inset-0 bg-[#B13BFF]/5 animate-pulse pointer-events-none"></div>
             <div className="w-2 h-2 rounded-full bg-[#B13BFF] animate-ping"></div>
             <span className="text-[#B13BFF] font-black tracking-wider uppercase text-sm relative z-10">Less than 0.5% CPU usage under extreme load</span>
           </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
           <motion.div 
             animate={{ scale: cpu > 90 ? 0.98 : 1 }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             className="w-full max-w-md bg-[#FFFDFB]/80 backdrop-blur-2xl border border-[#DBC1A7] rounded-[2.5rem] p-8 shadow-[0_30px_80px_rgba(42,32,21,0.08)] relative overflow-hidden"
           >
             
             <div className={`absolute top-0 left-0 right-0 h-1.5 ${mode.color} transition-colors duration-1000 shadow-[0_0_20px_inherit]`}></div>
             
             <div className="flex justify-between items-center mb-10">
                <span className="text-[#2A2015] font-black text-xl tracking-wide font-mono">System Monitor</span>
                <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${cpu > 90 ? 'border-red-500/50 text-red-600 bg-red-500/10' : cpu > 60 ? 'border-orange-500/50 text-orange-600 bg-orange-500/10' : 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10'} transition-colors duration-700`}>
                  {mode.label}
                </span>
             </div>

             <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[#8B7355] text-xs font-bold uppercase tracking-widest">CPU Load</span>
                  <motion.span 
                    key={cpu}
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className={`text-6xl font-black ${mode.text} font-mono tracking-tighter`}
                  >
                    {cpu}%
                  </motion.span>
                </div>
                <div className="h-5 w-full bg-[#EAE0D6] rounded-full overflow-hidden border border-[#DBC1A7] relative shadow-inner pointer-events-none">
                  <motion.div 
                    animate={{ width: `${cpu}%` }} 
                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                    className={`absolute top-0 left-0 bottom-0 ${mode.color} transition-colors duration-700 shadow-[0_0_10px_inherit]`}
                  />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 filter invert-[0.3]"></div>
                </div>
             </div>

             <div className="bg-[#EAE0D6]/40 rounded-3xl p-6 border border-[#DBC1A7]/50 relative z-10 backdrop-blur-md">
                <div className="text-[#8B7355] uppercase text-[10px] tracking-[0.2em] mb-2 font-bold">Active Protocol</div>
                <motion.div 
                  key={mode.name}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="text-[#1C150E] font-black text-xl mb-4 tracking-tight"
                >
                  {mode.name}
                </motion.div>
                
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${mode.color} ${cpu < 90 ? 'animate-pulse shadow-[0_0_10px_inherit]' : ''} transition-colors duration-1000`}></div>
                   <span className="text-[#5F4E3C] font-bold text-sm">System Protected</span>
                </div>
             </div>

             <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.08] mix-blend-multiply overflow-hidden rounded-[2.5rem]">
               <motion.div 
                 animate={{ 
                   y: cpu > 90 ? 0 : [0, -30, 0], 
                   opacity: cpu > 90 ? 0 : 0.6 
                 }}
                 transition={{ repeat: Infinity, duration: cpu > 60 ? 4 : 2, ease: "linear" }}
                 className={`w-full h-[300px] absolute bottom-[-150px] blur-[60px] ${mode.color} transition-colors duration-1000`}
               />
             </div>

           </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ANIMATED COMPONENT ─────────────────────────────
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#DBC1A7] py-6">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left focus:outline-none group">
        <span className="text-xl md:text-2xl font-black text-[#2A2015] pr-4 group-hover:text-[#B13BFF] transition-colors">{question}</span>
        <span className="text-[#8B7355] text-3xl shrink-0 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pt-4 text-[#5F4E3C] text-lg leading-relaxed font-medium">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── FRAMER MOTION ANIMATION VARIANTS ─────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const slideInLeft = { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const slideInRight = { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F0DEC8] text-[#2A2015] min-h-screen selection:bg-[#B13BFF]/20 font-sans overflow-x-hidden">
      
      {/* ── NAVBAR ── */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#F0DEC8]/70 backdrop-blur-2xl border-b border-[#E6D4BE] h-20 flex items-center justify-center transition-all shadow-[0_10px_30px_rgba(42,32,21,0.05)]"
      >
        <div className="max-w-[1400px] w-full px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B13BFF] to-[#FF7A00] flex items-center justify-center shadow-[0_0_20px_rgba(177,59,255,0.3)] transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-tight text-[#2A2015]">COS</span>
          </div>
          <div className="hidden lg:flex gap-10 items-center font-bold text-[15px] text-[#6A5A4A]">
            <a href="#features" className="hover:text-[#B13BFF] transition-colors cursor-pointer">Platform Features</a>
            <a href="#architecture" className="hover:text-[#B13BFF] transition-colors cursor-pointer">Neural Architecture</a>
            <a href="#privacy" className="hover:text-[#B13BFF] transition-colors cursor-pointer">Trust & Security</a>
            <a href="#faq" className="hover:text-[#B13BFF] transition-colors cursor-pointer">FAQ</a>
          </div>
          <div className="flex gap-4 items-center">
             <button className="hidden md:block font-bold text-[#6A5A4A] hover:text-[#2A2015] transition-colors">Log in</button>
             <button onClick={() => navigate('/home')} className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-[#2A2015] border border-[#2A2015] rounded-xl hover:bg-[#B13BFF] hover:border-[#B13BFF] shadow-[0_0_20px_rgba(42,32,21,0.15)] overflow-hidden">
               <span className="relative z-10 w-full text-center">Get COS Free</span>
             </button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <Canvas camera={{ position: [0, 0, 11], fov: 60 }}>
            <ambientLight intensity={0.8} />
            <Suspense fallback={null}><CognitiveNetwork /><Environment preset="city" /></Suspense>
          </Canvas>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 max-w-[1200px] w-full px-6 flex flex-col items-center text-center mt-10">
          
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl lg:text-[100px] font-black tracking-tighter text-[#1C150E] mb-6 max-w-6xl leading-[1.0] drop-shadow-sm">
            The Cognitive Engine for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#B13BFF] via-[#FF7A00] to-[#B13BFF] animate-gradient-x p-1">Human Brilliance.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl md:text-3xl text-[#5F4E3C] max-w-4xl mb-12 leading-relaxed font-bold drop-shadow-sm">
            A deeply embedded, entirely passive AI operating system that remembers context deeply across every app—so you never lose your train of thought again.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <button onClick={() => navigate('/home')} className="w-full sm:w-auto bg-[#2A2015] text-white font-black text-xl px-12 py-5 rounded-2xl transition-all shadow-xl hover:shadow-[0_0_40px_rgba(177,59,255,0.4)] hover:bg-[#B13BFF] hover:-translate-y-2 relative border border-transparent">
               Download for Windows
            </button>
            <button className="w-full sm:w-auto bg-[#F0DEC8] backdrop-blur-md border-2 border-[#DBC1A7] text-[#2A2015] font-bold text-xl px-12 py-5 rounded-2xl transition-all hover:bg-[#EAE0D6] hover:-translate-y-1">
              Read the Whitepaper
            </button>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-[#8B7355] font-bold text-sm tracking-widest uppercase">
             Free for individuals • 100% On-Device
          </motion.p>
        </motion.div>
      </section>

      {/* ── ENTERPRISE SOCIAL PROOF ── */}
      <section className="relative z-10 border-y border-[#DBC1A7] bg-[#EAE0D6] py-16 overflow-hidden shadow-inner">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center">
          <p className="text-sm font-black text-[#8B7355] uppercase tracking-[0.4em] mb-12 opacity-80 decoration-[#B13BFF] underline underline-offset-8">Engineered for visionaries at world-class companies</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-40 grayscale-[50%] transition-all duration-700 hover:grayscale-0 hover:opacity-100">
             <div className="text-3xl font-black tracking-tighter text-[#2A2015] cursor-pointer hover:scale-110 transition-transform">VertexAI</div>
             <div className="text-3xl font-black italic text-[#2A2015] flex items-center pr-2 cursor-pointer hover:scale-110 transition-transform"><Sparkles className="text-[#FF7A00] mr-2 w-6 h-6" /> Nova Labs</div>
             <div className="text-3xl font-bold font-serif text-[#2A2015] cursor-pointer hover:scale-110 transition-transform">Omnistruct</div>
             <div className="text-3xl tracking-[0.3em] font-light text-[#2A2015] cursor-pointer hover:scale-110 transition-transform">AURA</div>
             <div className="text-3xl font-extrabold text-[#B13BFF] cursor-pointer hover:scale-110 transition-transform">VANGUARD</div>
             <div className="text-3xl font-bold font-mono text-[#2A2015] cursor-pointer hover:scale-110 transition-transform">./sys_corp</div>
          </div>
        </div>
      </section>

      {/* ── CORE CAPABILITIES GRID ── */}
      <section id="features" className="py-40 relative z-10 bg-[#F0DEC8]">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-28">
            <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight text-[#1C150E] mb-6">
              A profound shift in <br className="hidden md:block"/><span className="text-[#B13BFF]">cognitive capability.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#5F4E3C] text-2xl max-w-3xl mx-auto font-bold leading-relaxed">
              We eliminated the mechanical barriers between thoughts. COS clusters meaning locally, acting as a literal extension of your own brain's hippocampus.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Omnipresent Context', desc: 'Jump from VSCode to Slack to Chrome—COS threads your context silently behind the scenes.', icon: <Zap className="w-8 h-8"/> },
              { title: 'Air-Gapped Privacy', desc: 'Your data never leaves the hardware. We utilize highly-quantized local LLMs for absolute security.', icon: <Lock className="w-8 h-8"/> },
              { title: 'Conversational Recall', desc: 'Ask complex queries naturally. "What was that python script Nishit sent me regarding UI updates?"', icon: <Mic className="w-8 h-8"/> },
              { title: 'Zero Integration Tax', desc: 'No APIs to configure. No plugins to install. COS reads pixels, operating universally across any GUI.', icon: <Sparkles className="w-8 h-8"/> }
            ].map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }} className="bg-[#FFFDFB]/60 backdrop-blur-xl border border-[#DBC1A7] group rounded-[2rem] p-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(42,32,21,0.08)] hover:-translate-y-3 relative overflow-hidden hover:border-[#B13BFF]">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#B13BFF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-2xl bg-[#EAE0D6] border border-[#DBC1A7] flex items-center justify-center text-[#B13BFF] mb-8 relative z-10 shadow-inner group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
                <h3 className="text-2xl font-black text-[#1C150E] mb-4 relative z-10 tracking-tight">{feature.title}</h3>
                <p className="text-[#5F4E3C] text-lg leading-relaxed relative z-10 font-bold">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADAPTIVE LITE MODE (DARK THEME CUT-OUT) ── */}
      <AdaptivePerformance />

      {/* ── 5-STEP TECHNICAL PIPELINE (HOW IT WORKS) ── */}
      <section id="architecture" className="py-40 relative z-10 bg-[#F0DEC8] overflow-hidden">
         <div className="max-w-[1400px] mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-32">
            <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight text-[#1C150E] mb-6">
              The <span className="text-[#FF7A00]">Neural Architecture.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#5F4E3C] text-2xl max-w-3xl mx-auto font-bold">
              We engineered a frictionless, 5-phase pipeline that transforms erratic screen activity into an instantly searchable neural memory graph.
            </motion.p>
          </motion.div>

          <div className="space-y-40 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[4px] before:bg-gradient-to-b before:from-[#B13BFF] before:via-[#FF7A00] before:to-transparent before:opacity-30">
            {[
               { num: "01", title: "Passive Visual Capture", desc: "A highly-optimized background daemon samples your OS accessibility tree and visual screen buffer at roughly 10hz. It operates completely silently.", icon: <Eye strokeWidth={1} className="w-16 h-16" /> },
               { num: "02", title: "On-Device OCR & Distillation", desc: "Raw pixel data is fed through a lightning-fast local optical character recognition engine. We isolate only the pure semantic value of your active window.", icon: <ScanSearch strokeWidth={1} className="w-16 h-16" /> },
               { num: "03", title: "Quantized Embedding Layer", desc: "The distilled text is passed through our custom 7-Billion parameter LLM, aggressively quantized to 4-bit to run directly on your GPU/NPU.", icon: <Cpu strokeWidth={1} className="w-16 h-16" /> },
               { num: "04", title: "Military-Grade Storage", desc: "Your vectors and plaintext metadata are immediately committed to a local SQLite Vector database sitting behind OS-level AES-256 encryption.", icon: <Database strokeWidth={1} className="w-16 h-16" /> },
               { num: "05", title: "Zero-Latency Neural Recall", desc: "Hit the global spatial shortcut (Ctrl+Space). Describe what you're looking for. The system retrieves the exact moment in 40 milliseconds.", icon: <Rocket strokeWidth={1} className="w-16 h-16" /> }
            ].map((step, idx) => (
               <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active w-full">
                 <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-[#F0DEC8] bg-[#FFFDFB] text-[#B13BFF] font-black text-2xl shadow-[0_0_30px_rgba(177,59,255,0.2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative group-hover:scale-125 transition-transform duration-500 ring-8 ring-[#F0DEC8]">{step.num}</div>
                 <motion.div variants={idx % 2 === 0 ? slideInLeft : slideInRight} initial="hidden" whileInView="show" viewport={{ once: true }} className="w-[calc(100%-5rem)] md:w-[calc(50%-4rem)] bg-[#FFFDFB]/60 border border-[#DBC1A7] p-10 md:p-14 rounded-[2.5rem] backdrop-blur-xl hover:border-[#B13BFF] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(177,59,255,0.1)] hover:-translate-y-2">
                   <div className="text-[#FF7A00] mb-6 drop-shadow-sm">{step.icon}</div>
                   <h3 className="text-3xl font-black text-[#1C150E] mb-4 tracking-tight group-hover:text-[#B13BFF] transition-colors">{step.title}</h3>
                   <p className="text-[#5F4E3C] text-xl leading-relaxed font-bold">{step.desc}</p>
                 </motion.div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM INTEGRATIONS GRID ── */}
      <section className="py-32 relative z-10 bg-[#EAE0D6] border-y border-[#DBC1A7]">
         <div className="max-w-[1400px] mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-[#1C150E] mb-6">Works everywhere you do. Out of the box.</h2>
            <p className="text-[#5F4E3C] text-2xl max-w-3xl mx-auto mb-20 font-bold">Because COS reads the screen visually, it has <span className="text-[#B13BFF] font-black">100% integration</span> with every app you have ever installed. No APIs required.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
               {['VS Code', 'Slack', 'Discord', 'Chrome', 'Notion', 'Figma', 'Terminal', 'Zoom', 'Word', 'Excel', 'GitHub', 'Linear'].map(app => (
                 <div key={app} className="bg-[#FFFDFB]/40 border border-[#DBC1A7] rounded-2xl py-8 px-4 flex items-center justify-center hover:bg-[#B13BFF] hover:border-[#B13BFF] hover:text-white text-[#2A2015] font-black text-xl transition-all duration-300 hover:scale-110 cursor-pointer shadow-sm">
                   {app}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── SECURITY / PRIVACY SPOTLIGHT ── */}
      <section id="privacy" className="py-40 relative z-10 bg-[#F0DEC8]">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -10 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true }} className="w-full lg:w-2/5 flex justify-center hover:scale-110 transition-transform duration-700 drop-shadow-xl">
            <Lock strokeWidth={1} className="w-64 h-64 text-[#B13BFF]" />
          </motion.div>
          <div className="w-full lg:w-3/5">
            <motion.h2 initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-5xl md:text-7xl font-black text-[#1C150E] mb-8 leading-[1.1]">
              Uncompromising <br/><span className="text-[#FF7A00]">Data Sovereignty.</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-2xl text-[#5F4E3C] mb-12 leading-relaxed font-bold">
              The COS Engine and its quantized Large Language Models run entirely bare-metal on your silicon. Zero telemetry logs. Zero secretive cloud dependencies. Your memories remain cryptographically yours, forever.
            </motion.p>
            <motion.ul initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Local AES-256 encrypted Database",
                "Runs fully air-gapped",
                "Instant 'Burn All Data' killswitch",
                "Zero analytics tracking"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-[#1C150E] font-black text-xl bg-[#FFFDFB]/60 p-4 rounded-xl border border-[#DBC1A7] hover:border-[#B13BFF] transition-colors shadow-sm">
                  <Check strokeWidth={3} className="text-[#FF7A00] w-6 h-6" /> {item}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-32 relative z-10 bg-[#EAE0D6] border-y border-[#DBC1A7]">
        <div className="max-w-[800px] mx-auto px-6">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-6xl font-black text-[#1C150E] mb-6">Frequent Questions.</h2>
             <p className="text-[#5F4E3C] text-xl font-bold">Everything you need to know about integrating the Engine into your stack.</p>
           </div>
           <div className="bg-[#FFFDFB]/80 border border-[#DBC1A7] p-8 md:p-12 rounded-3xl shadow-xl">
             <FAQItem question="Does COS hurt my battery life or consume massive CPU?" answer="No. Because COS heavily leverages hardware-accelerated NPUs on modern devices and quantizes our models, background processing typically consumes less than 1% CPU utilization on modern chips." />
             <FAQItem question="Can my employer see what COS captures?" answer="Absolutely not. COS is entirely air-gapped. The SQLite database is encrypted and locked strictly to your OS user profile. There are zero dashboards or cloud-syncing capabilities that administrators can hook into." />
             <FAQItem question="Do I need to install plugins for Chrome or VSCode?" answer="Negative. COS uses system-level accessibility APIs to read the literal frame buffer and text trees of your screen. No integrations required." />
           </div>
        </div>
      </section>

      {/* ── MASSIVE FINAL CTA ── */}
      <section className="py-40 md:py-60 relative z-10 flex flex-col items-center justify-center text-center px-6 border-t border-white/50 bg-[#F0DEC8]">
         <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#B13BFF] to-[#FF7A00] flex items-center justify-center text-white shadow-[0_0_50px_rgba(177,59,255,0.4)] mb-12 animate-bounce">
            <Zap className="w-12 h-12" />
         </motion.div>

         <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-6xl md:text-8xl lg:text-9xl font-black text-[#1C150E] mb-8 tracking-tighter drop-shadow-md">
           Ready to augment <br/> your mind?
         </motion.h2>
         <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-2xl md:text-4xl font-black text-[#5F4E3C] max-w-4xl mb-16 drop-shadow-sm">
           Join the private beta elite and systematically eliminate context switching forever. You owe it to your focus.
         </motion.p>
         <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
            <button onClick={() => navigate('/home')} className="bg-[#2A2015] text-white font-black text-3xl px-20 py-8 rounded-[2rem] transition-all duration-300 shadow-2xl hover:shadow-[0_0_60px_rgba(255,122,0,0.6)] hover:bg-[#FF7A00] hover:-translate-y-3 hover:scale-105 flex items-center gap-4">
              Launch COS Now <Rocket className="w-8 h-8" />
            </button>
            <div className="flex items-center gap-8 mt-10">
               <p className="text-[#2A2015] font-black text-lg flex items-center gap-2"><Check className="text-[#B13BFF] w-6 h-6"/> Free for individuals</p>
               <p className="text-[#2A2015] font-black text-lg flex items-center gap-2"><Check className="text-[#B13BFF] w-6 h-6"/> No card required</p>
            </div>
         </motion.div>
      </section>

      {/* ── MEGA PREMIUM FOOTER ── */}
      <footer className="border-t border-[#DBC1A7] pt-24 pb-12 relative z-10 bg-[#EAE0D6]">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-16 mb-20">
           {/* Brand Col */}
           <div className="md:col-span-2">
             <div className="flex items-center gap-4 font-black text-3xl mb-6">
               <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B13BFF] to-[#FF7A00] flex items-center justify-center shadow-lg">
                 <Sparkles className="w-5 h-5 text-white" />
               </span>
               <span className="text-[#1C150E] tracking-widest">COS</span> 
             </div>
             <p className="text-[#5F4E3C] text-lg font-bold leading-relaxed max-w-sm mb-10">
               The world's first entirely passive, locally executed Cognitive Engine designed exclusively to augment human bandwidth.
             </p>
             <div className="flex flex-col gap-4 max-w-sm">
                <span className="font-black text-[#2A2015] uppercase tracking-widest text-sm">Join the Insider Newsletter</span>
                <div className="flex">
                   <input type="email" placeholder="elon@x.com" className="bg-[#FFFDFB] border border-[#DBC1A7] text-[#2A2015] px-4 py-3 rounded-l-xl focus:outline-none focus:border-[#B13BFF] w-full" />
                   <button className="bg-[#2A2015] hover:bg-[#B13BFF] text-white px-6 font-bold rounded-r-xl transition-colors">Subscribe</button>
                </div>
             </div>
           </div>

           {/* Links Cols */}
           <div>
             <h4 className="text-[#1C150E] font-black text-xl mb-6 tracking-wide">Platform</h4>
             <ul className="space-y-4 font-bold text-[#8B7355]">
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">Download Window</a></li>
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">Mac waitlist</a></li>
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">Linux builds</a></li>
             </ul>
           </div>

           <div>
             <h4 className="text-[#1C150E] font-black text-xl mb-6 tracking-wide">Resources</h4>
             <ul className="space-y-4 font-bold text-[#8B7355]">
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">Whitepaper</a></li>
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">API Reference</a></li>
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">Security Architecture</a></li>
             </ul>
           </div>

           <div>
             <h4 className="text-[#1C150E] font-black text-xl mb-6 tracking-wide">Company</h4>
             <ul className="space-y-4 font-bold text-[#8B7355]">
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">About the Team</a></li>
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">Contact Support</a></li>
               <li><a href="#" className="hover:text-[#B13BFF] transition-colors">Twitter (X)</a></li>
             </ul>
           </div>
        </div>
      </footer>

      {/* Global Style overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(800px); opacity: 0; }
        }
        .animate-scanline { animation: scanline 4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease infinite; }
        @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}} />
    </div>
  );
}
