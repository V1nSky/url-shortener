import UrlShortenerForm from '../components/UrlShortenerForm';
import UrlList from '../components/UrlList';
import { Link2 } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Glow blobs */}
      <div className="fixed w-[600px] h-[600px] rounded-full pointer-events-none" style={{
        background: '#7c6bff', filter: 'blur(120px)', opacity: 0.08,
        top: '-200px', right: '-100px', animation: 'drift 20s ease-in-out infinite'
      }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none" style={{
        background: '#ff6b9d', filter: 'blur(120px)', opacity: 0.07,
        bottom: '100px', left: '-100px', animation: 'drift 25s ease-in-out infinite reverse'
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-6 h-6 text-[#7c6bff]" />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Mono', monospace" }}>
              lnk<span className="text-[#7c6bff]">.</span>dev
            </span>
          </div>
          <div className="text-xs text-[#7c6bff] border border-[#7c6bff]/40 rounded-lg px-3 py-1.5" style={{ fontFamily: "'Space Mono', monospace" }}>
            BETA
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-24 space-y-16">
        <div className="text-center space-y-5 animate-fade-up-delay-1">
          <p className="text-xs text-[#7c6bff] uppercase tracking-[4px]" style={{ fontFamily: "'Space Mono', monospace" }}>
            ✦ URL Shortener with Analytics
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-3px] leading-none">
            Short links.<br />
            <span className="bg-gradient-to-r from-[#7c6bff] to-[#ff6b9d] bg-clip-text text-transparent">
              Big data.
            </span>
          </h1>
          <p className="text-[#666680] text-lg max-w-lg mx-auto leading-relaxed">
            Create short links, track clicks in real-time.<br />
            Know your audience — countries, devices, referrers.
          </p>
        </div>

        <div className="animate-fade-up-delay-2">
          <UrlShortenerForm />
        </div>

        <div className="animate-fade-up-delay-3">
          <UrlList />
        </div>
      </main>

      <footer className="border-t border-[#2a2a3a] py-8 text-center">
        <p className="text-xs text-[#444460]" style={{ fontFamily: "'Space Mono', monospace" }}>
          Built with React · TypeScript · PostgreSQL
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
