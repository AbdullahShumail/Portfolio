import React, { useEffect, useRef, useState } from 'react';
import { WebsiteData, WebsiteSection } from '../types';

interface PreviewProps {
  data: WebsiteData;
}

const TRANSLATIONS: Record<string, { jp: string; es: string; fr: string }> = {
  "Founder & Full-stack developer": { jp: "創設者＆エンジニア", es: "Fundador y Desarrollador", fr: "Fondateur & Développeur" },
  "GET IN": { jp: "入る", es: "ENTRAR", fr: "ENTRER" },
  "TOUCH": { jp: "触れる", es: "CONTACTO", fr: "CONTACT" },
};

const LanguageSwapText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    setDisplayText(text);
    return () => {
      timeoutRefs.current.forEach(t => clearTimeout(t));
      timeoutRefs.current = [];
    };
  }, [text]);

  const handleMouseEnter = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const trans = TRANSLATIONS[text] || { jp: "???", es: "???", fr: "???" };
    
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];

    const sequence = [
      { t: trans.jp, d: 150 },
      { t: trans.es, d: 300 },
      { t: trans.fr, d: 450 },
      { t: text, d: 600 }
    ];

    sequence.forEach(({ t, d }) => {
      const timeout = window.setTimeout(() => {
        setDisplayText(t);
        if (d === 600) setIsAnimating(false);
      }, d);
      timeoutRefs.current.push(timeout);
    });
  };

  return (
    <span 
      onMouseEnter={handleMouseEnter} 
      className={`${className} cursor-default inline-block select-none`}
    >
      {displayText}
    </span>
  );
};

