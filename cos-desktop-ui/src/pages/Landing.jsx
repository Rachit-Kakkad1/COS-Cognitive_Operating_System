import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  bg:        '#020818',    // deep space black
  surface:   '#0d1b2e',    // dark navy card
  border:    '#1a2d4a',    // subtle border
  purple:    '#6366f1',    // primary purple
  teal:      '#14b8a6',    // secondary teal
  amber:     '#f59e0b',    // teams amber
  text:      '#f0f4ff',    // bright white
  muted:     '#8899aa',    // muted text
  glow:      'rgba(99,102,241,0.15)',  // purple glow
};

export default function Landing() {
  const navigate = useNavigate();

  // --- STATE FOR NAVBAR ---
  const [scrolled,    setScrolled]    = useState(false);
  const [lastScroll,  setLastScroll]  = useState(0);
  const [navVisible,  setNavVisible]  = useState(true);

  // --- STATE FOR TYPEWRITER ---
  const phrases = [
    "You were debugging FastAPI authentication...",
    "You were studying Chapter 4 — Heat Transfer...",
    "Your team was working on Series A valuation...",
    "You were drafting the HackCrux vendor email...",
    "You were reviewing the Q2 budget spreadsheet...",
  ];
  const [phraseIdx,  setPhraseIdx]  = useState(0);
  const [displayed,  setDisplayed]  = useState('');
  const [typing,     setTyping]     = useState(true);

  // --- STATE FOR HERO VISIBILITY ---
  const [heroVisible, setHeroVisible] = useState(false);

  // --- STATE FOR STATS COUNTER ---
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({ models:0, local:0, market:0, humans:0 });

  // --- STATE FOR HOW IT WORKS ---
  const stepsRef = useRef(null);
  const [stepsVisible, setStepsVisible] = useState(false);

  // --- STATE FOR PRODUCT CARDS ---
  const cardsRef = useRef(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  // --- STATE FOR COMPARISON ---
  const compareRef = useRef(null);
  const [compareVisible, setCompareVisible] = useState(false);

  // --- STATE FOR ROI CALCULATOR ---
  const [teamSize, setTeamSize] = useState(25);

  // --- EFFECTS FOR GLOBAL ANIMATIONS ---
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(40px) }
        to   { opacity:1; transform:translateY(0) }
      }
      @keyframes fadeIn {
        from { opacity:0 }
        to   { opacity:1 }
      }
      @keyframes float {
        0%,100% { transform:translateY(0px) }
        50%     { transform:translateY(-12px) }
      }
      @keyframes pulse {
        0%,100% { opacity:0.4; transform:scale(1) }
        50%     { opacity:1;   transform:scale(1.05) }
      }
      @keyframes glow {
        0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.3) }
        50%     { box-shadow: 0 0 40px rgba(99,102,241,0.6) }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center }
        100% { background-position: 200% center }
      }
      @keyframes drawLine {
        from { stroke-dashoffset: 1000 }
        to   { stroke-dashoffset: 0 }
      }
      @keyframes nodePulse {
        0%,100% { r:4; opacity:0.6 }
        50%     { r:7; opacity:1 }
      }
      @keyframes countUp {
        from { opacity:0; transform:translateY(20px) }
        to   { opacity:1; transform:translateY(0) }
      }
      @keyframes typewriter {
        from { width:0 }
        to   { width:100% }
      }
      @keyframes blink {
        0%,50%  { border-color:transparent }
        51%,100%{ border-color:#6366f1 }
      }
      @keyframes slideInLeft {
        from { opacity:0; transform:translateX(-60px) }
        to   { opacity:1; transform:translateX(0) }
      }
      @keyframes slideInRight {
        from { opacity:0; transform:translateX(60px) }
        to   { opacity:1; transform:translateX(0) }
      }
      @keyframes rotate {
        from { transform:rotate(0deg) }
        to   { transform:rotate(360deg) }
      }
      @keyframes gradientShift {
        0%   { background-position:0% 50% }
        50%  { background-position:100% 50% }
        100% { background-position:0% 50% }
      }
      .card-hover {
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
      }
      .card-hover:hover {
        transform: translateY(-8px) scale(1.02) !important;
      }
      .btn-hover {
        transition: all 0.2s ease !important;
      }
      .btn-hover:hover {
        transform: translateY(-2px) !important;
        filter: brightness(1.15) !important;
      }
      .nav-link {
        transition: color 0.2s ease !important;
        cursor: pointer !important;
      }
      .nav-link:hover { color: #6366f1 !important; }
      ::-webkit-scrollbar { width: 4px }
      ::-webkit-scrollbar-track { background: #020818 }
      ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // --- NAVBAR SCROLL EFFECT ---
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);
      setNavVisible(current < lastScroll || current < 100);
      setLastScroll(current);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScroll]);

  // --- TYPEWRITER EFFECT ---
  useEffect(() => {
    const phrase = phrases[phraseIdx];
    if (typing) {
      if (displayed.length < phrase.length) {
        const t = setTimeout(() =>
          setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 2000);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() =>
          setDisplayed(displayed.slice(0,-1)), 30);
        return () => clearTimeout(t);
      } else {
        setPhraseIdx(i => (i+1) % phrases.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, phraseIdx]);

  // --- HERO VISIBILITY ---
  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 300);
  }, []);

  // --- INTERSECTION OBSERVERS ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStepsVisible(true); },
      { threshold: 0.2 }
    );
    if (stepsRef.current) observer.observe(stepsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCardsVisible(true); },
      { threshold: 0.1 }
    );
    if (cardsRef.current) observer.observe(cardsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCompareVisible(true); },
      { threshold: 0.2 }
    );
    if (compareRef.current) observer.observe(compareRef.current);
    return () => observer.disconnect();
  }, []);

  // --- STATS COUNTER LOGIC ---
  useEffect(() => {
    if (!statsVisible) return;
    const targets = { models:8, local:100, market:565, humans:6 };
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        models:  Math.floor(ease * targets.models),
        local:   Math.floor(ease * targets.local),
        market:  Math.floor(ease * targets.market),
        humans:  Math.floor(ease * targets.humans),
      });
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [statsVisible]);

  // --- COGNITIVE GRAPH GEN ---
  const graphNodes = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x:  Math.random() * 100,
      y:  Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  const graphEdges = useMemo(() => {
    const edges = [];
    graphNodes.forEach((node, i) => {
      const nearby = graphNodes.filter((n, j) => {
        if (j <= i) return false;
        const dx = node.x - n.x;
        const dy = node.y - n.y;
        return Math.sqrt(dx*dx + dy*dy) < 25;
      });
      nearby.slice(0,2).forEach(n => {
        edges.push({
          x1: node.x, y1: node.y,
          x2: n.x,    y2: n.y,
          delay: Math.random() * 3
        });
      });
    });
    return edges;
  }, [graphNodes]);

  // --- 3D TILT HELPERS ---
  const handleTilt = (e, cardEl) => {
    const rect = cardEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    cardEl.style.transform =
      `perspective(1000px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-8px) scale(1.02)`;
  };
  const resetTilt = (cardEl) => {
    cardEl.style.transform =
      cardEl.dataset.popular === 'true'
        ? 'scale(1.04)'
        : 'perspective(1000px) rotateY(0) rotateX(0) translateY(0) scale(1)';
  };

  // --- DATA ---
  const STEPS = [
    {
      icon: '📡',
      title: 'COS captures silently',
      desc: 'Every app switch, every context change, every moment of work — captured passively. No manual input. No interruption.',
      tech: 'Win32API · Tesseract OCR · Chrome Extension',
      color: '#6366f1',
      delay: 0,
    },
    {
      icon: '🧠',
      title: 'Semantic understanding built',
      desc: 'MiniLM converts every snapshot into meaning vectors. DBSCAN clusters related work. networkx connects the cognitive graph.',
      tech: 'all-MiniLM-L6-v2 · FAISS · networkx',
      color: '#14b8a6',
      delay: 0.3,
    },
    {
      icon: '🎙️',
      title: 'You recall in 1 second',
      desc: 'Just speak. RNNoise strips background noise. WebRTC VAD detects speech. Whisper transcribes. COS restores your exact thinking.',
      tech: 'Whisper small · RNNoise · WebRTC VAD',
      color: '#f59e0b',
      delay: 0.6,
    },
  ];

  const PRODUCTS = [
    {
      id:       'personal',
      icon:     '🧠',
      name:     'COS Personal',
      tagline:  'For every human',
      desc:     'Adapts to you — professional, student, child, senior, or parent. 5 complete modes.',
      price:    'Free',
      priceDesc:'→ Pro $9.99/month',
      color:    '#6366f1',
      features: ['Context recall + voice','Cognitive graph','Tab Guardian','6 time periods timeline','System health monitor'],
      cta:      '→ Try Personal',
      action:   () => navigate('/home'),
      popular:  false,
    },
    {
      id:       'teams',
      icon:     '⚡',
      name:     'COS Teams',
      tagline:  'For co-founders + small teams',
      desc:     'Shared cognitive memory. Transfer thinking via QR code in 4 seconds.',
      price:    '$24.99',
      priceDesc:'/team/month · up to 10',
      color:    '#f59e0b',
      features: ['Everything in Personal','Shared cognitive graph','Cognitive Handoff QR','Co-founder view','Weekly team report'],
      cta:      '→ Get Teams',
      action:   () => alert('Coming soon — contact us!'),
      popular:  true,
    },
    {
      id:       'worksense',
      icon:     '🏢',
      name:     'COS WorkSense',
      tagline:  'For managers + enterprises',
      desc:     'Live cognitive dashboard for every employee. No CCTV required.',
      price:    '$49',
      priceDesc:'/month · up to 50 employees',
      color:    '#14b8a6',
      features: ['Manager live dashboard','Employee IDs + passwords','Productivity Matrix','Focus Intelligence Report','CPU + Power monitor'],
      cta:      '→ Get WorkSense',
      action:   () => navigate('/worksense'),
      popular:  false,
    },
  ];

  const THEM = [
    'Takes screenshots of everything',
    'Logs every keystroke',
    'Stores raw screen content',
    'Requires cloud processing',
    'Destroys employee trust',
    'Records passwords + private data',
    'Manual input required',
  ];
  const US = [
    'Captures semantic patterns only',
    'Zero keystroke logging ever',
    'Embeddings only — no raw content',
    'Runs 100% on your device',
    'Employee always informed',
    'Passwords never captured',
    'Fully passive — zero manual input',
  ];

  const testimonials = [
    {
      quote: "I switch contexts 20 times a day debugging. COS gives me back the 30 minutes I used to spend reconstructing my mental state after every interruption.",
      name:  "Arjun K.",
      role:  "Senior Backend Developer",
      avatar:'👨💻', color:'#6366f1'
    },
    {
      quote: "As a founder juggling investor prep, product decisions, and team management — losing my decision logic mid-thought was costing me hours. COS fixed that.",
      name:  "Priya M.",
      role:  "Co-founder & CEO",
      avatar:'🚀', color:'#14b8a6'
    },
    {
      quote: "I manage 12 engineers. With COS WorkSense I can see who's in deep focus and who needs a check-in without sending a single Slack message.",
      name:  "Rahul S.",
      role:  "Engineering Manager",
      avatar:'🏢', color:'#f59e0b'
    },
  ];

  // --- ROI CALCS ---
  const mgmtHours  = (teamSize * 1.8).toFixed(0);
  const weeklyCost = (teamSize * 1.8 * 80).toLocaleString();
  const annualCost = (teamSize * 1.8 * 80 * 52);
  const cosAnnual  = 49 * 12;
  const roi        = ((annualCost - cosAnnual) / cosAnnual * 100).toFixed(0);
  const payback    = (cosAnnual / annualCost * 365).toFixed(1);

  return (
    <div style={{ background:'#020818', color:'#f0f4ff', fontFamily:'-apple-system, Inter, sans-serif', overflowX:'hidden' }}>
      
      {/* SECTION 1 — NAVBAR */}
      <nav style={{
        position:        'fixed',
        top:             navVisible ? 0 : '-80px',
        left:            0, right: 0,
        height:          '64px',
        background:      scrolled ? 'rgba(2,8,24,0.92)' : 'transparent',
        backdropFilter:  scrolled ? 'blur(20px)' : 'none',
        borderBottom:    scrolled ? '1px solid #1a2d4a' : 'none',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         '0 80px',
        zIndex:          1000,
        transition:      'all 0.3s ease',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'32px', height:'32px',
            background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
            borderRadius:'8px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'16px', animation:'glow 3s ease-in-out infinite'
          }}>🧠</div>
          <span style={{ color:'#f0f4ff', fontWeight:700, fontSize:'18px' }}>COS</span>
          <span style={{ color:'#8899aa', fontSize:'12px', marginLeft:'4px' }}>Cognitive Operating System</span>
        </div>
        <div style={{ display:'flex', gap:'32px' }}>
          {['Features','How It Works','Products','About','Compare'].map(link => (
            <span key={link} className="nav-link"
              style={{ color:'#8899aa', fontSize:'14px' }}
              onClick={() => document.getElementById(link.toLowerCase().replace(/\s+/g, '-'))?.scrollIntoView({ behavior:'smooth' })}>
              {link}
            </span>
          ))}
        </div>
        <button className="btn-hover" onClick={() => navigate('/home')}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color:'#fff', border:'none', borderRadius:'10px',
            padding:'10px 24px', fontSize:'14px', fontWeight:600,
            cursor:'pointer', animation:'glow 3s ease-in-out infinite'
          }}>
          → Try COS Free
        </button>
      </nav>

      {/* SECTION 2 — HERO */}
      <section id="features" style={{
        minHeight:     '100vh',
        position:      'relative',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        overflow:      'hidden',
        background:    'radial-gradient(ellipse at 50% 50%, #0d1b2e 0%, #020818 70%)',
      }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.35 }}>
          {graphEdges.map((e,i) => (
            <line key={i} x1={`${e.x1}%`} y1={`${e.y1}%`} x2={`${e.x2}%`} y2={`${e.y2}%`} stroke='#6366f1' strokeWidth='0.8' strokeDasharray='1000'
              style={{ animation:`drawLine 3s ease forwards`, animationDelay:`${e.delay}s`, strokeDashoffset:'1000' }}
            />
          ))}
          {graphNodes.map(n => (
            <circle key={n.id} cx={`${n.x}%`} cy={`${n.y}%`} r={n.size} fill='#6366f1'
              style={{ animation:`nodePulse ${n.duration}s ease-in-out infinite`, animationDelay:`${n.delay}s` }}
            />
          ))}
        </svg>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div style={{ textAlign:'center', maxWidth:'900px', padding:'0 40px', position:'relative', zIndex:1, animation: heroVisible ? 'fadeUp 1s ease forwards' : 'none', opacity: heroVisible ? 1 : 0 }}>
          <div style={{ display:'inline-block', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.4)', borderRadius:'20px', padding:'6px 20px', fontSize:'12px', color:'#6366f1', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'32px', animation:'pulse 3s ease-in-out infinite' }}>
            🧠 Cognitive Operating System
          </div>
          <h1 style={{ fontSize:'clamp(40px, 6vw, 72px)', fontWeight:800, lineHeight:1.1, color:'#f0f4ff', marginBottom:'24px', background:'linear-gradient(135deg, #f0f4ff 0%, #6366f1 50%, #14b8a6 100%)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'gradientShift 4s linear infinite' }}>
            The AI Layer That<br/>Preserves Human Thinking
          </h1>
          <div style={{ height:'32px', marginBottom:'32px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
            <span style={{ color:'#8899aa', fontSize:'18px' }}>COS remembers:</span>
            <span style={{ color:'#14b8a6', fontSize:'18px', fontStyle:'italic', marginLeft:'8px', borderRight:'2px solid #6366f1', paddingRight:'4px', animation:'blink 1s step-end infinite' }}>{displayed}</span>
          </div>
          <p style={{ color:'#8899aa', fontSize:'18px', lineHeight:1.7, marginBottom:'48px', maxWidth:'600px', margin:'0 auto 48px' }}>
            Context recall · Cognitive graphs · Always-on voice.<br/>For individuals, teams, and enterprises. 100% local.
          </p>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', marginBottom:'64px' }}>
            <button className="btn-hover" onClick={() => navigate('/home')} style={{ background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff', border:'none', borderRadius:'12px', padding:'16px 36px', fontSize:'16px', fontWeight:700, cursor:'pointer', boxShadow:'0 0 30px rgba(99,102,241,0.4)' }}>→ Try COS Free</button>
            <button className="btn-hover" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior:'smooth' })} style={{ background:'transparent', color:'#f0f4ff', border:'1px solid #1a2d4a', borderRadius:'12px', padding:'16px 36px', fontSize:'16px', cursor:'pointer' }}>See How It Works ↓</button>
          </div>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
            {[{ label:'8 AI Models', icon:'🧠', color:'#6366f1' }, { label:'100% Local', icon:'🔒', color:'#14b8a6' }, { label:'Zero Cloud', icon:'⚡', color:'#f59e0b' }, { label:'Zero Cost', icon:'🆓', color:'#22c55e' }].map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${s.color}44`, borderRadius:'20px', padding:'8px 20px', display:'flex', alignItems:'center', gap:'8px', animation:`float ${3+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }}>
                <span>{s.icon}</span>
                <span style={{ color:s.color, fontSize:'13px', fontWeight:600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:'absolute', bottom:'40px', left:'50%', transform:'translateX(-50%)', animation:'float 2s ease-in-out infinite' }}>
          <div style={{ color:'#8899aa', fontSize:'12px', textAlign:'center', marginBottom:'8px' }}>scroll to explore</div>
          <div style={{ width:'24px', height:'40px', border:'2px solid #1a2d4a', borderRadius:'12px', margin:'0 auto', display:'flex', justifyContent:'center', paddingTop:'6px' }}>
            <div style={{ width:'4px', height:'8px', background:'#6366f1', borderRadius:'2px', animation:'float 1.5s ease-in-out infinite' }}/>
          </div>
        </div>
      </section>

      {/* SECTION 3 — STATS COUNTER */}
      <section ref={statsRef} style={{ background:'#0d1b2e', borderTop:'1px solid #1a2d4a', borderBottom:'1px solid #1a2d4a', padding:'60px 80px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'40px' }}>
        {[
          { value: counts.models, suffix:'', label:'AI Models', sublabel:'All running locally', color:'#6366f1' },
          { value: counts.local, suffix:'%', label:'Local Processing', sublabel:'Nothing leaves your device', color:'#14b8a6' },
          { value: counts.market, suffix:'B+', label:'Market ($)', sublabel:'Total addressable market', color:'#f59e0b' },
          { value: counts.humans, suffix:'', label:'Human Modes', sublabel:'Adapts to every person', color:'#22c55e' },
        ].map((s,i) => (
          <div key={i} style={{ textAlign:'center', animation: statsVisible ? `fadeUp 0.6s ease forwards` : 'none', animationDelay:`${i*0.1}s`, opacity: statsVisible ? 1 : 0 }}>
            <div style={{ fontSize:'56px', fontWeight:800, color: s.color, lineHeight:1, marginBottom:'8px', fontVariantNumeric:'tabular-nums' }}>{s.value}{s.suffix}</div>
            <div style={{ color:'#f0f4ff', fontWeight:600, fontSize:'16px', marginBottom:'4px' }}>{s.label}</div>
            <div style={{ color:'#8899aa', fontSize:'13px' }}>{s.sublabel}</div>
          </div>
        ))}
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section id="how-it-works" ref={stepsRef} style={{ padding:'100px 80px', background:'#020818' }}>
        <div style={{ textAlign:'center', marginBottom:'80px' }}>
          <div style={{ color:'#6366f1', fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px' }}>HOW IT WORKS</div>
          <h2 style={{ fontSize:'48px', fontWeight:800, color:'#f0f4ff', marginBottom:'16px' }}>Three steps. One second recall.</h2>
          <p style={{ color:'#8899aa', fontSize:'18px', maxWidth:'500px', margin:'0 auto' }}>The same cognitive engine powers every product.</p>
        </div>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'0', maxWidth:'1100px', margin:'0 auto' }}>
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ flex:1, textAlign:'center', animation: stepsVisible ? `fadeUp 0.8s ease forwards` : 'none', animationDelay:`${step.delay}s`, opacity: stepsVisible ? 1 : 0 }}>
                <div style={{ width:'48px', height:'48px', border:`2px solid ${step.color}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color: step.color, fontWeight:700, fontSize:'18px', background:`${step.color}11` }}>{i+1}</div>
                <div style={{ fontSize:'48px', marginBottom:'20px', animation:`float ${3+i}s ease-in-out infinite` }}>{step.icon}</div>
                <div style={{ background:'#0d1b2e', border:`1px solid ${step.color}33`, borderRadius:'16px', padding:'28px', margin:'0 16px', transition:'all 0.3s ease' }}>
                  <h3 style={{ color:'#f0f4ff', fontSize:'20px', fontWeight:700, marginBottom:'12px' }}>{step.title}</h3>
                  <p style={{ color:'#8899aa', fontSize:'14px', lineHeight:1.7, marginBottom:'16px' }}>{step.desc}</p>
                  <div style={{ background:`${step.color}11`, border:`1px solid ${step.color}33`, borderRadius:'8px', padding:'8px 12px', fontSize:'11px', color:step.color, fontFamily:'monospace' }}>{step.tech}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ display:'flex', alignItems:'center', paddingTop:'120px', flexShrink:0, width:'60px' }}>
                  <svg width="60" height="20" viewBox="0 0 60 20">
                    <line x1="0" y1="10" x2="50" y2="10" stroke="#6366f1" strokeWidth="2" strokeDasharray="60" style={{ animation: stepsVisible ? 'drawLine 1s ease forwards' : 'none', animationDelay:`${0.5 + i*0.3}s` }} />
                    <polygon points="50,5 60,10 50,15" fill="#6366f1" style={{ opacity: stepsVisible ? 1 : 0, transition:'opacity 0.3s ease', transitionDelay:`${1 + i*0.3}s` }} />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* SECTION 5 — PRODUCTS */}
      <section id="products" ref={cardsRef} style={{ padding:'100px 80px', background:'#020818' }}>
        <div style={{ textAlign:'center', marginBottom:'80px' }}>
          <div style={{ color:'#6366f1', fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px' }}>THREE PRODUCTS</div>
          <h2 style={{ fontSize:'48px', fontWeight:800, color:'#f0f4ff', marginBottom:'16px' }}>Built for every human</h2>
          <p style={{ color:'#8899aa', fontSize:'18px' }}>Same cognitive engine. Different experience.</p>
        </div>
        <div style={{ display:'flex', gap:'24px', justifyContent:'center', alignItems:'stretch', maxWidth:'1200px', margin:'0 auto' }}>
          {PRODUCTS.map((p, i) => (
            <div key={p.id} data-popular={p.popular} onMouseMove={e => handleTilt(e, e.currentTarget)} onMouseLeave={e => resetTilt(e.currentTarget)}
              style={{ flex:1, maxWidth:'360px', background:'#0d1b2e', border:`${p.popular ? '2px' : '1px'} solid ${p.color}${p.popular ? '' : '44'}`, borderRadius:'20px', padding:'36px', position:'relative', transform: p.popular ? 'scale(1.04)' : 'scale(1)', boxShadow: p.popular ? `0 0 40px ${p.color}22` : 'none', transition:'transform 0.2s ease, box-shadow 0.3s ease', animation: cardsVisible ? `fadeUp 0.8s ease forwards` : 'none', animationDelay:`${i*0.15}s`, opacity: cardsVisible ? 1 : 0, display:'flex', flexDirection:'column' }}>
              {p.popular && <div style={{ position:'absolute', top:'-16px', left:'50%', transform:'translateX(-50%)', background: p.color, color:'#000', padding:'6px 24px', borderRadius:'20px', fontSize:'12px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap', animation:'pulse 2s ease-in-out infinite' }}>⭐ Most Popular</div>}
              <div style={{ fontSize:'40px', marginBottom:'16px' }}>{p.icon}</div>
              <div style={{ color:p.color, fontSize:'12px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>{p.tagline}</div>
              <h3 style={{ color:'#f0f4ff', fontSize:'24px', fontWeight:700, marginBottom:'12px' }}>{p.name}</h3>
              <p style={{ color:'#8899aa', fontSize:'14px', lineHeight:1.6, marginBottom:'24px' }}>{p.desc}</p>
              <div style={{ marginBottom:'24px' }}><span style={{ color:p.color, fontSize:'40px', fontWeight:800 }}>{p.price}</span><span style={{ color:'#8899aa', fontSize:'14px', marginLeft:'8px' }}>{p.priceDesc}</span></div>
              <div style={{ height:'1px', background:'#1a2d4a', marginBottom:'24px' }}/>
              <ul style={{ listStyle:'none', padding:0, marginBottom:'32px', flex:1 }}>
                {p.features.map((f,j) => (
                  <li key={j} style={{ display:'flex', alignItems:'center', gap:'10px', color:'#c0cfe0', fontSize:'14px', marginBottom:'10px', animation: cardsVisible ? `fadeIn 0.5s ease forwards` : 'none', animationDelay:`${i*0.15 + j*0.08}s`, opacity: cardsVisible ? 1 : 0 }}><span style={{ color:'#22c55e', fontSize:'16px' }}>✓</span>{f}</li>
                ))}
              </ul>
              <button className="btn-hover" onClick={p.action} style={{ width:'100%', padding:'14px', background: p.popular ? `linear-gradient(135deg, ${p.color}, #e8920a)` : 'transparent', color: p.popular ? '#000' : p.color, border:`1px solid ${p.color}`, borderRadius:'12px', fontSize:'15px', fontWeight: p.popular ? 700 : 500, cursor:'pointer', boxShadow: p.popular ? `0 0 20px ${p.color}44` : 'none' }}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — COMPARISON */}
      <section id="compare" ref={compareRef} style={{ padding:'100px 80px', background:'#0d1b2e' }}>
        <div style={{ textAlign:'center', marginBottom:'80px' }}>
          <div style={{ color:'#6366f1', fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px' }}>WHY COS</div>
          <h2 style={{ fontSize:'48px', fontWeight:800, color:'#f0f4ff', marginBottom:'16px' }}>No direct competitor exists</h2>
          <p style={{ color:'#8899aa', fontSize:'18px' }}>They track what you clicked. We track what you were thinking.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'40px', maxWidth:'1100px', margin:'0 auto', alignItems:'start' }}>
          <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'20px', padding:'32px', animation: compareVisible ? 'slideInLeft 0.8s ease forwards' : 'none', opacity: compareVisible ? 1 : 0 }}>
            <h3 style={{ color:'#ef4444', fontSize:'18px', fontWeight:700, marginBottom:'8px' }}>Rewind · Copilot · Teramind</h3>
            <p style={{ color:'#8899aa', fontSize:'13px', marginBottom:'24px' }}>They track WHAT you clicked</p>
            {THEM.map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px', color:'#fca5a5', fontSize:'14px', animation: compareVisible ? `fadeIn 0.4s ease forwards` : 'none', animationDelay:`${0.2 + i*0.1}s`, opacity: compareVisible ? 1 : 0 }}><span style={{ color:'#ef4444', fontSize:'18px', flexShrink:0 }}>✗</span>{item}</div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'80px' }}><div style={{ width:'80px', height:'80px', background:'linear-gradient(135deg, #6366f1, #14b8a6)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:900, color:'#fff', animation:'pulse 2s ease-in-out infinite', boxShadow:'0 0 40px rgba(99,102,241,0.5)' }}>VS</div></div>
          <div style={{ background:'rgba(20,184,166,0.05)', border:'1px solid rgba(20,184,166,0.2)', borderRadius:'20px', padding:'32px', animation: compareVisible ? 'slideInRight 0.8s ease forwards' : 'none', opacity: compareVisible ? 1 : 0 }}>
            <h3 style={{ color:'#14b8a6', fontSize:'18px', fontWeight:700, marginBottom:'8px' }}>COS — Cognitive Operating System</h3>
            <p style={{ color:'#8899aa', fontSize:'13px', marginBottom:'24px' }}>We track WHAT you were THINKING</p>
            {US.map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px', color:'#6ee7b7', fontSize:'14px', animation: compareVisible ? `fadeIn 0.4s ease forwards` : 'none', animationDelay:`${0.2 + i*0.1}s`, opacity: compareVisible ? 1 : 0 }}><span style={{ color:'#22c55e', fontSize:'18px', flexShrink:0 }}>✓</span>{item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — ROI CALCULATOR */}
      <section style={{ padding:'100px 80px', background:'#020818' }}>
        <div style={{ textAlign:'center', marginBottom:'60px' }}>
          <div style={{ color:'#14b8a6', fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px' }}>ROI CALCULATOR</div>
          <h2 style={{ fontSize:'48px', fontWeight:800, color:'#f0f4ff', marginBottom:'16px' }}>See your return instantly</h2>
        </div>
        <div style={{ maxWidth:'800px', margin:'0 auto', background:'#0d1b2e', border:'1px solid #1a2d4a', borderRadius:'24px', padding:'52px', boxShadow:'0 0 60px rgba(99,102,241,0.1)' }}>
          <div style={{ marginBottom:'48px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px', alignItems:'center' }}><span style={{ color:'#f0f4ff', fontSize:'16px', fontWeight:500 }}>Team size</span><span style={{ color:'#6366f1', fontSize:'32px', fontWeight:800 }}>{teamSize} people</span></div>
            <input type="range" min="5" max="200" value={teamSize} onChange={e => setTeamSize(+e.target.value)} style={{ width:'100%', height:'6px', accentColor:'#6366f1', cursor:'pointer' }} />
            <div style={{ display:'flex', justifyContent:'space-between', color:'#8899aa', fontSize:'12px', marginTop:'8px' }}><span>5</span><span>200</span></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
            {[ { label:'Management hours saved', value:mgmtHours, suffix:' hrs/week', color:'#f59e0b' }, { label:'Weekly overhead cost', value:'$'+weeklyCost, suffix:'', color:'#ef4444' }, { label:'COS WorkSense cost', value:'$'+cosAnnual.toLocaleString(), suffix:'/year', color:'#14b8a6' }, { label:'Annual ROI', value:Number(roi).toLocaleString(), suffix:'%', color:'#22c55e' } ].map((r,i) => (
              <div key={i} style={{ background:`${r.color}08`, border:`1px solid ${r.color}33`, borderRadius:'16px', padding:'24px', textAlign:'center' }}>
                <div style={{ fontSize:'36px', fontWeight:800, color:r.color, lineHeight:1, marginBottom:'8px', transition:'all 0.3s ease', fontVariantNumeric:'tabular-nums' }}>{r.value}{r.suffix}</div>
                <div style={{ color:'#8899aa', fontSize:'13px' }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'32px', padding:'16px', background:'rgba(99,102,241,0.05)', borderRadius:'12px', border:'1px solid #1a2d4a' }}><span style={{ color:'#8899aa', fontSize:'14px' }}>Payback period: </span><span style={{ color:'#6366f1', fontWeight:700, fontSize:'18px' }}>{payback} days</span><span style={{ color:'#8899aa', fontSize:'14px' }}> · Based on $80/hr management cost</span></div>
        </div>
      </section>

      {/* SECTION 8 — ABOUT */}
      <section id="about" style={{ padding:'100px 80px', background:'#0d1b2e' }}>
        <div style={{ textAlign:'center', marginBottom:'80px' }}>
          <div style={{ color:'#6366f1', fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px' }}>ABOUT US</div>
          <h2 style={{ fontSize:'48px', fontWeight:800, color:'#f0f4ff', marginBottom:'16px' }}>Built at HackCrux 2026</h2>
          <p style={{ color:'#8899aa', fontSize:'18px', maxWidth:'600px', margin:'0 auto' }}>We are a team of developers who got frustrated losing our train of thought every time we got interrupted. So we built the fix.</p>
        </div>
        <div style={{ maxWidth:'800px', margin:'0 auto 60px', background:'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,184,166,0.08))', border:'1px solid #1a2d4a', borderRadius:'24px', padding:'48px', textAlign:'center' }}>
          <div style={{ fontSize:'48px', marginBottom:'24px' }}>🧠</div>
          <h3 style={{ color:'#f0f4ff', fontSize:'28px', fontWeight:700, marginBottom:'16px' }}>Our Mission</h3>
          <p style={{ color:'#8899aa', fontSize:'16px', lineHeight:1.8, maxWidth:'600px', margin:'0 auto' }}>The next generation of productivity tools will not just store information. They will preserve human thinking itself. We are building that infrastructure.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px', maxWidth:'900px', margin:'0 auto' }}>
          {[ { icon:'🔒', title:'Privacy First', desc:'Everything stays on your device. We could not build this any other way and sleep at night.' }, { icon:'🧠', title:'AI That Understands', desc:'Not just search. Semantic understanding of meaning, context, and cognitive relationships.' }, { icon:'👤', title:'Built for Humans', desc:'Six completely different experiences for six different types of humans. One engine underneath.' } ].map((v,i) => (
            <div key={i} className="card-hover" style={{ background:'#020818', border:'1px solid #1a2d4a', borderRadius:'16px', padding:'32px', textAlign:'center' }}>
              <div style={{ fontSize:'40px', marginBottom:'16px', animation:`float ${3+i}s ease-in-out infinite` }}>{v.icon}</div>
              <h4 style={{ color:'#f0f4ff', fontSize:'18px', fontWeight:700, marginBottom:'12px' }}>{v.title}</h4>
              <p style={{ color:'#8899aa', fontSize:'14px', lineHeight:1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9 — TESTIMONIALS */}
      <section style={{ padding:'100px 80px', background:'#020818' }}>
        <div style={{ textAlign:'center', marginBottom:'60px' }}>
          <div style={{ color:'#6366f1', fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px' }}>TESTIMONIALS</div>
          <h2 style={{ fontSize:'48px', fontWeight:800, color:'#f0f4ff' }}>What people say</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px', maxWidth:'1100px', margin:'0 auto' }}>
          {testimonials.map((t,i) => (
            <div key={i} className="card-hover" style={{ background:'#0d1b2e', border:`1px solid ${t.color}33`, borderRadius:'20px', padding:'32px', animation:`float ${4+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }}>
              <div style={{ color:'#f59e0b', marginBottom:'20px', fontSize:'16px' }}>★★★★★</div>
              <p style={{ color:'#c0cfe0', fontSize:'15px', lineHeight:1.7, marginBottom:'24px', fontStyle:'italic' }}>"{t.quote}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'44px', height:'44px', background:`${t.color}22`, border:`1px solid ${t.color}44`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{t.avatar}</div>
                <div><div style={{ color:'#f0f4ff', fontWeight:600, fontSize:'15px' }}>{t.name}</div><div style={{ color:'#8899aa', fontSize:'13px' }}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10 — PRIVACY TRUST */}
      <section style={{ background:'#0d1b2e', borderTop:'1px solid #1a2d4a', borderBottom:'1px solid #1a2d4a', padding:'60px 80px' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}><h2 style={{ fontSize:'32px', fontWeight:700, color:'#f0f4ff' }}>Privacy is not a feature. It is the architecture.</h2></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'24px', maxWidth:'1000px', margin:'0 auto' }}>
          {[ { icon:'🔒', title:'No screenshots', desc:'Ever. Not even one.' }, { icon:'📵', title:'No keystrokes', desc:'Your typing is yours.' }, { icon:'🏠', title:'100% local', desc:'Nothing leaves device.' }, { icon:'👁️', title:'Always informed', desc:'Employee sees all.' } ].map((p,i) => (
            <div key={i} className="card-hover" style={{ background:'#020818', border:'1px solid #1a2d4a', borderRadius:'16px', padding:'28px', textAlign:'center' }}>
              <div style={{ fontSize:'36px', marginBottom:'12px' }}>{p.icon}</div>
              <div style={{ color:'#f0f4ff', fontWeight:600, fontSize:'16px', marginBottom:'6px' }}>{p.title}</div>
              <div style={{ color:'#8899aa', fontSize:'13px' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 11 — FINAL CTA */}
      <section style={{ padding:'120px 80px', textAlign:'center', background:'radial-gradient(ellipse at 50% 0%, #0d1b2e 0%, #020818 60%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'800px', height:'400px', background:'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:'clamp(36px,5vw,64px)', fontWeight:800, color:'#f0f4ff', marginBottom:'24px', lineHeight:1.2 }}>Your next interruption is coming.<br/><span style={{ background:'linear-gradient(135deg, #6366f1, #14b8a6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>COS will remember where you were.</span></h2>
          <p style={{ color:'#8899aa', fontSize:'18px', marginBottom:'48px' }}>We built tools that remember files.<br/>We built tools that remember tasks.<br/>Now we build tools that remember thinking.</p>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center' }}>
            <button className="btn-hover" onClick={() => navigate('/home')} style={{ background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff', border:'none', borderRadius:'12px', padding:'18px 48px', fontSize:'18px', fontWeight:700, cursor:'pointer', boxShadow:'0 0 40px rgba(99,102,241,0.4)', animation:'glow 3s ease-in-out infinite' }}>→ Try COS Free Now</button>
            <button className="btn-hover" onClick={() => navigate('/worksense')} style={{ background:'transparent', color:'#14b8a6', border:'1px solid #14b8a6', borderRadius:'12px', padding:'18px 48px', fontSize:'18px', cursor:'pointer' }}>→ WorkSense Demo</button>
          </div>
        </div>
      </section>

      {/* SECTION 12 — FOOTER */}
      <footer style={{ background:'#020818', borderTop:'1px solid #1a2d4a', padding:'60px 80px 40px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'60px', marginBottom:'48px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}><div style={{ width:'32px', height:'32px', background:'linear-gradient(135deg, #6366f1, #14b8a6)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🧠</div><span style={{ color:'#f0f4ff', fontWeight:700, fontSize:'18px' }}>COS</span></div>
            <p style={{ color:'#8899aa', fontSize:'14px', lineHeight:1.7, maxWidth:'280px' }}>Cognitive Operating System. The AI layer that preserves human thinking. Built at HackCrux 2026.</p>
          </div>
          <div><h4 style={{ color:'#f0f4ff', fontWeight:600, marginBottom:'16px' }}>Products</h4>{['COS Personal','COS Teams','COS WorkSense'].map(p => (<div key={p} className="nav-link" style={{ color:'#8899aa', fontSize:'14px', marginBottom:'10px' }}>{p}</div>))}</div>
          <div><h4 style={{ color:'#f0f4ff', fontWeight:600, marginBottom:'16px' }}>Features</h4>{['Context Recall','Cognitive Graph','Voice Pipeline','Tab Guardian','WorkSense'].map(f => (<div key={f} className="nav-link" style={{ color:'#8899aa', fontSize:'14px', marginBottom:'10px' }}>{f}</div>))}</div>
          <div><h4 style={{ color:'#f0f4ff', fontWeight:600, marginBottom:'16px' }}>Company</h4>{['About Us','Privacy Policy','GitHub','Contact'].map(c => (<div key={c} className="nav-link" style={{ color:'#8899aa', fontSize:'14px', marginBottom:'10px' }}>{c}</div>))}</div>
        </div>
        <div style={{ borderTop:'1px solid #1a2d4a', paddingTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}><span style={{ color:'#8899aa', fontSize:'13px' }}>© 2026 COS — Cognitive Operating System · Built with ❤️ at HackCrux 2026</span><span style={{ color:'#8899aa', fontSize:'13px' }}>No cloud. No surveillance. No compromise.</span></div>
      </footer>

    </div>
  );
}
