import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white selection:bg-cyan-500/30">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Nebula Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/40 rounded-full blur-[180px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[180px] animate-pulse"></div>
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[150px]"></div>

        {/* Scanned Lines / Grid for Sci-fi feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation Badge */}
      <nav className="fixed top-8 z-50 flex items-center justify-between w-full max-w-7xl px-8">
        <div className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          NEBULA.
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold tracking-widest uppercase opacity-60">
          <a href="#" className="hover:opacity-100 transition-opacity">Universe</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Classes</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Media</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Store</a>
        </div>
        <div className="glass-morphism px-4 py-2 border-cyan-500/20 hover:border-cyan-500/50 transition-colors cursor-pointer">
          <span className="text-xs font-bold tracking-tighter text-cyan-400">PLAY NOW</span>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center gap-16 px-6 pt-32 pb-20 text-center">
        {/* Announcement Badge */}
        <div className="animate-float">
          <div className="glass-morphism px-6 py-1.5 flex items-center gap-4 bg-white/5 border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-[.3em] text-white/90 uppercase">Pre-Registration Open</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-8 max-w-5xl">
          <div className="space-y-2">
            <h2 className="text-cyan-400 font-bold tracking-[.5em] text-sm md:text-base uppercase">Epic Space Fantasy RPG</h2>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">
              CRYSTAL<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">NEBULA</span>
            </h1>
          </div>

          <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
            다음에 펼쳐질 당신의 대서사시. <br className="hidden md:block" />
            성계의 운명을 결정할 마지막 Crystal을 찾아 행성에 합류하세요.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <button className="group relative px-12 py-5 bg-cyan-500 text-black font-black text-xl rounded-sm overflow-hidden transition-all hover:pr-14 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]">
            <span className="relative z-10">지금 바로 사전 예약</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span>
          </button>

          <button className="px-12 py-5 glass-morphism border-white/10 text-white font-bold text-xl rounded-sm hover:bg-white/5 transition-all">
            공식 트레일러
          </button>
        </div>

        {/* Dynamic Image Placeholder (Stylized CSS Box) */}
        <div className="relative mt-12 w-full max-w-5xl aspect-video rounded-2xl overflow-hidden glass-morphism border-white/5 shadow-2xl group flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
          <div className="z-10 text-center space-y-4">
            <div className="text-6xl text-white/10 font-black italic">ULTRA GRAPHICS</div>
            <div className="text-sm tracking-widest text-cyan-400/50 uppercase font-bold">In-Game Footage Cinematic Preview</div>
          </div>
          {/* Subtle frame corners */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30"></div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-24 w-full max-w-6xl">
          {[
            { tag: "01", title: "Universe", desc: "1,000개 이상의 행성, 끊임없이 확장되는 오픈월드 모험" },
            { tag: "02", title: "Combat", desc: "직관적이고 화려한 타격감의 하이퍼 액션 시스템" },
            { tag: "03", title: "Social", desc: "전 세계 플레이어와 함께하는 대규모 길드 전쟁" },
          ].map((feature, idx) => (
            <div key={idx} className="relative p-8 text-left border-l border-white/10 hover:border-cyan-500/50 transition-colors group">
              <span className="text-xs font-bold text-cyan-600 mb-4 block tracking-tighter">{feature.tag}</span>
              <h3 className="text-2xl font-black text-white mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-7xl px-8 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 mt-20 text-zinc-600 text-[10px] tracking-widest uppercase font-bold">
        <div className="flex items-center gap-12">
          <span>© 2026 NEBULA GAMES INC.</span>
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
        </div>
        <div className="flex items-center gap-4 grayscale opacity-40">
          <div className="w-8 h-8 bg-zinc-800 rounded-sm"></div>
          <div className="w-8 h-8 bg-zinc-800 rounded-sm"></div>
          <div className="w-8 h-8 bg-zinc-800 rounded-sm"></div>
        </div>
      </footer>
    </div>
  );
}