const ParticleBackground: React.FC<{ hoveredId: string | null; scrollContainer: React.RefObject<HTMLDivElement | null> }> = ({ hoveredId, scrollContainer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const targetsRef = useRef<Record<string, { rect: DOMRect; shape: string }>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 2600;

    const updateTargetRects = () => {
      const targetEls = document.querySelectorAll('.particle-target');
      const newTargets: Record<string, { rect: DOMRect; shape: string }> = {};
      targetEls.forEach((el) => {
        const id = el.getAttribute('data-target-id');
        if (id) {
          newTargets[id] = {
            rect: el.getBoundingClientRect(),
            shape: el.getAttribute('data-shape') || 'frame'
          };
        }
      });
      targetsRef.current = newTargets;
    };

    class Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      size: number;
      opacity: number;
      color: { r: number, g: number, b: number };
      ease: number;
      alphaEase: number;
      offset: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.originX = this.x;
        this.originY = this.y;
        this.size = Math.random() * 0.7 + 0.3;
        this.opacity = 0;
        this.color = { r: 255, g: 120, b: 0 };
        this.ease = 0.05 + Math.random() * 0.05;
        this.alphaEase = 0.04 + Math.random() * 0.02;
        this.offset = Math.random() * 1000;
      }

      update(activeId: string | null) {
        let targetX = this.originX;
        let targetY = this.originY;
        let targetOpacity = 0;
        let currentEase = this.ease;

        if (activeId && targetsRef.current[activeId]) {
          const { rect, shape } = targetsRef.current[activeId];
          const padding = 120;
          const isNear = 
            this.originX > rect.left - padding &&
            this.originX < rect.right + padding &&
            this.originY > rect.top - padding &&
            this.originY < rect.bottom + padding;

          if (isNear) {
            targetOpacity = 0.95;
            currentEase = 0.09 + Math.random() * 0.05;

            if (shape === 'left-line') {
              targetX = rect.left - 12;
              targetY = rect.top + ((this.offset * 1234) % rect.height);
              this.color = { r: 255, g: 150, b: 20 };
            } else if (shape === 'circle') {
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const r = (rect.width / 2) + 15;
              const angle = (this.offset + Date.now() * 0.00015) % (Math.PI * 2);
              targetX = centerX + Math.cos(angle) * r;
              targetY = centerY + Math.sin(angle) * r;
              this.color = { r: 255, g: 180, b: 50 };
            } else if (shape === 'frame') {
              const perimeter = 2 * (rect.width + rect.height);
              const pos = (this.offset * 0.8) % perimeter;
              if (pos < rect.width) {
                targetX = rect.left + pos; targetY = rect.top - 10;
              } else if (pos < rect.width + rect.height) {
                targetX = rect.right + 10; targetY = rect.top + (pos - rect.width);
              } else if (pos < 2 * rect.width + rect.height) {
                targetX = rect.right - (pos - (rect.width + rect.height)); targetY = rect.bottom + 10;
              } else {
                targetX = rect.left - 10; targetY = rect.bottom - (pos - (2 * rect.width + rect.height));
              }
              this.color = { r: 255, g: 140, b: 30 };
            }
          }
        }

        this.x += (targetX - this.x) * currentEase;
        this.y += (targetY - this.y) * currentEase;
        this.opacity += (targetOpacity - this.opacity) * this.alphaEase;

        const dmx = this.x - mouse.current.x;
        const dmy = this.y - mouse.current.y;
        const distSq = dmx * dmx + dmy * dmy;
        const ringRadius = 18;

        if (distSq < ringRadius * ringRadius) {
          const dist = Math.sqrt(distSq);
          const force = (ringRadius - dist) / ringRadius;
          this.x += (dmx / dist) * force * 1.8;
          this.y += (dmy / dist) * force * 1.8;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        if (this.opacity < 0.02) return;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        context.fill();
        if (this.opacity > 0.6) {
          context.shadowBlur = 4;
          context.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.3)`;
        } else {
          context.shadowBlur = 0;
        }
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateTargetRects();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update(hoveredId);
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      updateTargetRects();
    };

    const container = scrollContainer.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    init();
    animate();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', init);
    };
  }, [hoveredId, scrollContainer]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

const FloatingDock = ({ scrollTo }: { scrollTo: (id: string) => void }) => {
  const icons = [
    { id: 'projects', label: 'Projects', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>, action: () => scrollTo('projects') },
    { id: 'linkedin', label: 'LinkedIn', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>, action: () => window.open('https://linkedin.com', '_blank') },
    { id: 'home', label: 'Home', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, action: () => scrollTo('hero') },
    { id: 'github', label: 'GitHub', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>, action: () => window.open('https://github.com', '_blank') },
    { id: 'contact', label: 'Contact', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>, action: () => scrollTo('contact') },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-[1.25rem] shadow-2xl">
      {icons.map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          className="relative group w-11 h-11 flex items-center justify-center rounded-[0.9rem] bg-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-300 active:scale-95"
        >
          {item.icon}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap uppercase tracking-widest border border-white/10 scale-90 group-hover:scale-100">
            {item.label}
          </div>
        </button>
      ))}
    </div>
  );
};

const SectionRenderer: React.FC<{ 
  section: WebsiteSection, 
  theme: WebsiteData['theme'], 
  name: string, 
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>,
  onHover: (id: string | null) => void,
  hoveredTarget: string | null
}> = ({ section, theme, name, sectionRefs, onHover, hoveredTarget }) => {
  const isDark = theme.mode === 'dark';
  const textColor = isDark ? 'text-indigo-50/90' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-indigo-200/40' : 'text-gray-600';
  const accentColor = 'text-orange-900/60';

  switch (section.type) {
    case 'hero':
      return (
        <section 
          ref={(el) => { sectionRefs.current['hero'] = el; }}
          className={`relative min-h-screen flex flex-col items-start justify-center bg-transparent px-8 md:px-16 lg:px-32 overflow-hidden pt-32`}
        >
          <div className="absolute top-0 left-0 w-full p-12 z-40">
            <span className={`text-xl font-black tracking-tighter ${textColor}`}>Abdullah S.</span>
          </div>

          <div className="relative z-10 max-w-5xl w-full">
            {/* Status dot and "Available for new projects" text synchronized with name hover */}
            <div className={`inline-flex items-center gap-4 px-4 py-2 rounded-full border border-orange-500/10 bg-orange-500/5 mb-12 transition-all duration-700 ${hoveredTarget === 'name-target' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-200/60">
                Available for new projects
              </span>
            </div>

            <div className="inline-block relative">
              <h1 
                data-target-id="name-target"
                data-shape="left-line"
                onMouseEnter={() => onHover('name-target')}
                onMouseLeave={() => onHover(null)}
                className={`particle-target inline-block text-7xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter ${textColor} mb-4 leading-[0.85] cursor-default`}
              >
                {name}
              </h1>
            </div>
            
            <h2 className={`text-base md:text-xl font-bold uppercase tracking-[0.2em] ${secondaryTextColor} mb-12`}>
              <LanguageSwapText text="Founder & Full-stack developer" />
            </h2>

            <p className={`text-lg md:text-2xl max-w-2xl leading-relaxed font-medium ${secondaryTextColor} mb-16`}>
              {section.content}
            </p>

            <div className="flex gap-8 items-center border-t border-white/5 pt-12">
               <div>
                 <p className={`text-4xl font-black ${textColor}`}>5+</p>
                 <p className={`text-[10px] uppercase tracking-[0.4em] font-black ${secondaryTextColor}`}>Experiences</p>
               </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,100,0,0.02)_0%,_transparent_50%)]"></div>
        </section>
      );

    case 'projects':
      return (
        <section 
          ref={(el) => { sectionRefs.current['projects'] = el; }}
          id="projects" 
          className={`py-48 px-12 relative z-20 border-t border-white/5`}
        >
          <div className="max-w-7xl mx-auto">
             <div className="mb-32">
                 <p className={`text-[12px] uppercase tracking-[0.5em] font-black ${accentColor} mb-6`}>
                   Recent Works
                 </p>
                 <h2 
                   data-target-id="portfolio-target"
                   data-shape="frame"
                   onMouseEnter={() => onHover('portfolio-target')}
                   onMouseLeave={() => onHover(null)}
                   className={`particle-target text-7xl md:text-9xl font-black tracking-tighter ${textColor} leading-none inline-block cursor-default`}
                 >
                   Portfolio
                 </h2>
             </div>
             <div className="grid md:grid-cols-2 gap-x-24 gap-y-32">
               {section.items?.map((p, idx) => (
                 <div 
                   key={idx} 
                   className="group cursor-pointer"
                   onClick={() => p.category && p.category !== '#' && window.open(p.category, '_blank')}
                 >
                    <div className="aspect-[16/10] bg-zinc-950/80 rounded-[2.5rem] overflow-hidden mb-10 relative border border-white/5 shadow-2xl backdrop-blur-sm transition-transform duration-700 group-hover:scale-[1.02]">
                       <img 
                         src={p.icon || `https://picsum.photos/1200/800?random=${idx + 200}`} 
                         alt={p.title} 
                         className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0" 
                       />
                       <div className="absolute inset-0 bg-orange-950/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                       </div>
                    </div>
                    <div>
                       <h3 className={`text-4xl font-black ${textColor} mb-4 group-hover:text-orange-500 transition-colors`}>
                         {p.title}
                       </h3>
                       <p className={`text-lg font-medium ${secondaryTextColor} leading-relaxed`}>
                         {p.description}
                       </p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </section>
      );

    case 'contact':
      return (
        <section 
          ref={(el) => { sectionRefs.current['contact'] = el; }}
          id="contact" 
          className={`py-48 px-12 border-t border-white/5 relative overflow-hidden`}
        >
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-24 relative z-10">
              <div className="flex-1">
                 <p className={`font-black text-sm ${accentColor} uppercase tracking-[0.5em] mb-12`}>Connection</p>
                 <h2 className={`text-7xl md:text-[8rem] font-black tracking-tighter ${textColor} leading-[0.85] mb-20 uppercase`}>
                   Ready for<br/>impact?
                 </h2>
                 <div className="space-y-8">
                   <p className={`text-3xl font-bold ${textColor}`}>{name.toLowerCase().replace(' ', '.')}@dev.io</p>
                 </div>
              </div>
              
              <div 
                data-target-id="contact-target"
                data-shape="circle"
                onMouseEnter={() => onHover('contact-target')}
                onMouseLeave={() => onHover(null)}
                onClick={() => window.location.href = `mailto:${name.toLowerCase().replace(' ', '.')}@dev.io`}
                className="particle-target w-64 h-64 md:w-96 md:h-96 rounded-full border border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-white font-black text-3xl hover:border-orange-900/30 transition-all duration-700 cursor-pointer shadow-2xl group relative overflow-hidden backdrop-blur-md"
              >
                <div className="absolute inset-0 border-2 border-dashed border-orange-900/0 group-hover:border-orange-900/40 rounded-full group-hover:rotate-180 transition-all duration-[2000ms] scale-95 group-hover:scale-105"></div>
                <div className="relative z-10 text-center space-y-2 group-hover:scale-110 transition-transform duration-500">
                   <span className="block text-[12px] tracking-[0.4em] text-orange-900/80 mb-2 font-black">
                     <LanguageSwapText text="GET IN" />
                   </span>
                   <span className={`block text-5xl tracking-tighter ${textColor} group-hover:text-white transition-colors`}>
                     <LanguageSwapText text="TOUCH" />
                   </span>
                </div>
              </div>
           </div>
        </section>
      );

    default:
      return null;
  }
};

const Preview: React.FC<PreviewProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  const scrollTo = (id: string) => {
    const section = sectionRefs.current[id];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="h-full overflow-y-auto w-full bg-[#050505] scroll-smooth selection:bg-orange-900 selection:text-white relative">
      <ParticleBackground hoveredId={hoveredTarget} scrollContainer={containerRef} />
      <div className="relative z-10 flex flex-col">
        {data.sections.map((section) => (
          <SectionRenderer 
            key={section.id} 
            section={section} 
            theme={data.theme} 
            name={data.name} 
            sectionRefs={sectionRefs}
            onHover={setHoveredTarget}
            hoveredTarget={hoveredTarget}
          />
        ))}
        
        <footer className="bg-black/40 backdrop-blur-xl py-20 px-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-zinc-800 uppercase tracking-[0.6em] border-t border-white/5 gap-12 relative z-10">
           <div className="flex flex-col items-center md:items-start gap-4">
              <p className="text-zinc-600">© 2025 ABDULLAH SHUMAIL</p>
           </div>
           <div className="flex gap-16">
              <span onClick={() => window.open('https://github.com', '_blank')} className="hover:text-white transition-colors cursor-pointer">GH</span>
              <span onClick={() => window.open('https://linkedin.com', '_blank')} className="hover:text-white transition-colors cursor-pointer">LN</span>
           </div>
        </footer>
      </div>
      <FloatingDock scrollTo={scrollTo} />
    </div>
  );
};

export default Preview;